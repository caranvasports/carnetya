/**
 * Importador de autoescuelas desde OpenStreetMap (Overpass API)
 * 
 * Uso:
 *   npx tsx scripts/import-osm.ts
 * 
 * Variables de entorno necesarias (añadir a .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

// ── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const DRY_RUN = process.argv.includes('--dry-run')

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Helpers ─────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function normalizeCity(city: string): string {
  return city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function cleanPhone(phone: string | undefined): string | null {
  if (!phone) return null
  const cleaned = phone.replace(/[^\d+]/g, '').replace(/^0034/, '+34').replace(/^34/, '+34')
  return cleaned.length >= 9 ? cleaned : null
}

function cleanUrl(url: string | undefined): string | null {
  if (!url) return null
  if (!url.startsWith('http')) return `https://${url}`
  return url
}

// ── Tipos OSM ───────────────────────────────────────────────────────────────
interface OsmTags {
  name?: string
  phone?: string
  'contact:phone'?: string
  email?: string
  'contact:email'?: string
  website?: string
  'contact:website'?: string
  'addr:street'?: string
  'addr:housenumber'?: string
  'addr:city'?: string
  'addr:municipality'?: string
  'addr:postcode'?: string
  opening_hours?: string
}

interface OsmElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: OsmTags
}

// ── Consulta Overpass ────────────────────────────────────────────────────────
async function fetchOverpass(): Promise<OsmElement[]> {
  const query = `
[out:json][timeout:300];
area["name"="España"]["admin_level"="2"]->.spain;
(
  node["amenity"="driving_school"](area.spain);
  way["amenity"="driving_school"](area.spain);
);
out center tags;
`
  console.log('📡  Consultando Overpass API (puede tardar 1-2 min)…')
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  if (!res.ok) throw new Error(`Overpass error ${res.status}: ${await res.text()}`)

  const json = await res.json() as { elements: OsmElement[] }
  return json.elements
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚗  Importador de autoescuelas OSM → Supabase${DRY_RUN ? ' [DRY RUN]' : ''}\n`)

  // 1. Cargar ciudades de Supabase
  console.log('📋  Cargando ciudades de Supabase…')
  const { data: ciudades, error: ciudadesError } = await supabase
    .from('ciudades')
    .select('id, nombre, slug')
  
  if (ciudadesError || !ciudades) {
    console.error('❌  Error al cargar ciudades:', ciudadesError)
    process.exit(1)
  }

  // Mapa ciudad normalizada → { id, slug }
  const ciudadMap = new Map<string, { id: string; slug: string }>()
  for (const c of ciudades) {
    ciudadMap.set(normalizeCity(c.nombre), { id: c.id, slug: c.slug })
    // Aliases comunes
    const aliases: Record<string, string> = {
      'zaragoza': 'zaragoza',
      'madrid': 'madrid',
      'barcelona': 'barcelona',
      'valencia': 'valencia',
      'sevilla': 'sevilla',
    }
    const normalized = normalizeCity(c.nombre)
    if (aliases[normalized]) ciudadMap.set(aliases[normalized], { id: c.id, slug: c.slug })
  }

  // 2. Cargar autoescuelas existentes (slugs) para evitar duplicados
  const { data: existingData } = await supabase.from('autoescuelas').select('slug')
  const existingSlugs = new Set((existingData ?? []).map((a) => a.slug))

  // 3. Fetch OSM
  const elements = await fetchOverpass()
  console.log(`✅  ${elements.length} autoescuelas encontradas en OSM\n`)

  // 4. Procesar e insertar
  let inserted = 0
  let skipped_no_name = 0
  let skipped_no_city = 0
  let skipped_dup = 0
  let errors = 0

  const BATCH_SIZE = 50
  const toInsert: Record<string, unknown>[] = []

  for (const el of elements) {
    const tags = el.tags ?? {}
    const name = tags.name?.trim()

    if (!name) { skipped_no_name++; continue }

    // Ciudad
    const osmCity = (tags['addr:city'] || tags['addr:municipality'] || '').trim()
    const cityNorm = normalizeCity(osmCity)
    const ciudad = ciudadMap.get(cityNorm)

    if (!ciudad) { skipped_no_city++; continue }

    // Slug único
    const baseSlug = slugify(`${name}-${ciudad.slug}`)
    let slug = baseSlug
    let attempt = 2
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${attempt++}`
    }
    existingSlugs.add(slug)

    // Dirección
    const street = tags['addr:street'] ?? ''
    const number = tags['addr:housenumber'] ?? ''
    const direccion = [street, number].filter(Boolean).join(' ') || null

    const phone = cleanPhone(tags.phone ?? tags['contact:phone'])
    const email = tags.email ?? tags['contact:email'] ?? null
    const web = cleanUrl(tags.website ?? tags['contact:website'])

    if (existingData?.find((a) => a.slug === slug)) { skipped_dup++; continue }

    toInsert.push({
      ciudad_id: ciudad.id,
      nombre: name,
      slug,
      direccion,
      codigo_postal: tags['addr:postcode'] ?? null,
      telefono: phone,
      email,
      web,
      descripcion: null,
      precio_minimo: null,
      precio_maximo: null,
      rating_promedio: 0,
      total_reviews: 0,
      servicios: ['Permiso B'],
      activa: true,
      destacada: false,
      verificada: false,
      plan: 'free',
    })

    // Insertar en batches
    if (toInsert.length >= BATCH_SIZE) {
      const batch = toInsert.splice(0, BATCH_SIZE)
      if (!DRY_RUN) {
        const { error } = await supabase.from('autoescuelas').insert(batch)
        if (error) {
          console.error('  ⚠️  Error en batch:', error.message)
          errors += batch.length
        } else {
          inserted += batch.length
          process.stdout.write(`  ✅  ${inserted} insertadas…\r`)
        }
      } else {
        inserted += batch.length
        console.log(`  [DRY] Batch de ${batch.length} autoescuelas de ${(batch[0] as { nombre: string }).nombre}…`)
      }
    }
  }

  // Insertar el último batch
  if (toInsert.length > 0) {
    if (!DRY_RUN) {
      const { error } = await supabase.from('autoescuelas').insert(toInsert)
      if (error) {
        console.error('  ⚠️  Error en último batch:', error.message)
        errors += toInsert.length
      } else {
        inserted += toInsert.length
      }
    } else {
      inserted += toInsert.length
    }
  }

  console.log('\n')
  console.log('═══════════════════════════════════════════')
  console.log(`✅  Insertadas:           ${inserted}`)
  console.log(`⏭️   Sin nombre (saltadas): ${skipped_no_name}`)
  console.log(`🏙️   Sin ciudad (saltadas): ${skipped_no_city}`)
  console.log(`🔁  Duplicadas (saltadas): ${skipped_dup}`)
  console.log(`❌  Errores:              ${errors}`)
  console.log('═══════════════════════════════════════════\n')
}

main().catch((e) => { console.error(e); process.exit(1) })
