import { get, list, put } from '@vercel/blob'

export type StoredLead = {
  id: string
  nombre: string
  telefono: string
  email: string
  tipo_carnet?: string | null
  urgencia: string
  edad?: number | null
  tiene_experiencia?: boolean
  estado: string
  notas?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  fuente_url?: string | null
  ip_address?: string | null
  ciudad_id?: string | null
  ciudad_slug?: string | null
  ciudad?: { nombre?: string | null; slug?: string | null } | null
  created_at: string
  updated_at?: string | null
}

const LEADS_PREFIX = 'leads/'

function leadPath(id: string) {
  return `${LEADS_PREFIX}${id}.json`
}

async function streamToText(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let result = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    result += decoder.decode(value, { stream: true })
  }

  result += decoder.decode()
  return result
}

async function readLead(pathname: string): Promise<StoredLead | null> {
  const result = await get(pathname, { access: 'private' })
  if (!result?.stream) return null

  const text = await streamToText(result.stream)
  return JSON.parse(text) as StoredLead
}

export async function saveBlobLead(input: Omit<StoredLead, 'id' | 'estado' | 'created_at'> & Partial<Pick<StoredLead, 'id' | 'estado' | 'created_at'>>) {
  const id = input.id ?? crypto.randomUUID()
  const now = new Date().toISOString()
  const lead: StoredLead = {
    ...input,
    id,
    estado: input.estado ?? 'nuevo',
    created_at: input.created_at ?? now,
    updated_at: now,
  }

  await put(leadPath(id), JSON.stringify(lead, null, 2), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
  })

  return lead
}

export async function listBlobLeads({ estado, limit = 200 }: { estado?: string | null; limit?: number } = {}) {
  const leads: StoredLead[] = []
  let cursor: string | undefined

  do {
    const result = await list({ prefix: LEADS_PREFIX, limit: Math.min(limit, 1000), cursor })
    cursor = result.cursor

    for (const blob of result.blobs) {
      if (!blob.pathname.endsWith('.json')) continue
      const lead = await readLead(blob.pathname)
      if (!lead) continue
      if (estado && estado !== 'todos' && lead.estado !== estado) continue
      leads.push(lead)
      if (leads.length >= limit) break
    }
  } while (cursor && leads.length < limit)

  return leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function updateBlobLeadStatus(id: string, estado: string) {
  const lead = await readLead(leadPath(id))
  if (!lead) return false

  await saveBlobLead({ ...lead, estado, updated_at: new Date().toISOString() })
  return true
}
