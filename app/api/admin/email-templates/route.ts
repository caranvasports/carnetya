import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { getAdminSessionFromRequest } from '@/lib/admin-auth'

const DEFAULT_TEMPLATES = [
  {
    id: 'autoescuela_invite',
    nombre: 'Invitación a autoescuela no registrada',
    subject: 'Clientes interesados en sacarse el carnet en {{ciudad}}',
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#0f172a">
<h1 style="font-size:22px;margin:0 0 12px">CarnetYa ayuda a las autoescuelas a conseguir más alumnos</h1>
<p>Hola <strong>{{nombre_autoescuela}}</strong>,</p>
<p>Somos <strong>CarnetYa</strong>, una plataforma que ayuda a las autoescuelas a conseguir más alumnos y gestionar mejor sus reservas, leads y pagos online.</p>
<p>Tenemos usuarios interesados en sacarse el carnet en <strong>{{ciudad}}</strong>. Si quieres ver los clientes interesados y contactar con ellos, crea tu cuenta de autoescuela en CarnetYa.</p>
<p><a href="{{registro_url}}" style="background:#1d4ed8;color:white;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin:16px 0">Ver clientes interesados →</a></p>
<p style="color:#64748b;font-size:14px">Con el plan Basic recibes leads de alumnos reales de tu ciudad por 8€/lead. Próximamente habrá un plan avanzado con leads garantizados a coste más económico.</p>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
<p style="color:#94a3b8;font-size:12px">CarnetYa · carnetya.es · Si no deseas recibir más correos de nuestra parte, ignora este email.</p>
</div>`,
    updated_at: new Date().toISOString(),
  },
]

const schema = z.object({
  id: z.string().min(1),
  subject: z.string().min(3).max(200),
  html: z.string().min(20),
})

function isNoTable(error: { message?: string; code?: string } | null) {
  if (!error) return false
  return (
    error.message?.includes('does not exist') ||
    error.message?.includes('relation') ||
    error.code === '42P01'
  )
}

export async function GET(req: NextRequest) {
  const session = getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('nombre', { ascending: true })

  // If table doesn't exist yet, return hardcoded defaults (no 500 error)
  if (error) {
    if (isNoTable(error)) return NextResponse.json(DEFAULT_TEMPLATES)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If table exists but is empty, return defaults
  if (!data || data.length === 0) return NextResponse.json(DEFAULT_TEMPLATES)

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const session = getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const supabase = createServiceClient()

  // Try upsert so it works even if row was never inserted
  const { error } = await supabase
    .from('email_templates')
    .upsert({
      id: parsed.data.id,
      nombre: DEFAULT_TEMPLATES.find((t) => t.id === parsed.data.id)?.nombre ?? parsed.data.id,
      subject: parsed.data.subject,
      html: parsed.data.html,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    if (isNoTable(error)) {
      return NextResponse.json({ error: 'Tabla no creada aún. Ejecuta Setup DB desde /admin/leads primero.' }, { status: 503 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
