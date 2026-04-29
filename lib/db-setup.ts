/**
 * Crea la tabla `leads` si no existe, usando conexión directa a Postgres.
 * Funciona tanto en desarrollo (via carnetya_POSTGRES_URL_NON_POOLING) como en producción.
 */
export async function ensureLeadsTable(): Promise<void> {
  const connectionString = process.env.carnetya_POSTGRES_URL_NON_POOLING
  if (!connectionString) {
    console.warn('[CarnetYa] No hay POSTGRES_URL_NON_POOLING — no se puede crear tabla leads')
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Client } = require('pg') as typeof import('pg')
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.leads (
        id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre            text NOT NULL,
        telefono          text NOT NULL,
        email             text NOT NULL,
        ciudad            text,
        tipo_carnet       text,
        urgencia          text DEFAULT 'normal',
        edad              integer,
        tiene_experiencia boolean DEFAULT false,
        estado            text DEFAULT 'nuevo',
        notas             text,
        utm_source        text,
        utm_medium        text,
        utm_campaign      text,
        fuente_url        text,
        ip_address        text,
        created_at        timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_leads_estado ON public.leads (estado);
    `)
    console.log('[CarnetYa] Tabla leads lista')
  } finally {
    await client.end()
  }
}
