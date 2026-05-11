import { createServiceClient } from '@/lib/supabase/server'
import { ensureLeadsTable } from '@/lib/db-setup'
import AdminAutoescuelasClient from './AdminAutoescuelasClient'

export default async function AdminAutoescuelasPage() {
  let autoescuelas: any[] = []

  try {
    await ensureLeadsTable()
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('autoescuelas')
      .select('*, ciudad:ciudades(nombre, slug), usuarios(id, email)')
      .order('created_at', { ascending: false })
      .limit(500)

    const ids = (data ?? []).map((a: { id: string }) => a.id)
    const leadCounts = new Map<string, number>()
    if (ids.length) {
      const { data: assignments } = await supabase
        .from('lead_assignments')
        .select('autoescuela_id')
        .in('autoescuela_id', ids)
      for (const assignment of assignments ?? []) {
        const id = (assignment as { autoescuela_id: string }).autoescuela_id
        leadCounts.set(id, (leadCounts.get(id) ?? 0) + 1)
      }
    }

    autoescuelas = ((data ?? []) as any[]).map((a) => ({
      ...a,
      registered: Boolean(a.usuarios?.length) || Boolean(a.registered_at),
      leads_count: leadCounts.get(a.id) ?? 0,
    }))
  } catch (error) {
    console.error('[admin/autoescuelas]', error)
  }

  return <AdminAutoescuelasClient initialAutoescuelas={autoescuelas} />
}
