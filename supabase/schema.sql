-- ============================================================
-- CARNET FÁCIL — Esquema completo de base de datos (Supabase)
-- ============================================================

-- Extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- búsqueda full-text

-- ────────────────────────────────────────────────────────────
-- 1. CIUDADES
-- ────────────────────────────────────────────────────────────
create table public.ciudades (
  id                  uuid primary key default uuid_generate_v4(),
  nombre              text not null,
  slug                text not null unique,
  provincia           text not null,
  comunidad_autonoma  text not null,
  poblacion           integer default 0,
  precio_medio_carnet numeric(8,2) default 800,
  lat                 numeric(10,6),
  lng                 numeric(10,6),
  activa              boolean not null default true,
  created_at          timestamptz not null default now()
);

create index idx_ciudades_slug on public.ciudades (slug);
create index idx_ciudades_activa on public.ciudades (activa);

-- ────────────────────────────────────────────────────────────
-- 2. AUTOESCUELAS
-- ────────────────────────────────────────────────────────────
create type plan_autoescuela as enum ('free', 'basic', 'premium');

create table public.autoescuelas (
  id                  uuid primary key default uuid_generate_v4(),
  ciudad_id           uuid not null references public.ciudades (id) on delete restrict,
  nombre              text not null,
  slug                text not null unique,
  direccion           text,
  codigo_postal       varchar(5),
  telefono            text,
  email               text,
  web                 text,
  descripcion         text,
  precio_minimo       numeric(8,2),
  precio_maximo       numeric(8,2),
  precio_practicas    numeric(6,2),   -- precio por clase práctica
  rating_promedio     numeric(3,2) default 0,
  total_reviews       integer default 0,
  logo_url            text,
  imagen_url          text,
  horario             jsonb,          -- { lunes: "09:00-14:00 / 16:00-20:00", ... }
  servicios           text[],         -- ["Permiso B", "Permiso A", "Autoescuela online"]
  activa              boolean not null default true,
  destacada           boolean not null default false,
  verificada          boolean not null default false,
  plan                plan_autoescuela not null default 'free',
  plan_expires_at     timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_autoescuelas_ciudad on public.autoescuelas (ciudad_id);
create index idx_autoescuelas_slug   on public.autoescuelas (slug);
create index idx_autoescuelas_activa on public.autoescuelas (activa);
create index idx_autoescuelas_rating on public.autoescuelas (rating_promedio desc);

-- ────────────────────────────────────────────────────────────
-- 3. USUARIOS (perfil extendido de auth.users)
-- ────────────────────────────────────────────────────────────
create type rol_usuario as enum ('admin', 'autoescuela', 'usuario');

create table public.usuarios (
  id              uuid primary key references auth.users (id) on delete cascade,
  role            rol_usuario not null default 'usuario',
  autoescuela_id  uuid references public.autoescuelas (id) on delete set null,
  nombre          text,
  email           text not null,
  telefono        text,
  created_at      timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- 4. LEADS
-- ────────────────────────────────────────────────────────────
create type urgencia_lead as enum ('rapido', 'normal');
create type estado_lead   as enum ('nuevo', 'asignado', 'contactado', 'convertido', 'perdido');

create table public.leads (
  id                  uuid primary key default uuid_generate_v4(),
  ciudad_id           uuid references public.ciudades (id) on delete set null,
  nombre              text not null,
  telefono            text not null,
  email               text not null,
  edad                smallint,
  tiene_experiencia   boolean default false,
  urgencia            urgencia_lead not null default 'normal',
  estado              estado_lead not null default 'nuevo',
  fuente_url          text,   -- URL de origen
  utm_source          text,
  utm_medium          text,
  utm_campaign        text,
  ip_address          inet,
  notas               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_leads_ciudad  on public.leads (ciudad_id);
create index idx_leads_estado  on public.leads (estado);
create index idx_leads_created on public.leads (created_at desc);

-- ────────────────────────────────────────────────────────────
-- 5. ASIGNACIÓN DE LEADS A AUTOESCUELAS
-- ────────────────────────────────────────────────────────────
create type estado_asignacion as enum ('enviado', 'visto', 'contactado', 'convertido', 'rechazado');

create table public.lead_assignments (
  id              uuid primary key default uuid_generate_v4(),
  lead_id         uuid not null references public.leads (id) on delete cascade,
  autoescuela_id  uuid not null references public.autoescuelas (id) on delete cascade,
  precio_lead     numeric(6,2) not null default 5.00,
  estado          estado_asignacion not null default 'enviado',
  visto_at        timestamptz,
  contactado_at   timestamptz,
  notas           text,
  created_at      timestamptz not null default now(),
  unique (lead_id, autoescuela_id)
);

create index idx_lead_assign_lead        on public.lead_assignments (lead_id);
create index idx_lead_assign_autoescuela on public.lead_assignments (autoescuela_id);

-- ────────────────────────────────────────────────────────────
-- 6. REVIEWS
-- ────────────────────────────────────────────────────────────
create table public.reviews (
  id              uuid primary key default uuid_generate_v4(),
  autoescuela_id  uuid not null references public.autoescuelas (id) on delete cascade,
  usuario_id      uuid references auth.users (id) on delete set null,
  nombre_usuario  text not null,
  rating          smallint not null check (rating between 1 and 5),
  titulo          text,
  texto           text,
  carnet          text,  -- tipo de carnet que sacó
  verificada      boolean not null default false,
  publicada       boolean not null default true,
  created_at      timestamptz not null default now()
);

create index idx_reviews_autoescuela on public.reviews (autoescuela_id);
create index idx_reviews_rating      on public.reviews (rating desc);

-- ────────────────────────────────────────────────────────────
-- 7. ALUMNOS (SaaS panel autoescuela)
-- ────────────────────────────────────────────────────────────
create type fase_alumno as enum (
  'pendiente_inicio',
  'teoria',
  'pendiente_examen_teoria',
  'examen_teoria_aprobado',
  'practicas',
  'pendiente_examen_practico',
  'aprobado',
  'abandonado'
);

create table public.alumnos (
  id                          uuid primary key default uuid_generate_v4(),
  autoescuela_id              uuid not null references public.autoescuelas (id) on delete cascade,
  lead_id                     uuid references public.leads (id) on delete set null,
  nombre                      text not null,
  apellidos                   text,
  dni                         text,
  telefono                    text,
  email                       text,
  fecha_nacimiento            date,
  fase                        fase_alumno not null default 'pendiente_inicio',
  clases_practicas_realizadas integer not null default 0,
  clases_practicas_pagadas    integer not null default 0,
  precio_matricula            numeric(8,2),
  precio_clase_practica       numeric(6,2),
  fecha_alta                  date not null default current_date,
  fecha_examen_teoria         date,
  fecha_examen_practico       date,
  notas                       text,
  activo                      boolean not null default true,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index idx_alumnos_autoescuela on public.alumnos (autoescuela_id);
create index idx_alumnos_fase        on public.alumnos (fase);

-- ────────────────────────────────────────────────────────────
-- 8. CLASES (calendario SaaS)
-- ────────────────────────────────────────────────────────────
create type estado_clase as enum ('programada', 'realizada', 'cancelada', 'no_presentado');

create table public.clases (
  id              uuid primary key default uuid_generate_v4(),
  autoescuela_id  uuid not null references public.autoescuelas (id) on delete cascade,
  alumno_id       uuid not null references public.alumnos (id) on delete cascade,
  fecha_inicio    timestamptz not null,
  fecha_fin       timestamptz not null,
  estado          estado_clase not null default 'programada',
  profesor        text,
  vehiculo        text,
  notas           text,
  created_at      timestamptz not null default now()
);

create index idx_clases_autoescuela on public.clases (autoescuela_id);
create index idx_clases_alumno      on public.clases (alumno_id);
create index idx_clases_fecha       on public.clases (fecha_inicio);

-- ────────────────────────────────────────────────────────────
-- 9. SUSCRIPCIONES (monetización SaaS)
-- ────────────────────────────────────────────────────────────
create type estado_suscripcion as enum ('activa', 'cancelada', 'vencida', 'prueba');

create table public.suscripciones (
  id              uuid primary key default uuid_generate_v4(),
  autoescuela_id  uuid not null references public.autoescuelas (id) on delete cascade,
  plan            plan_autoescuela not null,
  estado          estado_suscripcion not null default 'activa',
  precio_mensual  numeric(8,2) not null,
  inicio          timestamptz not null default now(),
  fin             timestamptz,
  stripe_sub_id   text,
  created_at      timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- 10. FUNCIONES Y TRIGGERS
-- ────────────────────────────────────────────────────────────

-- Auto-actualizar updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_autoescuelas_updated
  before update on public.autoescuelas
  for each row execute function public.update_updated_at();

create trigger trg_leads_updated
  before update on public.leads
  for each row execute function public.update_updated_at();

create trigger trg_alumnos_updated
  before update on public.alumnos
  for each row execute function public.update_updated_at();

-- Recalcular rating al insertar/actualizar review
create or replace function public.recalcular_rating()
returns trigger language plpgsql as $$
begin
  update public.autoescuelas
  set
    rating_promedio = (
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where autoescuela_id = coalesce(new.autoescuela_id, old.autoescuela_id)
        and publicada = true
    ),
    total_reviews = (
      select count(*)
      from public.reviews
      where autoescuela_id = coalesce(new.autoescuela_id, old.autoescuela_id)
        and publicada = true
    )
  where id = coalesce(new.autoescuela_id, old.autoescuela_id);
  return new;
end;
$$;

create trigger trg_review_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recalcular_rating();

-- Perfil automático al crear usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.usuarios (id, email, nombre)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger trg_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 11. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

alter table public.ciudades        enable row level security;
alter table public.autoescuelas    enable row level security;
alter table public.usuarios        enable row level security;
alter table public.leads           enable row level security;
alter table public.lead_assignments enable row level security;
alter table public.reviews         enable row level security;
alter table public.alumnos         enable row level security;
alter table public.clases          enable row level security;
alter table public.suscripciones   enable row level security;

-- Ciudades: lectura pública
create policy "ciudades_public_read"
  on public.ciudades for select using (activa = true);

-- Autoescuelas: lectura pública de activas
create policy "autoescuelas_public_read"
  on public.autoescuelas for select using (activa = true);

-- Autoescuelas: propietario puede editar la suya
create policy "autoescuela_owner_update"
  on public.autoescuelas for update
  using (
    id in (
      select autoescuela_id from public.usuarios
      where id = auth.uid()
    )
  );

-- Leads: solo inserción pública (formulario)
create policy "leads_public_insert"
  on public.leads for insert with check (true);

-- Leads: admin puede ver todos
create policy "leads_admin_read"
  on public.leads for select
  using (
    exists (
      select 1 from public.usuarios
      where id = auth.uid() and role = 'admin'
    )
  );

-- Lead assignments: autoescuela ve los suyos
create policy "lead_assign_autoescuela_read"
  on public.lead_assignments for select
  using (
    autoescuela_id in (
      select autoescuela_id from public.usuarios
      where id = auth.uid()
    )
  );

-- Reviews: lectura pública de publicadas
create policy "reviews_public_read"
  on public.reviews for select using (publicada = true);

-- Reviews: usuarios autenticados pueden crear
create policy "reviews_auth_insert"
  on public.reviews for insert with check (auth.uid() is not null);

-- Alumnos: solo la autoescuela propietaria
create policy "alumnos_autoescuela_read"
  on public.alumnos for select
  using (
    autoescuela_id in (
      select autoescuela_id from public.usuarios
      where id = auth.uid()
    )
  );

create policy "alumnos_autoescuela_write"
  on public.alumnos for all
  using (
    autoescuela_id in (
      select autoescuela_id from public.usuarios
      where id = auth.uid()
    )
  );

-- Clases: solo la autoescuela propietaria
create policy "clases_autoescuela_all"
  on public.clases for all
  using (
    autoescuela_id in (
      select autoescuela_id from public.usuarios
      where id = auth.uid()
    )
  );

-- Usuarios: cada usuario ve su propio perfil
create policy "usuarios_self_read"
  on public.usuarios for select using (id = auth.uid());

create policy "usuarios_self_update"
  on public.usuarios for update using (id = auth.uid());
