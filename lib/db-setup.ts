/**
 * Crea la tabla `leads` si no existe, usando conexión directa a Postgres.
 * Funciona tanto en desarrollo (via carnetya_POSTGRES_URL_NON_POOLING) como en producción.
 */
export async function ensureLeadsTable(): Promise<void> {
  const connectionString =
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL ??
    process.env.carnetya_POSTGRES_URL_NON_POOLING

  if (!connectionString) {
    console.warn('[CarnetYa] No hay URL de Postgres — no se puede crear tabla leads')
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Client } = require('pg') as typeof import('pg')
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      DO $$ BEGIN
        CREATE TYPE urgencia_lead AS ENUM ('rapido', 'normal');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN
        CREATE TYPE estado_lead AS ENUM ('nuevo', 'asignado', 'contactado', 'convertido', 'perdido');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      CREATE TABLE IF NOT EXISTS public.leads (
        id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        ciudad_id         uuid REFERENCES public.ciudades (id) ON DELETE SET NULL,
        nombre            text NOT NULL,
        telefono          text NOT NULL,
        email             text NOT NULL,
        tipo_carnet       text,
        urgencia          urgencia_lead NOT NULL DEFAULT 'normal',
        edad              integer,
        tiene_experiencia boolean DEFAULT false,
        estado            estado_lead NOT NULL DEFAULT 'nuevo',
        notas             text,
        utm_source        text,
        utm_medium        text,
        utm_campaign      text,
        fuente_url        text,
        ip_address        inet,
        created_at        timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ciudad_id uuid REFERENCES public.ciudades (id) ON DELETE SET NULL;
      ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tipo_carnet text;
      CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_leads_estado ON public.leads (estado);
      CREATE INDEX IF NOT EXISTS idx_leads_ciudad ON public.leads (ciudad_id);
    `)
    console.log('[CarnetYa] Tabla leads lista')
  } finally {
    await client.end()
  }
}
