import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  let assignmentId: string | undefined
  let autoescuelaId: string | undefined
  let leadId: string | undefined
  let subject = ''
  let html = ''

  try {
    const body = await req.json()
    assignmentId = body.assignmentId
    const customMessage: string | undefined = body.message

    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId requerido' }, { status: 400 })
    }

    // Fetch assignment with lead and autoescuela separately to avoid join type issues
    const { data: assignment, error: aErr } = await supabase
      .from('lead_assignments')
      .select('id, autoescuela_id, lead_id')
      .eq('id', assignmentId)
      .single()

    if (aErr || !assignment) {
      return NextResponse.json({ error: 'Asignación no encontrada' }, { status: 404 })
    }

    autoescuelaId = assignment.autoescuela_id as string
    leadId = assignment.lead_id as string

    const [{ data: lead, error: lErr }, { data: autoescuela, error: aeErr }] = await Promise.all([
      supabase.from('leads').select('nombre, email, ciudad_id').eq('id', leadId).single(),
      supabase.from('autoescuelas').select('nombre, plan').eq('id', autoescuelaId).single(),
    ])

    if (lErr || !lead) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
    }
    if (aeErr || !autoescuela) {
      return NextResponse.json({ error: 'Autoescuela no encontrada' }, { status: 404 })
    }

    // Fetch ciudad name if available
    let ciudadNombre = ''
    if (lead.ciudad_id) {
      const { data: ciudad } = await supabase
        .from('ciudades')
        .select('nombre')
        .eq('id', lead.ciudad_id)
        .single()
      ciudadNombre = ciudad?.nombre ?? ''
    }

    const nombreAlumno = (lead.nombre as string)?.split(' ')[0] ?? 'alumno'
    const nombreAutoescuela = autoescuela.nombre as string

    const bodyHtml = customMessage?.trim()
      ? customMessage.replace(/\n/g, '<br>')
      : `Hola ${nombreAlumno},<br><br>
Soy de <strong>${nombreAutoescuela}</strong>${ciudadNombre ? `, tu autoescuela en ${ciudadNombre}` : ''}.<br><br>
Hemos recibido tu solicitud de información sobre el carnet de conducir y nos encantaría ayudarte a conseguirlo lo antes posible.<br><br>
¿Cuándo te vendría bien que te llamemos para contarte todo sin compromiso?<br><br>
Un saludo,<br>
<strong>${nombreAutoescuela}</strong>`

    subject = `Tu solicitud de carnet${ciudadNombre ? ` en ${ciudadNombre}` : ''} — ${nombreAutoescuela}`
    html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;color:#1a1a1a;background:#f3f4f6;">
  <div style="background:#1B4FFF;padding:24px 28px;">
    <h2 style="color:#fff;margin:0;font-size:20px;letter-spacing:-0.3px;">${nombreAutoescuela}</h2>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">Autoescuela en CarnetYa.es</p>
  </div>
  <div style="background:#fff;padding:32px 28px;">
    <p style="margin:0 0 20px;line-height:1.7;font-size:15px;">${bodyHtml}</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
    <p style="font-size:11px;color:#9ca3af;margin:0;">
      Recibes este email porque solicitaste información sobre el carnet de conducir en
      <a href="https://carnetya.es" style="color:#1B4FFF;">CarnetYa.es</a>
    </p>
  </div>
</body>
</html>`

    // Send the email
    const result = await sendEmail(lead.email as string, subject, html)

    // Log to contact_log
    await supabase.from('contact_log').insert({
      autoescuela_id: autoescuelaId,
      lead_id: leadId,
      assignment_id: assignmentId,
      tipo: 'email',
      asunto: subject,
      mensaje_html: html,
      enviado_ok: result.sent,
      error_msg: result.sent ? null : 'No email provider configured',
    })

    if (!result.sent) {
      return NextResponse.json({ error: 'No se pudo enviar: falta configuración de email' }, { status: 500 })
    }

    // Mark assignment as contacted
    await supabase
      .from('lead_assignments')
      .update({ estado: 'contactado', contactado_at: new Date().toISOString() })
      .eq('id', assignmentId)

    return NextResponse.json({ ok: true, provider: result.provider })

  } catch (err) {
    console.error('[send-email]', err)
    // Try to log the error if we have enough context
    if (autoescuelaId && leadId) {
      await supabase.from('contact_log').insert({
        autoescuela_id: autoescuelaId,
        lead_id: leadId,
        assignment_id: assignmentId ?? null,
        tipo: 'email',
        asunto: subject || 'error',
        enviado_ok: false,
        error_msg: err instanceof Error ? err.message : 'Error desconocido',
      }).catch(() => null)
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error interno' }, { status: 500 })
  }
}
