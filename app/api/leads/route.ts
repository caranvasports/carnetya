import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import { createServiceClient } from '@/lib/supabase/server'
import { ensureLeadsTable } from '@/lib/db-setup'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'carnetyainfo@gmail.com'

function buildEmailHtml(data: {
  nombre: string; telefono: string; email: string; ciudad: string
  urgencia: string; edad?: number; tiene_experiencia?: boolean; utm_source?: string
}) {
  const urgenciaLabel = data.urgencia === 'rapido' ? '🔴 URGENTE' : '🟡 Normal'
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1d4ed8;padding:24px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">🚗 Nuevo lead — CarnetYa</h1>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:120px">Nombre</td><td style="padding:8px 0;font-weight:600">${data.nombre}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Teléfono</td><td style="padding:8px 0;font-weight:600"><a href="tel:${data.telefono}" style="color:#1d4ed8">${data.telefono}</a></td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td><td style="padding:8px 0;font-weight:600"><a href="mailto:${data.email}" style="color:#1d4ed8">${data.email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Ciudad</td><td style="padding:8px 0;font-weight:600">${data.ciudad}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Urgencia</td><td style="padding:8px 0;font-weight:600">${urgenciaLabel}</td></tr>
          ${data.edad ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Edad</td><td style="padding:8px 0">${data.edad} años</td></tr>` : ''}
          ${data.tiene_experiencia ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Exp. previa</td><td style="padding:8px 0">Sí</td></tr>` : ''}
          ${data.utm_source ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Fuente</td><td style="padding:8px 0">${data.utm_source}</td></tr>` : ''}
        </table>
        <div style="margin-top:20px">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carnetya.es'}/admin/leads"
             style="background:#1d4ed8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            Ver en el panel admin →
          </a>
        </div>
      </div>
      <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:16px">CarnetYa · carnetya.es</p>
    </div>
  `
}

async function sendEmail(subject: string, html: string) {
  // Gmail SMTP via App Password (GMAIL_APP_PASSWORD en Vercel env vars)
  if (process.env.GMAIL_APP_PASSWORD) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: ADMIN_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
    await transporter.sendMail({
      from: `CarnetYa <${ADMIN_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject,
      html,
    })
    console.log('[CarnetYa] Email enviado via Gmail a', ADMIN_EMAIL)
    return
  }
  // Fallback: Resend (solo si hay key real, no placeholder)
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey && !resendKey.startsWith('re_placeholder')) {
    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? `CarnetYa <noreply@carnetya.es>`,
      to: ADMIN_EMAIL,
      subject,
      html,
    })
    console.log('[CarnetYa] Email enviado via Resend a', ADMIN_EMAIL)
    return
  }
  // Sin credenciales configuradas — log completo en Vercel/servidor
  console.warn('[CarnetYa] ⚠️  EMAIL NO ENVIADO — Añade GMAIL_APP_PASSWORD en Vercel env vars')
  console.log('[CarnetYa] Datos del lead:', subject)
}

const schema = z.object({
  nombre:            z.string().min(2).max(100),
  telefono:          z.string().regex(/^[6-9]\d{8}$/),
  email:             z.string().email().max(200),
  ciudad:            z.string().min(1).max(80),
  tipo_carnet:       z.string().max(20).optional(),
  edad:              z.coerce.number().min(14).max(99).optional(),
  tiene_experiencia: z.boolean().optional().default(false),
  urgencia:          z.enum(['rapido', 'normal']).default('normal'),
  fuente_url:        z.string().optional(),
  utm_source:        z.string().max(100).optional(),
  utm_medium:        z.string().max(100).optional(),
  utm_campaign:      z.string().max(100).optional(),
})

async function findCiudadId(supabase: ReturnType<typeof createServiceClient>, ciudadSlug: string) {
  const { data } = await supabase
    .from('ciudades')
    .select('id')
    .eq('slug', ciudadSlug)
    .maybeSingle()

  return data?.id ?? null
}

async function assignLeadToAutoescuelas(
  supabase: ReturnType<typeof createServiceClient>,
  leadId: string,
  ciudadId: string | null,
) {
  if (!ciudadId) return

  const { data: autoescuelas, error } = await supabase
    .from('autoescuelas')
    .select('id, plan')
    .eq('ciudad_id', ciudadId)
    .eq('activa', true)
    .order('destacada', { ascending: false })
    .limit(3)

  if (error || !autoescuelas?.length) return

  const assignments = autoescuelas.map((autoescuela: { id: string; plan?: string | null }) => ({
    lead_id: leadId,
    autoescuela_id: autoescuela.id,
    precio_lead: autoescuela.plan === 'premium' ? 8 : 5,
  }))

  await supabase.from('lead_assignments').upsert(assignments, { onConflict: 'lead_id,autoescuela_id' })
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0'

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { ciudad: ciudadSlug, tipo_carnet, ...rest } = parsed.data

  // Guardar en Supabase con auto-creación de tabla si no existe
  let leadId: string | null = null
  try {
    const supabase = createServiceClient()
    const ciudadId = await findCiudadId(supabase, ciudadSlug)

    const leadPayload = {
      ...rest,
      ciudad_id: ciudadId,
      tipo_carnet,
      ip_address: ip,
    }

    const doInsert = () => supabase
      .from('leads')
      .insert(leadPayload)
      .select('id')
      .single()

    let { data: lead, error: insertError } = await doInsert()

    if (insertError && insertError.message.includes("'tipo_carnet'")) {
      const { tipo_carnet: _tipoCarnet, ...payloadWithoutTipoCarnet } = leadPayload
      const retry = await supabase
        .from('leads')
        .insert(payloadWithoutTipoCarnet)
        .select('id')
        .single()
      lead = retry.data
      insertError = retry.error
    }

    // Si la tabla no existe, crearla y reintentar
    if (insertError && ((insertError as { code?: string }).code === '42P01' || insertError.message.includes('does not exist'))) {
      console.log('[CarnetYa] Tabla leads no existe, creando...')
      await ensureLeadsTable()
      const retry = await doInsert()
      lead = retry.data
      insertError = retry.error
    }

    if (insertError) throw insertError

    if (lead) {
      leadId = lead.id
      await assignLeadToAutoescuelas(supabase, lead.id, ciudadId)
    }
  } catch (dbErr) {
    console.warn('[CarnetYa] Error guardando lead en BD:', dbErr)
  }

  // Enviar email — siempre intentamos (no bloqueamos la respuesta si falla)
  try {
    const subject = `[CarnetYa] Nuevo lead — ${parsed.data.nombre} (${parsed.data.ciudad})`
    const html = buildEmailHtml(parsed.data)
    await sendEmail(subject, html)
  } catch (emailErr) {
    console.error('[CarnetYa] Error enviando email:', emailErr)
  }

  return NextResponse.json({ success: true, leadId }, { status: 201 })
}



