import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { getAdminSessionFromRequest } from '@/lib/admin-auth'
import { ensureLeadsTable } from '@/lib/db-setup'
import { renderTemplate, sendEmail } from '@/lib/email'
import { CIUDADES } from '@/data/cities'

// Mapping provincia → comunidad autónoma (needed when auto-creating cities)
const PROVINCIA_CCAA: Record<string, string> = {
  Madrid: 'Comunidad de Madrid',
  Barcelona: 'Cataluña', Girona: 'Cataluña', Lleida: 'Cataluña', Tarragona: 'Cataluña',
  Valencia: 'Comunidad Valenciana', Alicante: 'Comunidad Valenciana', Castellón: 'Comunidad Valenciana',
  Sevilla: 'Andalucía', Cádiz: 'Andalucía', Huelva: 'Andalucía', Córdoba: 'Andalucía',
  Jaén: 'Andalucía', Almería: 'Andalucía', Granada: 'Andalucía', Málaga: 'Andalucía',
  Zaragoza: 'Aragón', Huesca: 'Aragón', Teruel: 'Aragón',
  Vizcaya: 'País Vasco', Guipúzcoa: 'País Vasco', Álava: 'País Vasco',
  Navarra: 'Comunidad Foral de Navarra',
  'La Rioja': 'La Rioja',
  Murcia: 'Región de Murcia',
  Asturias: 'Principado de Asturias',
  Cantabria: 'Cantabria',
  Burgos: 'Castilla y León', Valladolid: 'Castilla y León', León: 'Castilla y León',
  Salamanca: 'Castilla y León', Ávila: 'Castilla y León', Segovia: 'Castilla y León',
  Soria: 'Castilla y León', Zamora: 'Castilla y León', Palencia: 'Castilla y León',
  Toledo: 'Castilla-La Mancha', 'Ciudad Real': 'Castilla-La Mancha', Cuenca: 'Castilla-La Mancha',
  Guadalajara: 'Castilla-La Mancha', Albacete: 'Castilla-La Mancha',
  Badajoz: 'Extremadura', Cáceres: 'Extremadura',
  'Las Palmas': 'Canarias', 'Santa Cruz de Tenerife': 'Canarias',
  Baleares: 'Islas Baleares',
  'A Coruña': 'Galicia', Lugo: 'Galicia', Ourense: 'Galicia', Pontevedra: 'Galicia',
  Ceuta: 'Ciudad Autónoma de Ceuta',
  Melilla: 'Ciudad Autónoma de Melilla',
}

async function getOrCreateCiudad(supabase: ReturnType<typeof createServiceClient>, slug: string): Promise<{ id: string; nombre: string; slug: string } | { error: string }> {
  // Try to find in DB first
  let existing: { id: string; nombre: string; slug: string } | null = null
  try {
    const res = await supabase.from('ciudades').select('id, nombre, slug').eq('slug', slug).maybeSingle()
    if (res.data) return res.data
    if (res.error) return { error: `Error consultando ciudad: ${res.error.message}` }
  } catch (e) {
    return { error: `No se puede conectar a la base de datos. Comprueba que el proyecto Supabase esté activo (puede estar pausado en el plan free). Detalle: ${String(e)}` }
  }

  // Look up from static cities list
  const ciudadStatic = CIUDADES.find((c) => c.slug === slug)
  if (!ciudadStatic) return { error: `Ciudad con slug "${slug}" no está en la lista de ciudades` }

  const comunidad = PROVINCIA_CCAA[ciudadStatic.provincia] ?? ciudadStatic.provincia

  try {
    // Upsert so it's safe even if two requests race each other
    const { data: created, error: insertError } = await supabase
      .from('ciudades')
      .upsert(
        {
          nombre: ciudadStatic.nombre,
          slug: ciudadStatic.slug,
          provincia: ciudadStatic.provincia,
          comunidad_autonoma: comunidad,
          poblacion: ciudadStatic.poblacion,
          activa: true,
        },
        { onConflict: 'slug', ignoreDuplicates: false }
      )
      .select('id, nombre, slug')
      .single()

    if (insertError) {
      // Last resort: maybe it was inserted by a concurrent request — try selecting again
      const { data: retry } = await supabase
        .from('ciudades').select('id, nombre, slug').eq('slug', slug).maybeSingle()
      if (retry) return retry
      return { error: `No se pudo crear la ciudad: ${insertError.message} (code: ${insertError.code})` }
    }
    return created!
  } catch (e) {
    return { error: `Error de red al crear ciudad. Supabase puede estar pausado. Detalle: ${String(e)}` }
  }
}

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

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors.map((e) => e.message).join(', ') }, { status: 400 })

  try {
    const supabase = createServiceClient()
    const ciudadResult = await getOrCreateCiudad(supabase, parsed.data.ciudad_slug)

    if ('error' in ciudadResult) {
      return NextResponse.json({ error: ciudadResult.error }, { status: 400 })
    }
    const ciudad = ciudadResult

    const baseSlug = slugify(`${parsed.data.nombre}-${ciudad.slug}`)
    let slug = baseSlug
    // Cap at 10 attempts to avoid infinite loop
    for (let attempt = 2; attempt <= 10; attempt++) {
      const { data: existing } = await supabase.from('autoescuelas').select('id').eq('slug', slug).maybeSingle()
      if (!existing) break
      slug = `${baseSlug}-${attempt}`
    }

    // Build payload — always use base columns; add captacion columns only if they likely exist
    const payload: Record<string, unknown> = {
      ciudad_id: ciudad.id,
      nombre: parsed.data.nombre,
      slug,
      email: parsed.data.email,
      telefono: parsed.data.telefono || null,
      web: parsed.data.web || null,
      activa: true,
      plan: 'free',
      servicios: ['Permiso B'],
    }

    // Try inserting with the extra captacion columns first
    const withExtra = {
      ...payload,
      contacto_nombre: parsed.data.contacto_nombre || null,
      captacion_marcada: parsed.data.marcada,
      captacion_estado: parsed.data.marcada ? 'pendiente' : 'sin_marcar',
    }

    let { data: inserted, error } = await supabase.from('autoescuelas').insert(withExtra).select('id').single()

    // Fallback: retry without extra columns if they don't exist yet
    if (error && (error.code === '42703' || error.message?.includes('column'))) {
      const fb = await supabase.from('autoescuelas').insert(payload).select('id').single()
      inserted = fb.data
      error = fb.error
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, id: inserted!.id })
  } catch (e) {
    console.error('[POST /api/admin/autoescuelas]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
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
