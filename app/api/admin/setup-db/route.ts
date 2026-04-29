import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromRequest } from '@/lib/admin-auth'
import { ensureLeadsTable } from '@/lib/db-setup'

export async function POST(req: NextRequest) {
  const session = getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    await ensureLeadsTable()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
