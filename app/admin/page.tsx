import { createServiceClient } from '@/lib/supabase/server'
import { Users, Building2, TrendingUp, Euro, ArrowUpRight } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = createServiceClient()

  // Estadísticas en paralelo
  const [leadsRes, autoescuelasRes, conversionesRes] = await Promise.all([
    supabase.from('leads').select('id, estado, created_at', { count: 'exact' }),
    supabase.from('autoescuelas').select('id, plan', { count: 'exact' }).eq('activa', true),
    supabase.from('lead_assignments').select('id, precio_lead, estado', { count: 'exact' }),
  ])

  const totalLeads       = leadsRes.count ?? 0
  const totalAutoescuelas = autoescuelasRes.count ?? 0
  const assignments      = conversionesRes.data ?? []

  const ingresosBrutos = assignments.reduce((sum, a) => sum + (a.precio_lead ?? 0), 0)
  const convertidos    = assignments.filter((a) => a.estado === 'convertido').length

  const leadsHoy = (leadsRes.data ?? []).filter((l) => {
    const d = new Date(l.created_at)
    const hoy = new Date()
    return d.toDateString() === hoy.toDateString()
  }).length

  const stats = [
    { label: 'Total leads', value: totalLeads.toLocaleString('es-ES'), sub: `+${leadsHoy} hoy`, icon: Users, color: 'text-blue-400' },
    { label: 'Autoescuelas activas', value: totalAutoescuelas.toLocaleString('es-ES'), sub: `${(autoescuelasRes.data ?? []).filter((a) => a.plan === 'premium').length} premium`, icon: Building2, color: 'text-purple-400' },
    { label: 'Ingresos (leads)', value: `${ingresosBrutos.toFixed(0)}€`, sub: `${assignments.length} asignaciones`, icon: Euro, color: 'text-green-400' },
    { label: 'Conversiones', value: convertidos.toLocaleString('es-ES'), sub: `${assignments.length > 0 ? ((convertidos / assignments.length) * 100).toFixed(1) : 0}% ratio`, icon: TrendingUp, color: 'text-orange-400' },
  ]

  // Últimos 10 leads
  const { data: ultimosLeads } = await supabase
    .from('leads')
    .select('id, nombre, email, telefono, estado, created_at, ciudad:ciudades(nombre)')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Resumen de actividad de CarnetYa</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-3xl font-black text-white mb-1">{value}</p>
            <p className="text-xs text-gray-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* Últimos leads */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Últimos leads</h2>
          <a href="/admin/leads" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-6 py-3">Nombre</th>
                <th className="text-left px-6 py-3">Ciudad</th>
                <th className="text-left px-6 py-3">Estado</th>
                <th className="text-left px-6 py-3">Fecha</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(ultimosLeads ?? []).map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-3 text-white font-medium">{lead.nombre}</td>
                  <td className="px-6 py-3 text-gray-400">
                    {(lead.ciudad as { nombre?: string } | null)?.nombre ?? '—'}
                  </td>
                  <td className="px-6 py-3">
                    <EstadoBadge estado={lead.estado} />
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-3">
                    <a
                      href={`/admin/leads/${lead.id}`}
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      Ver →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    nuevo:      'bg-blue-500/20 text-blue-400',
    asignado:   'bg-yellow-500/20 text-yellow-400',
    contactado: 'bg-purple-500/20 text-purple-400',
    convertido: 'bg-green-500/20 text-green-400',
    perdido:    'bg-gray-500/20 text-gray-400',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[estado] ?? map.nuevo}`}>
      {estado}
    </span>
  )
}
