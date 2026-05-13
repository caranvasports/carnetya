import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'carnetyainfo@gmail.com'

async function createTransporter() {
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!pass) throw new Error('GMAIL_APP_PASSWORD no configurado')
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: ADMIN_EMAIL, pass },
  })
}

async function sendLeadEmail(to: string, subject: string, html: string) {
  const transporter = await createTransporter()
  const info = await transporter.sendMail({
    from: `CarnetYa <${ADMIN_EMAIL}>`,
    to,
    subject,
    html,
  })
  console.log('[send-email] sent to lead:', info.messageId)
  return { sent: true }
}

async function sendConfirmationToAutoescuela(
  autoescuelaEmail: string,
  leadNombre: string,
  leadEmail: string,
  nombreAutoescuela: string,
) {
  const transporter = await createTransporter()
  const confirmHtml = [
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head>',
    '<body style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:0;background:#f3f4f6;">',
    '<div style="background:#16a34a;padding:20px 24px;border-radius:8px 8px 0 0;">',
    '<h2 style="color:#fff;margin:0;font-size:18px;">&#10003; Email enviado correctamente</h2>',
    '</div>',
    '<div style="background:#fff;padding:28px 24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:none;">',
    '<p style="font-size:14px;color:#374151;margin:0 0 16px;">Tu email ha sido enviado desde <strong>' + nombreAutoescuela + '</strong>:</p>',
    '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:14px 16px;margin-bottom:16px;">',
    '<p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Destinatario</p>',
    '<p style="margin:0;font-size:15px;font-weight:600;color:#111827;">' + leadNombre + '</p>',
    '<p style="margin:2px 0 0;font-size:13px;color:#374151;">' + leadEmail + '</p>',
    '</div>',
    '<p style="font-size:13px;color:#6b7280;margin:0;">Gestiona tus leads en <a href="https://carnetya.es/autoescuela/leads" style="color:#1B4FFF;">carnetya.es/autoescuela/leads</a></p>',
    '</div></body></html>',
  ].join('\n')
  const info = await transporter.sendMail({
    from: 'CarnetYa <' + ADMIN_EMAIL + '>',
    to: autoescuelaEmail,
    subject: 'Confirmacion: email enviado a ' + leadNombre + ' - CarnetYa',
    html: confirmHtml,
  })
  console.log('[send-email] confirmation sent to ae:', info.messageId)
}

export async function POST(req: NextRequest) {
  let assignmentId: string | undefined
  let autoescuelaId: string | undefined
  let leadId: string | undefined
  let subject = ''
  let html = ''
  let supabase: ReturnType<typeof createServiceClient>

  try {
    supabase = createServiceClient()
    const body = await req.json()
    assignmentId = body.assignmentId
    const customMessage: string | undefined = body.message

    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId requerido' }, { status: 400 })
    }

    const { data: assignment, error: aErr } = await supabase
      .from('lead_assignments')
      .select('id, autoescuela_id, lead_id')
      .eq('id', assignmentId)
      .single()

    if (aErr || !assignment) {
      return NextResponse.json({ error: 'Asignacion no encontrada' }, { status: 404 })
    }

    autoescuelaId = assignment.autoescuela_id as string
    leadId = assignment.lead_id as string

    const [{ data: lead, error: lErr }, { data: autoescuela, error: aeErr }] = await Promise.all([
      supabase.from('leads').select('nombre, email, ciudad_id').eq('id', leadId).single(),
      supabase.from('autoescuelas').select('nombre, plan, email').eq('id', autoescuelaId).single(),
    ])

    if (lErr || !lead) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
    }
    if (aeErr || !autoescuela) {
      return NextResponse.json({ error: 'Autoescuela no encontrada' }, { status: 404 })
    }

    const nombreAutoescuela = autoescuela.nombre as string
    const autoescuelaEmail = autoescuela.email as string | undefined

    if ((autoescuela.plan as string) === 'free') {
      return NextResponse.json({ error: 'Plan gratuito no incluye envio de emails' }, { status: 403 })
    }

    let ciudadNombre = ''
    if (lead.ciudad_id) {
      const { data: ciudad } = await supabase
        .from('ciudades')
        .select('nombre')
        .eq('id', lead.ciudad_id)
        .single()
      ciudadNombre = ciudad?.nombre ?? ''
    }

    const defaultMessage = customMessage ??
      'Hola ' + (lead.nombre as string) + ',\n\nSoy de ' + nombreAutoescuela + (ciudadNombre ? ', tu autoescuela en ' + ciudadNombre : '') + '. Hemos visto que estas interesado/a en sacarte el carnet de conducir y nos gustaria ayudarte.\n\nContacta con nosotros para mas informacion o pide cita directamente.\n\n¡Te esperamos!'

    const bodyHtml = defaultMessage.replace(/\n/g, '<br>')
    subject = nombreAutoescuela + ' te escribe - CarnetYa'
    html = [
      '<!DOCTYPE html><html><head><meta charset="utf-8"></head>',
      '<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;color:#1a1a1a;background:#f3f4f6;">',
      '<div style="background:#1B4FFF;padding:24px 28px;">',
      '<h2 style="color:#fff;margin:0;font-size:20px;">' + nombreAutoescuela + '</h2>',
      '<p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">Autoescuela en CarnetYa.es</p>',
      '</div>',
      '<div style="background:#fff;padding:32px 28px;">',
      '<p style="margin:0 0 20px;line-height:1.7;font-size:15px;">' + bodyHtml + '</p>',
      '<hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">',
      '<p style="font-size:11px;color:#9ca3af;margin:0;">Recibes este email porque solicitaste informacion sobre el carnet en <a href="https://carnetya.es" style="color:#1B4FFF;">CarnetYa.es</a></p>',
      '</div></body></html>',
    ].join('\n')

    const result = await sendLeadEmail(lead.email as string, subject, html)

    if (autoescuelaEmail) {
      sendConfirmationToAutoescuela(
        autoescuelaEmail,
        lead.nombre as string,
        lead.email as string,
        nombreAutoescuela,
      ).catch(err => console.error('[send-email] confirmation failed:', err))
    }

    await supabase.from('contact_log').insert({
      autoescuela_id: autoescuelaId,
      lead_id: leadId,
      assignment_id: assignmentId,
      tipo: 'email',
      asunto: subject,
      mensaje_html: html,
      enviado_ok: result.sent,
      error_msg: null,
    }).catch(() => null)

    await supabase
      .from('lead_assignments')
      .update({ estado: 'contactado', contactado_at: new Date().toISOString() })
      .eq('id', assignmentId)

    return NextResponse.json({ ok: true, sentTo: lead.email })

  } catch (err) {
    console.error('[send-email] caught:', err)
    const errMsg = err instanceof Error ? err.message : String(err)
    if (autoescuelaId && leadId) {
      await supabase.from('contact_log').insert({
        autoescuela_id: autoescuelaId,
        lead_id: leadId,
        assignment_id: assignmentId ?? null,
        tipo: 'email',
        asunto: subject || 'error',
        enviado_ok: false,
        error_msg: errMsg,
      }).catch(() => null)
    }
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
