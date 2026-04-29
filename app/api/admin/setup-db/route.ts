import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromRequest } from '@/lib/admin-auth'

const LEADS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS public.leads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            text NOT NULL,
  telefono          text NOT NULL,
  email             text NOT NULL,
  tipo_carnet       text,
  urgencia          text DEFAULT 'normal',
  edad              integer,
  tiene_experiencia boolean DEFAULT false,
  estado            text DEFAULT 'nuevo',
  notas             text,
  utm_source        text,
  ciudad_id         uuid,
  ip_address        text,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON public.leads (estado);
`

export async function POST(req: NextRequest) {
  const session = getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const pgUrl = process.env.carnetya_POSTGRES_URL_NON_POOLING
  if (!pgUrl) {
    return NextResponse.json({ error: 'URL de base de datos no configurada' }, { status: 500 })
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Client } = require('pg')
    const client = new Client({ connectionString: pgUrl, ssl: { rejectUnauthorized: false } })
    await client.connect()
    await client.query(LEADS_TABLE_SQL)
    await client.end()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
