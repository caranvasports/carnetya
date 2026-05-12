import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { getAdminSessionFromRequest } from '@/lib/admin-auth'

const DEFAULT_TEMPLATES = [
  {
    id: 'admin_nuevo_lead',
    nombre: 'Admin: nuevo lead recibido',
    subject: '[CarnetYa] Nuevo lead — {{nombre}} ({{ciudad}})',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><div style="background:#1d4ed8;padding:24px;border-radius:12px 12px 0 0"><h1 style="color:white;margin:0;font-size:20px">🚗 Nuevo lead — CarnetYa</h1></div><div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:120px">Nombre</td><td style="font-weight:600">{{nombre}}</td></tr><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Teléfono</td><td style="font-weight:600"><a href="tel:{{telefono}}" style="color:#1d4ed8">{{telefono}}</a></td></tr><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td><td style="font-weight:600"><a href="mailto:{{email}}" style="color:#1d4ed8">{{email}}</a></td></tr><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Ciudad</td><td style="font-weight:600">{{ciudad}}</td></tr><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Urgencia</td><td style="font-weight:600">{{urgencia}}</td></tr></table><div style="margin-top:20px"><a href="{{admin_url}}" style="background:#1d4ed8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Ver en panel admin →</a></div></div></div>`,
    activa: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'nueva_autoescuela',
    nombre: 'Confirmación nueva autoescuela',
    subject: 'Bienvenido a CarnetYa, {{nombre_autoescuela}}',
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto"><h1 style="color:#1d4ed8">¡Bienvenido a CarnetYa!</h1><p>Hola <strong>{{nombre_autoescuela}}</strong>,</p><p>Tu autoescuela ha sido registrada correctamente en CarnetYa. Ya puedes acceder a tu panel.</p><p><a href="{{panel_url}}" style="background:#1d4ed8;color:white;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin:16px 0">Acceder al panel →</a></p><p style="color:#64748b;font-size:14px">Ciudad: {{ciudad}}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"><p style="color:#94a3b8;font-size:12px">CarnetYa · carnetya.es</p></div>`,
    activa: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'nuevo_lead_autoescuela',
    nombre: 'Nuevo lead para autoescuela registrada',
    subject: 'Nuevo alumno interesado en {{ciudad}}',
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto"><div style="background:#1d4ed8;padding:24px;border-radius:12px 12px 0 0"><h1 style="color:white;margin:0;font-size:20px">🎓 Nuevo alumno interesado</h1></div><div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0"><p>Hay un alumno interesado en sacarse el carnet en <strong>{{ciudad}}</strong>.</p><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Ciudad</td><td style="font-weight:600">{{ciudad}}</td></tr><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Urgencia</td><td style="font-weight:600">{{urgencia}}</td></tr><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Carnet</td><td style="font-weight:600">{{tipo_carnet}}</td></tr></table><p style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px;font-size:14px">Para ver los datos completos, accede a tu panel.</p><p><a href="{{panel_url}}" style="background:#1d4ed8;color:white;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin:16px 0">Ver lead en mi panel →</a></p></div><p style="color:#94a3b8;font-size:12px;text-align:center">CarnetYa · carnetya.es</p></div>`,
    activa: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead_no_registrada',
    nombre: 'Invitación a autoescuela no registrada',
    subject: 'Tienes alumnos esperando en {{ciudad}} — Regístrate gratis',
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto"><h1 style="color:#1d4ed8">¡Alumnos esperando en {{ciudad}}!</h1><p>Hay <strong>{{num_leads}}</strong> persona(s) interesada(s) en sacarse el carnet en <strong>{{ciudad}}</strong>.</p><p>Regístrate en CarnetYa para acceder a estos clientes potenciales.</p><div style="background:#f8fafc;border:2px solid #1d4ed8;border-radius:12px;padding:20px;margin:20px 0"><p style="margin:0 0 8px;font-weight:700">¿Cómo funciona?</p><ul style="margin:0;padding-left:20px;color:#374151"><li>Regístrate gratis en 2 minutos</li><li>Recibes leads de alumnos de tu ciudad</li><li>Pagas solo por los leads que quieras ({{precio_lead}}€/lead)</li></ul></div><p><a href="{{registro_url}}" style="background:#1d4ed8;color:white;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin:8px 4px">Registrarme gratis →</a><a href="{{paypal_url}}" style="background:#0070ba;color:white;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin:8px 4px">Pagar con PayPal →</a></p><hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"><p style="color:#94a3b8;font-size:12px">CarnetYa · carnetya.es · Si no deseas recibir más correos, ignora este email.</p></div>`,
    activa: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead_reminder',
    nombre: 'Recordatorio de lead sin contactar',
    subject: 'Recordatorio: alumno interesado en {{ciudad}} (hace {{dias}} días)',
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto"><h1 style="color:#dc2626">⏰ Recordatorio: lead sin contactar</h1><p>Hola <strong>{{nombre_autoescuela}}</strong>,</p><p>Hace <strong>{{dias}} días</strong> llegó un alumno interesado en <strong>{{ciudad}}</strong> y aún no ha sido contactado.</p><p><a href="{{panel_url}}" style="background:#dc2626;color:white;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin:16px 0">Ver y contactar al alumno →</a></p><hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"><p style="color:#94a3b8;font-size:12px">CarnetYa · carnetya.es</p></div>`,
    activa: true,
    updated_at: new Date().toISOString(),
  },
]

const TEMPLATE_NAMES: Record<string, string> = Object.fromEntries(DEFAULT_TEMPLATES.map(t => [t.id, t.nombre]))

const patchSchema = z.object({
  id: z.string().min(1),
  subject: z.string().min(3).max(200),
  html: z.string().min(20),
  activa: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  const session = getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) {
    console.warn('[email-templates] tabla no existe, devolviendo defaults:', error.message)
    return NextResponse.json(DEFAULT_TEMPLATES)
  }

  if (!data || data.length === 0) return NextResponse.json(DEFAULT_TEMPLATES)
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const session = getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('email_templates')
    .upsert({
      id: parsed.data.id,
      nombre: TEMPLATE_NAMES[parsed.data.id] ?? parsed.data.id,
      subject: parsed.data.subject,
      html: parsed.data.html,
      activa: parsed.data.activa ?? true,
      updated_at: new Date().toISOString(),
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

