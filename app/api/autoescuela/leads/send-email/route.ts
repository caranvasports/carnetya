import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { assignmentId, message } = await req.json()
    if (!assignmentId) return NextResponse.json({ error: 'assignmentId requerido' }, { status: 400 })

    const supabase = createServiceClient()

    // Get assignment + lead + autoescuela info
    const { data: assignment, error } = await supabase
      .from('lead_assignments')
      .select(`
        id,
        autoescuela_id,
        lead:leads(nombre, email, ciudad:ciudades(nombre)),
        autoescuela:autoescuelas(nombre, plan)
      `)
      .eq('id', assignmentId)
      .single()

    if (error || !assignment) {
      return NextResponse.json({ error: 'Asignación no encontrada' }, { status: 404 })
    }

    const lead = assignment.lead as { nombre: string; email: string; ciudad?: { nombre: string } }
    const autoescuela = assignment.autoescuela as { nombre: string; plan: string }

    // Only paid plans can send emails
    if (autoescuela.plan === 'free') {
      return NextResponse.json({ error: 'Plan gratuito no puede enviar emails' }, { status: 403 })
    }

    const nombreAlumno = lead.nombre?.split(' ')[0] ?? 'alumno'
    const ciudad = (lead.ciudad as { nombre?: string } | null)?.nombre ?? ''

    const body = message?.trim()
      ? message
      : `Hola ${nombreAlumno},<br><br>
Soy de <strong>${autoescuela.nombre}</strong>, tu autoescuela en ${ciudad}.<br><br>
Hemos recibido tu solicitud de información sobre el carnet de conducir y nos encantaría ayudarte.<br><br>
¿Cuándo te vendría bien que te llamemos para contarte todo sin compromiso?<br><br>
Un saludo,<br>
<strong>${autoescuela.nombre}</strong>`

    const subject = `Tu solicitud de carnet en ${ciudad} — ${autoescuela.nombre}`
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
  <div style="background:#1B4FFF;padding:20px 24px;border-radius:12px 12px 0 0;">
    <h2 style="color:#fff;margin:0;font-size:20px;">${autoescuela.nombre}</h2>
  </div>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;padding:28px 24px;border-radius:0 0 12px 12px;">
    <p style="margin:0 0 16px 0;line-height:1.6;">${body}</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="font-size:12px;color:#9ca3af;margin:0;">
      Recibes este email porque solicitaste información sobre el carnet de conducir en CarnetYa.es
    </p>
  </div>
</body>
</html>`

    await sendEmail(lead.email, subject, html)

    // Mark as contacted
    await supabase
      .from('lead_assignments')
      .update({ estado: 'contactado', contactado_at: new Date().toISOString() })
      .eq('id', assignmentId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[send-email]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
