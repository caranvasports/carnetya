import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('autoescuelas')
    .select('*, ciudad:ciudades(*), reviews(*)')
    .eq('id', id)
    .eq('activa', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  }

  return NextResponse.json(data)
}

const updateSchema = z.object({
  nombre:      z.string().min(2).max(200).optional(),
  descripcion: z.string().max(2000).optional(),
  telefono:    z.string().max(20).optional(),
  email:       z.string().email().optional(),
  web:         z.string().url().optional(),
  horario:     z.record(z.string()).optional(),
  servicios:   z.array(z.string()).optional(),
})

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  // Solo el propietario puede editar
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('autoescuela_id, role')
    .eq('id', user.id)
    .single()

  if (!usuario || (usuario.role !== 'admin' && usuario.autoescuela_id !== id)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 422 })
  }

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('autoescuelas')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Error actualizando' }, { status: 500 })
  }

  return NextResponse.json(data)
}
