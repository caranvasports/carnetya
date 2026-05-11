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

      DO $$ BEGIN
        CREATE TYPE estado_asignacion AS ENUM ('enviado', 'visto', 'contactado', 'convertido', 'rechazado');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      CREATE TABLE IF NOT EXISTS public.lead_assignments (
        id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        lead_id         uuid NOT NULL REFERENCES public.leads (id) ON DELETE CASCADE,
        autoescuela_id  uuid NOT NULL REFERENCES public.autoescuelas (id) ON DELETE CASCADE,
        precio_lead     numeric(8,2) DEFAULT 0,
        estado          estado_asignacion NOT NULL DEFAULT 'enviado',
        visto_at        timestamptz,
        contactado_at   timestamptz,
        notas           text,
        created_at      timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_lead_assignments_autoescuela ON public.lead_assignments (autoescuela_id);
      CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead ON public.lead_assignments (lead_id);

      ALTER TABLE public.autoescuelas ADD COLUMN IF NOT EXISTS contacto_nombre text;
      ALTER TABLE public.autoescuelas ADD COLUMN IF NOT EXISTS captacion_marcada boolean NOT NULL DEFAULT false;
      ALTER TABLE public.autoescuelas ADD COLUMN IF NOT EXISTS captacion_estado text NOT NULL DEFAULT 'pendiente';
      ALTER TABLE public.autoescuelas ADD COLUMN IF NOT EXISTS captacion_email_sent_at timestamptz;
      ALTER TABLE public.autoescuelas ADD COLUMN IF NOT EXISTS registered_at timestamptz;
      ALTER TABLE public.autoescuelas ADD COLUMN IF NOT EXISTS stripe_customer_id text;
      ALTER TABLE public.autoescuelas ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
      ALTER TABLE public.autoescuelas ADD COLUMN IF NOT EXISTS stripe_subscription_status text;
      CREATE INDEX IF NOT EXISTS idx_autoescuelas_captacion ON public.autoescuelas (captacion_marcada, captacion_estado);

      CREATE TABLE IF NOT EXISTS public.email_templates (
        id          text PRIMARY KEY,
        nombre      text NOT NULL,
        subject     text NOT NULL,
        html        text NOT NULL,
        updated_at  timestamptz NOT NULL DEFAULT now()
      );

      INSERT INTO public.email_templates (id, nombre, subject, html)
      VALUES (
        'autoescuela_invite',
        'Invitación a autoescuela no registrada',
        'Clientes interesados en sacarse el carnet en {{ciudad}}',
        '<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#0f172a"><h1 style="font-size:22px;margin:0 0 12px">CarnetYa ayuda a las autoescuelas a conseguir más alumnos</h1><p>Hola {{nombre_autoescuela}},</p><p>Somos CarnetYa, una plataforma para que las autoescuelas consigan más alumnos y gestionen mejor sus reservas, leads y pagos online.</p><p>Tenemos usuarios interesados en sacarse el carnet en {{ciudad}}. Si quieres ver los clientes interesados y contactar con ellos, crea tu cuenta de autoescuela.</p><p><a href="{{registro_url}}" style="background:#1d4ed8;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">Ver clientes interesados</a></p><p style="color:#64748b;font-size:13px">Puedes empezar con el plan Basic y pagar por lead. Próximamente habrá un plan avanzado con leads garantizados y coste por lead más económico.</p></div>'
      )
      ON CONFLICT (id) DO NOTHING;
    `)
    console.log('[CarnetYa] Tablas leads y captación listas')
  } finally {
    await client.end()
  }
}
