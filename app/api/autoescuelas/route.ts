import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ciudadSlug  = searchParams.get('ciudad')
  const precioMax   = searchParams.get('precio_max')
  const ratingMin   = searchParams.get('rating_min')
  const limit       = Math.min(Number(searchParams.get('limit') ?? 20), 50)
  const page        = Math.max(Number(searchParams.get('page') ?? 1), 1)
  const offset      = (page - 1) * limit

  const supabase = createServiceClient()

  let query = supabase
    .from('autoescuelas')
    .select('*, ciudad:ciudades(nombre, slug)', { count: 'exact' })
    .eq('activa', true)

  if (ciudadSlug) {
    const { data: ciudad } = await supabase
      .from('ciudades')
      .select('id')
      .eq('slug', ciudadSlug)
      .single()
    if (ciudad) {
      query = query.eq('ciudad_id', ciudad.id)
    }
  }

  if (precioMax) {
    query = query.lte('precio_minimo', Number(precioMax))
  }
  if (ratingMin) {
    query = query.gte('rating_promedio', Number(ratingMin))
  }

  const { data, count, error } = await query
    .order('destacada', { ascending: false })
    .order('rating_promedio', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Error de servidor' }, { status: 500 })
  }

  return NextResponse.json({
    data,
    meta: { total: count ?? 0, page, limit, pages: Math.ceil((count ?? 0) / limit) },
  })
}
