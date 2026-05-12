import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { ensureLeadsTable } from '@/lib/db-setup'
import { saveBlobLead } from '@/lib/blob-leads'
import { getCiudadBySlug } from '@/data/cities'
import { sendAdminNewLeadEmail, sendAutoescuelaNewLeadEmail } from '@/lib/email'

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
  leadData: { ciudad: string; urgencia: string; tipo_carnet?: string },
) {
  if (!ciudadId) return

  const { data: autoescuelas, error } = await supabase
    .from('autoescuelas')
    .select('id, plan, email, nombre')
    .eq('ciudad_id', ciudadId)
    .eq('activa', true)
    .order('destacada', { ascending: false })
    .limit(3)

  if (error || !autoescuelas?.length) return

  const assignments = autoescuelas.map((a: { id: string; plan?: string | null }) => ({
    lead_id: leadId,
    autoescuela_id: a.id,
    precio_lead: a.plan === 'premium' ? 4 : a.plan === 'basic' ? 8 : 0,
  }))

  await supabase.from('lead_assignments').upsert(assignments, { onConflict: 'lead_id,autoescuela_id' })

  // Notify each registered (non-free) autoescuela by email
  for (const a of autoescuelas as Array<{ id: string; plan?: string | null; email?: string; nombre?: string }>) {
    if (a.plan && a.plan !== 'free' && a.email) {
      sendAutoescuelaNewLeadEmail(
        { email: a.email, nombre: a.nombre ?? '', ciudad: leadData.ciudad },
        { ciudad: leadData.ciudad, urgencia: leadData.urgencia, tipo_carnet: leadData.tipo_carnet },
        leadId,
      ).catch(err => console.error('[CarnetYa] Error enviando email a autoescuela:', err))
    }
  }
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
  let dbError: unknown = null
  let ciudadId: string | null = null
  try {
    const supabase = createServiceClient()
    ciudadId = await findCiudadId(supabase, ciudadSlug)

    const leadPayload = {
      ...rest,
      ciudad_id: ciudadId,
      tipo_carnet,
      notas: tipo_carnet ? `Tipo de carnet solicitado: ${tipo_carnet}` : undefined,
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
      await assignLeadToAutoescuelas(supabase, lead.id, ciudadId, {
        ciudad: ciudadSlug,
        urgencia: rest.urgencia,
        tipo_carnet,
      })
    }
  } catch (dbErr) {
    dbError = dbErr
    console.warn('[CarnetYa] Error guardando lead en BD:', dbErr)
  }

  if (!leadId) {
    try {
      const ciudad = getCiudadBySlug(ciudadSlug)
      const blobLead = await saveBlobLead({
        ...rest,
        ciudad_id: ciudadId,
        ciudad_slug: ciudadSlug,
        ciudad: ciudad ? { nombre: ciudad.nombre, slug: ciudad.slug } : { nombre: ciudadSlug, slug: ciudadSlug },
        tipo_carnet: tipo_carnet ?? null,
        notas: tipo_carnet ? `Tipo de carnet solicitado: ${tipo_carnet}` : null,
        ip_address: ip,
        utm_source: rest.utm_source ?? null,
        utm_medium: rest.utm_medium ?? null,
        utm_campaign: rest.utm_campaign ?? null,
        fuente_url: rest.fuente_url ?? null,
      })
      leadId = blobLead.id
      dbError = null
      console.log('[CarnetYa] Lead guardado en Vercel Blob:', leadId)
    } catch (blobErr) {
      dbError = blobErr
      console.error('[CarnetYa] Error guardando lead en Blob:', blobErr)
    }
  }

  // Enviar email al admin — no bloqueamos la respuesta si falla
  sendAdminNewLeadEmail({
    nombre: parsed.data.nombre,
    telefono: parsed.data.telefono,
    email: parsed.data.email,
    ciudad: parsed.data.ciudad,
    urgencia: parsed.data.urgencia,
    tipo_carnet: parsed.data.tipo_carnet,
    utm_source: parsed.data.utm_source,
  }).catch(err => console.error('[CarnetYa] Error enviando email admin:', err))

  if (!leadId) {
    return NextResponse.json(
      { success: false, error: 'No se pudo guardar el lead en el panel' },
      { status: dbError ? 500 : 502 }
    )
  }

  return NextResponse.json({ success: true, leadId }, { status: 201 })
}

