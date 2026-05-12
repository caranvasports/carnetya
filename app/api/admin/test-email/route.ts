import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { createServiceClient } from '@/lib/supabase/server'
import { getAdminSessionFromRequest } from '@/lib/admin-auth'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'carnetyainfo@gmail.com'

// GET — check email config health
export async function GET() {
  const config = {
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? '✅ configurado' : '❌ falta',
    RESEND_API_KEY: process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_placeholder') ? '✅ configurado' : '❌ falta o es placeholder',
    ADMIN_EMAIL,
  }

  if (!process.env.GMAIL_APP_PASSWORD && !process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, mensaje: 'No hay proveedor de email configurado.', config }, { status: 400 })
  }

  try {
    const result = await sendEmail(ADMIN_EMAIL, '✅ Test email CarnetYa — funciona', '<p>Si recibes esto, el email está correctamente configurado en CarnetYa.</p>')
    return NextResponse.json({ ok: true, mensaje: `Email de prueba enviado a ${ADMIN_EMAIL}`, config, ...result })
  } catch (err) {
    return NextResponse.json({ ok: false, mensaje: 'Error: ' + (err instanceof Error ? err.message : String(err)), config }, { status: 500 })
  }
}

// POST — send a specific template preview to admin (or given email)
export async function POST(req: NextRequest) {
  const session = getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { templateId, to } = await req.json().catch(() => ({}))
  if (!templateId) return NextResponse.json({ error: 'templateId requerido' }, { status: 400 })

  const supabase = createServiceClient()
  const { data: tpl } = await supabase
    .from('email_templates')
    .select('subject, html')
    .eq('id', templateId)
    .maybeSingle()

  if (!tpl) return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 })

  // Replace vars with visible demo values
  const DEMO: Record<string, string> = {
    nombre: 'Ana García',
    telefono: '612 345 678',
    email: 'ana@ejemplo.com',
    ciudad: 'Madrid',
    urgencia: '🔴 URGENTE',
    tipo_carnet: 'B (coche)',
    utm_source: 'web',
    admin_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carnetya.es'}/admin/leads`,
    nombre_autoescuela: 'Autoescuela Ejemplo',
    panel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carnetya.es'}/autoescuela/leads`,
    registro_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carnetya.es'}/autoescuela/registro`,
    paypal_url: 'https://www.paypal.com/paypalme/carnetya',
    precio_lead: '8',
    num_leads: '3',
    dias: '2',
    contacto_nombre: 'Ana García',
  }

  const subject = tpl.subject.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_: string, k: string) => DEMO[k] ?? `{{${k}}}`)
  const html = tpl.html.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_: string, k: string) => DEMO[k] ?? `{{${k}}}`)

  const dest = (typeof to === 'string' && to.includes('@')) ? to : ADMIN_EMAIL

  try {
    await sendEmail(dest, `[PREVIEW] ${subject}`, html)
    return NextResponse.json({ ok: true, mensaje: `Email de prueba enviado a ${dest}` })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

