import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'carnetyainfo@gmail.com'
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'CarnetYa <noreply@carnetya.es>'

const schema = z.object({
  nombre:            z.string().min(2).max(100),
  telefono:          z.string().regex(/^[6-9]\d{8}$/),
  email:             z.string().email().max(200),
  ciudad:            z.string().min(1).max(80),       // slug
  edad:              z.coerce.number().min(14).max(99).optional(),
  tiene_experiencia: z.boolean().optional().default(false),
  urgencia:          z.enum(['rapido', 'normal']).default('normal'),
  fuente_url:        z.string().url().optional(),
  utm_source:        z.string().max(100).optional(),
  utm_medium:        z.string().max(100).optional(),
  utm_campaign:      z.string().max(100).optional(),
})

export async function POST(req: NextRequest) {
  // Rate limit básico por IP (puede ampliarse con Redis/Upstash)
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

  const { ciudad: ciudadSlug, ...rest } = parsed.data
  const supabase = createServiceClient()

  // Buscar ciudad
  const { data: ciudad } = await supabase
    .from('ciudades')
    .select('id')
    .eq('slug', ciudadSlug)
    .single()

  // Insertar lead
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      ...rest,
      ciudad_id: ciudad?.id ?? null,
      ip_address: ip,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creando lead:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }

  // Asignar lead a autoescuelas destacadas/premium de la ciudad (máx 3)
  if (ciudad?.id) {
    const { data: autoescuelas } = await supabase
      .from('autoescuelas')
      .select('id, plan')
      .eq('ciudad_id', ciudad.id)
      .eq('activa', true)
      .in('plan', ['premium', 'basic'])
      .order('destacada', { ascending: false })
      .order('rating_promedio', { ascending: false })
      .limit(3)

    if (autoescuelas && autoescuelas.length > 0) {
      const assignments = autoescuelas.map((ae) => ({
        lead_id: lead.id,
        autoescuela_id: ae.id,
        precio_lead: ae.plan === 'premium' ? 8 : 5,
        estado: 'enviado' as const,
      }))

      await supabase.from('lead_assignments').insert(assignments)

      // Marcar lead como asignado
      await supabase
        .from('leads')
        .update({ estado: 'asignado' })
        .eq('id', lead.id)
    }
  }

  // Enviar email de notificación al admin
  try {
    const urgenciaLabel = parsed.data.urgencia === 'rapido' ? '🔴 URGENTE' : '🟡 Normal'
    await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `[CarnetYa] Nuevo lead — ${parsed.data.nombre} (${parsed.data.ciudad})`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1d4ed8;padding:24px;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0;font-size:20px">🚗 Nuevo lead recibido</h1>
          </div>
          <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Nombre</td><td style="padding:8px 0;font-weight:600">${parsed.data.nombre}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Teléfono</td><td style="padding:8px 0;font-weight:600"><a href="tel:${parsed.data.telefono}">${parsed.data.telefono}</a></td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td><td style="padding:8px 0;font-weight:600"><a href="mailto:${parsed.data.email}">${parsed.data.email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Ciudad</td><td style="padding:8px 0;font-weight:600">${parsed.data.ciudad}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Urgencia</td><td style="padding:8px 0;font-weight:600">${urgenciaLabel}</td></tr>
              ${parsed.data.edad ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Edad</td><td style="padding:8px 0">${parsed.data.edad} años</td></tr>` : ''}
              ${parsed.data.tiene_experiencia ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Experiencia previa</td><td style="padding:8px 0">Sí</td></tr>` : ''}
              ${parsed.data.utm_source ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Fuente</td><td style="padding:8px 0">${parsed.data.utm_source}</td></tr>` : ''}
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
      `,
    })
  } catch (emailErr) {
    // No bloqueamos la respuesta si el email falla
    console.error('Error enviando email de lead:', emailErr)
  }

  return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 })
}
