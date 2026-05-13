import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { assignmentId, message: customMessage } = body as { assignmentId?: string; message?: string }

    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId requerido' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: assignment, error: aErr } = await supabase
      .from('lead_assignments')
      .select('id, autoescuela_id, lead_id')
      .eq('id', assignmentId)
      .single()

    if (aErr || !assignment) {
      return NextResponse.json({ error: 'Asignacion no encontrada' }, { status: 404 })
    }

    const [{ data: lead, error: lErr }, { data: ae, error: aeErr }] = await Promise.all([
      supabase.from('leads').select('nombre, email, ciudad_id').eq('id', assignment.lead_id as string).single(),
      supabase.from('autoescuelas').select('nombre, plan, email').eq('id', assignment.autoescuela_id as string).single(),
    ])

    if (lErr || !lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
    if (aeErr || !ae) return NextResponse.json({ error: 'Autoescuela no encontrada' }, { status: 404 })
    if ((ae.plan as string) === 'free') return NextResponse.json({ error: 'Plan gratuito no incluye emails' }, { status: 403 })

    let ciudadNombre = ''
    if (lead.ciudad_id) {
      const { data: ciudad } = await supabase.from('ciudades').select('nombre').eq('id', lead.ciudad_id as string).single()
      ciudadNombre = (ciudad?.nombre as string) ?? ''
    }

    const aeName = ae.nombre as string
    const leadNombre = lead.nombre as string
    const leadEmail = lead.email as string
    const aeEmail = ae.email as string | undefined

    const msgText = customMessage ??
      'Hola ' + leadNombre + ',\n\nSoy de ' + aeName + (ciudadNombre ? ', tu autoescuela en ' + ciudadNombre : '') +
      '. Hemos visto que estas interesado/a en sacarte el carnet de conducir y nos gustaria ayudarte.' +
      '\n\nContacta con nosotros para mas informacion o pide cita directamente.\n\n¡Te esperamos!'

    const bodyHtml = msgText.replace(/\n/g, '<br>')
    const subject = aeName + ' te escribe - CarnetYa'
    const leadHtml =
      '<!DOCTYPE html><html><head><meta charset="utf-8"></head>' +
      '<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f3f4f6;">' +
      '<div style="background:#1B4FFF;padding:24px 28px;border-radius:8px 8px 0 0;">' +
      '<h2 style="color:#fff;margin:0;font-size:20px;">' + aeName + '</h2>' +
      '<p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">Autoescuela en CarnetYa.es</p>' +
      '</div><div style="background:#fff;padding:32px 28px;border-radius:0 0 8px 8px;">' +
      '<p style="line-height:1.7;font-size:15px;color:#1a1a1a;">' + bodyHtml + '</p>' +
      '<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">' +
      '<p style="font-size:11px;color:#9ca3af;">Recibes este email porque solicitaste informacion en ' +
      '<a href="https://carnetya.es" style="color:#1B4FFF;">CarnetYa.es</a></p>' +
      '</div></body></html>'

    // 1. Send email to the lead (no CC)
    await sendEmail(leadEmail, subject, leadHtml)

    // 2. Send a CarnetYa confirmation to the autoescuela (clearly from CarnetYa TO the autoescuela)
    if (aeEmail) {
      const confirmSubject = 'Confirmacion: contactaste a ' + leadNombre + ' - CarnetYa'
      const confirmHtml =
        '<!DOCTYPE html><html><head><meta charset="utf-8"></head>' +
        '<body style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f3f4f6;">' +
        '<div style="background:#16a34a;padding:20px 24px;border-radius:8px 8px 0 0;">' +
        '<h2 style="color:#fff;margin:0;font-size:18px;">&#10003; Email enviado correctamente</h2>' +
        '</div><div style="background:#fff;padding:28px 24px;border-radius:0 0 8px 8px;">' +
        '<p style="font-size:14px;color:#374151;margin:0 0 16px;">CarnetYa confirma que <strong>' + aeName + '</strong> ha contactado a:</p>' +
        '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:14px 16px;margin-bottom:16px;">' +
        '<p style="margin:0;font-size:15px;font-weight:600;color:#111827;">' + leadNombre + '</p>' +
        '<p style="margin:4px 0 0;font-size:13px;color:#374151;">' + leadEmail + '</p>' +
        '</div>' +
        '<p style="font-size:13px;color:#6b7280;margin:0;">Gestiona tus leads en ' +
        '<a href="https://carnetya.es/autoescuela/leads" style="color:#1B4FFF;">carnetya.es/autoescuela/leads</a></p>' +
        '</div></body></html>'
      sendEmail(aeEmail, confirmSubject, confirmHtml).catch(err => console.error('[send-email] confirm failed:', err))
    }

    // Update assignment estado
    await supabase
      .from('lead_assignments')
      .update({ estado: 'contactado', contactado_at: new Date().toISOString() })
      .eq('id', assignmentId)

    return NextResponse.json({ ok: true, sentTo: leadEmail })

  } catch (err) {
    console.error('[send-email] error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error interno' }, { status: 500 })
  }
}
