import { createServiceClient } from '@/lib/supabase/server'
import { TrendingUp, Users, Building2, Euro, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react'

async function getStats() {
  const supabase = createServiceClient()
  const stats = {
    totalLeads: 0,
    leadsHoy: 0,
    leadsSemana: 0,
    leadsNuevos: 0,
    leadsConvertidos: 0,
    autoescuelasTotal: 0,
    autoescuelasBasic: 0,
    autoescuelasRegistradas: 0,
    ingresos: 0,
    leadsPorEstado: {} as Record<string, number>,
    ultimosLeads: [] as Array<{ id: string; nombre: string; email: string; telefono: string; estado: string; created_at: string; ciudad?: { nombre?: string } | null }>,
  }

  try {
    const ahora = new Date()
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).toISOString()
    const semana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [leadsRes, autoescuelasRes, assignmentsRes, ultimosRes] = await Promise.all([
      supabase.from('leads').select('id, estado, created_at'),
      supabase.from('autoescuelas').select('id, plan, registered_at').eq('activa', true),
      supabase.from('lead_assignments').select('id, precio_lead, estado'),
      supabase.from('leads')
        .select('id, nombre, email, telefono, estado, created_at, ciudad:ciudades(nombre)')
        .order('created_at', { ascending: false })
        .limit(8),
    ])

    const leads = (leadsRes.data ?? []) as Array<{ estado: string; created_at: string }>
    stats.totalLeads = leads.length
    stats.leadsHoy = leads.filter((l) => l.created_at >= hoy).length
    stats.leadsSemana = leads.filter((l) => l.created_at >= semana).length
    stats.leadsNuevos = leads.filter((l) => l.estado === 'nuevo').length
    stats.leadsConvertidos = leads.filter((l) => l.estado === 'convertido').length
    stats.leadsPorEstado = leads.reduce((acc, l) => ({ ...acc, [l.estado]: (acc[l.estado] ?? 0) + 1 }), {} as Record<string, number>)

    const autoescuelas = (autoescuelasRes.data ?? []) as Array<{ plan: string; registered_at: string | null }>
    stats.autoescuelasTotal = autoescuelas.length
    stats.autoescuelasBasic = autoescuelas.filter((a) => a.plan === 'basic' || a.plan === 'premium').length
    stats.autoescuelasRegistradas = autoescuelas.filter((a) => a.registered_at).length

    const assignments = (assignmentsRes.data ?? []) as Array<{ precio_lead: number | null; estado: string }>
    stats.ingresos = assignments.reduce((s, a) => s + (a.precio_lead ?? 0), 0)

    stats.ultimosLeads = (ultimosRes.data ?? []) as typeof stats.ultimosLeads
  } catch { /* tablas no aplicadas aún */ }

  return stats
}

const ESTADO_DOT: Record<string, string> = {
  nuevo:      'bg-blue-400',
  asignado:   'bg-amber-400',
  contactado: 'bg-violet-400',
  convertido: 'bg-green-400',
  perdido:    'bg-gray-500',
}

export default async function AdminAnalyticsPage() {
  const stats = await getStats()

  const kpis = [
    { label: 'Total leads', value: stats.totalLeads, sub: `+${stats.leadsHoy} hoy / +${stats.leadsSemana} esta semana`, icon: Users, color: 'text-blue-400' },
    { label: 'Leads nuevos', value: stats.leadsNuevos, sub: 'pendientes de gestionar', icon: Clock, color: 'text-amber-400' },
    { label: 'Convertidos', value: stats.leadsConvertidos, sub: `${stats.totalLeads ? ((stats.leadsConvertidos / stats.totalLeads) * 100).toFixed(1) : 0}% tasa de conversión`, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Autoescuelas', value: stats.autoescuelasTotal, sub: `${stats.autoescuelasBasic} de pago · ${stats.autoescuelasRegistradas} registradas`, icon: Building2, color: 'text-purple-400' },
    { label: 'Ingresos (leads)', value: `${stats.ingresos.toFixed(0)}€`, sub: 'suma de precio_lead asignados', icon: Euro, color: 'text-green-400' },
    { label: 'Autoescuelas de pago', value: stats.autoescuelasBasic, sub: 'plan basic o superior', icon: UserCheck, color: 'text-indigo-400' },
  ]

  const totalLeadsParaPct = stats.totalLeads || 1

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><TrendingUp className="w-6 h-6 text-blue-400" /> Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Métricas en tiempo real de CarnetYa</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpis.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-3xl font-black text-white mb-1">{value}</p>
            <p className="text-xs text-gray-500">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Estado leads */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Leads por estado</h2>
          <div className="space-y-3">
            {['nuevo', 'asignado', 'contactado', 'convertido', 'perdido'].map((estado) => {
              const count = stats.leadsPorEstado[estado] ?? 0
              const pct = Math.round((count / totalLeadsParaPct) * 100)
              return (
                <div key={estado} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${ESTADO_DOT[estado] ?? 'bg-gray-500'}`} />
                  <span className="text-sm text-gray-300 w-24 capitalize">{estado}</span>
                  <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm text-white w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Últimos leads */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Últimos leads</h2>
          {stats.ultimosLeads.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">Sin leads todavía</p>
          ) : (
            <div className="space-y-2.5">
              {stats.ultimosLeads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${ESTADO_DOT[lead.estado] ?? 'bg-gray-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{lead.nombre}</p>
                    <p className="text-xs text-gray-500">{(lead.ciudad as any)?.nombre ?? '—'}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
