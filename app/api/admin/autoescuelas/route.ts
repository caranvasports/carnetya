import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { getAdminSessionFromRequest } from '@/lib/admin-auth'
import { ensureLeadsTable } from '@/lib/db-setup'
import { renderTemplate, sendEmail } from '@/lib/email'

function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const createSchema = z.object({
  nombre: z.string().min(2).max(200),
  email: z.string().email().max(200),
  ciudad_slug: z.string().min(1),
  telefono: z.string().max(40).optional(),
  contacto_nombre: z.string().max(120).optional(),
  web: z.string().max(300).optional(),
  marcada: z.boolean().optional().default(true),
})

const patchSchema = z.object({
  id: z.string().uuid(),
  captacion_marcada: z.boolean().optional(),
  captacion_estado: z.string().max(40).optional(),
})

export async function GET(req: NextRequest) {
  const session = getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  await ensureLeadsTable()
  const supabase = createServiceClient()
  const { data: autoescuelas, error } = await supabase
    .from('autoescuelas')
    .select('*, ciudad:ciudades(nombre, slug), usuarios(id, email)')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ids = (autoescuelas ?? []).map((a: { id: string }) => a.id)
  const leadCounts = new Map<string, number>()
  if (ids.length) {
    const { data: assignments } = await supabase
      .from('lead_assignments')
      .select('autoescuela_id')
      .in('autoescuela_id', ids)

    for (const assignment of assignments ?? []) {
      const id = (assignment as { autoescuela_id: string }).autoescuela_id
      leadCounts.set(id, (leadCounts.get(id) ?? 0) + 1)
    }
  }

  return NextResponse.json((autoescuelas ?? []).map((a: any) => ({
    ...a,
    registered: Boolean(a.usuarios?.length) || Boolean(a.registered_at),
    leads_count: leadCounts.get(a.id) ?? 0,
  })))
}

export async function POST(req: NextRequest) {
  const session = getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  await ensureLeadsTable()
  const supabase = createServiceClient()
  const { data: ciudad } = await supabase
    .from('ciudades')
    .select('id, nombre, slug')
    .eq('slug', parsed.data.ciudad_slug)
    .maybeSingle()

  if (!ciudad) return NextResponse.json({ error: 'Ciudad no encontrada' }, { status: 404 })

  const baseSlug = slugify(`${parsed.data.nombre}-${ciudad.slug}`)
  let slug = baseSlug
  let attempt = 2
  while (true) {
    const { data: existing } = await supabase.from('autoescuelas').select('id').eq('slug', slug).maybeSingle()
    if (!existing) break
    slug = `${baseSlug}-${attempt++}`
  }

  const { data, error } = await supabase
    .from('autoescuelas')
    .insert({
      ciudad_id: ciudad.id,
      nombre: parsed.data.nombre,
      slug,
      email: parsed.data.email,
      telefono: parsed.data.telefono || null,
      contacto_nombre: parsed.data.contacto_nombre || null,
      web: parsed.data.web || null,
      captacion_marcada: parsed.data.marcada,
      captacion_estado: parsed.data.marcada ? 'pendiente' : 'sin_marcar',
      activa: true,
      plan: 'free',
      servicios: ['Permiso B'],
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}

export async function PATCH(req: NextRequest) {
  const session = getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  await ensureLeadsTable()
  const supabase = createServiceClient()
  const update: Record<string, unknown> = {}
  if (parsed.data.captacion_marcada !== undefined) update.captacion_marcada = parsed.data.captacion_marcada
  if (parsed.data.captacion_estado) update.captacion_estado = parsed.data.captacion_estado

  const { error } = await supabase.from('autoescuelas').update(update).eq('id', parsed.data.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PUT(req: NextRequest) {
  const session = getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  await ensureLeadsTable()
  const supabase = createServiceClient()
  const { data: autoescuela, error: autoescuelaError } = await supabase
    .from('autoescuelas')
    .select('id, nombre, email, contacto_nombre, ciudad:ciudades(nombre, slug)')
    .eq('id', id)
    .single()

  if (autoescuelaError || !autoescuela?.email) {
    return NextResponse.json({ error: 'Autoescuela sin email' }, { status: 400 })
  }

  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', 'autoescuela_invite')
    .single()

  if (templateError || !template) return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 500 })

  const ciudad = Array.isArray(autoescuela.ciudad) ? autoescuela.ciudad[0] : autoescuela.ciudad
  const registroUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.carnetya.es'}/autoescuela/registro?email=${encodeURIComponent(autoescuela.email)}&autoescuela=${encodeURIComponent(autoescuela.nombre)}`
  const vars = {
    nombre_autoescuela: autoescuela.nombre,
    contacto_nombre: autoescuela.contacto_nombre,
    ciudad: ciudad?.nombre ?? 'tu ciudad',
    registro_url: registroUrl,
  }

  const subject = renderTemplate(template.subject, vars)
  const html = renderTemplate(template.html, vars)
  const result = await sendEmail(autoescuela.email, subject, html)

  await supabase
    .from('autoescuelas')
    .update({
      captacion_marcada: true,
      captacion_estado: result.sent ? 'email_enviado' : 'email_pendiente_config',
      captacion_email_sent_at: result.sent ? new Date().toISOString() : null,
    })
    .eq('id', id)

  return NextResponse.json({ ok: true, sent: result.sent, provider: result.provider })
}
