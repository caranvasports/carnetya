import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const schema = z.object({
  contacto:          z.string().min(3).max(200),  // phone or email
  autoescuela_id:    z.string().uuid(),
  autoescuela_nombre:z.string().max(200),
  ciudad_slug:       z.string().max(80),
  fuente_url:        z.string().max(500).optional(),
  utm_source:        z.string().max(100).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { contacto, autoescuela_id, autoescuela_nombre, ciudad_slug, fuente_url, utm_source } =
      parsed.data

    // Detectar si es teléfono o email
    const isPhone = /^[6-9]\d{8}$/.test(contacto.replace(/\s/g, ''))
    const telefono = isPhone ? contacto.replace(/\s/g, '') : '000000000'
    const email    = isPhone ? `reveal_${Date.now()}@carnetya.es` : contacto

    const supabase = createServiceClient()

    const { data: autoescuela } = await supabase
      .from('autoescuelas')
      .select('plan')
      .eq('id', autoescuela_id)
      .maybeSingle()

    const precioLead = autoescuela?.plan === 'basic'
      ? 8
      : autoescuela?.plan === 'premium'
      ? 4
      : 0

    // Lookup ciudad_id
    const { data: ciudadRow } = await supabase
      .from('ciudades')
      .select('id')
      .eq('slug', ciudad_slug)
      .maybeSingle()

    const ciudad_id = ciudadRow?.id ?? null

    // Insertar lead con contexto de la autoescuela en notas
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        nombre:             `Contacto vía tarjeta`,
        telefono,
        email,
        ciudad_id,
        urgencia:           'normal',
        fuente_url:         fuente_url ?? null,
        utm_source:         utm_source ?? 'contact_reveal',
        utm_medium:         'card',
        utm_campaign:       autoescuela_nombre,
        notas:              `Lead generado al revelar contacto de: ${autoescuela_nombre} (${autoescuela_id})`,
      })
      .select('id')
      .single()

    if (leadError) {
      console.error('[contact-reveal] Error guardando lead:', leadError)
      // No bloqueamos al usuario aunque falle la inserción
    }

    // Asignar lead a la autoescuela concreta
    if (lead?.id) {
      await supabase.from('lead_assignments').insert({
        lead_id:       lead.id,
        autoescuela_id,
        precio_lead:   precioLead,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[contact-reveal]', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
