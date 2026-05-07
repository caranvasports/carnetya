import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAdminSessionFromRequest } from '@/lib/admin-auth'
import { listBlobLeads, updateBlobLeadStatus } from '@/lib/blob-leads'

export async function GET(req: NextRequest) {
  const session = getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const estado = searchParams.get('estado')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '200'), 500)

  const supabase = createServiceClient()
  let query = supabase
    .from('leads')
    .select('*, ciudad:ciudades(nombre, slug)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (estado && estado !== 'todos') {
    query = query.eq('estado', estado)
  }

  const { data, error } = await query

  if (error) {
    const noTable = error.message.includes('does not exist') || (error as { code?: string }).code === '42P01'
    try {
      const blobLeads = await listBlobLeads({ estado, limit })
      return NextResponse.json(blobLeads)
    } catch (blobError) {
      return NextResponse.json(
        { error: error.message, fallbackError: String(blobError), noTable },
        { status: noTable ? 404 : 500 }
      )
    }
  }

  return NextResponse.json(data ?? [])
}

export async function PATCH(req: NextRequest) {
  const session = getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id, estado } = await req.json()
  if (!id || !estado) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase.from('leads').update({ estado }).eq('id', id)

  if (error) {
    const updated = await updateBlobLeadStatus(id, estado)
    if (updated) return NextResponse.json({ ok: true })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
