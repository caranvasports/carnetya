import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, UserCheck, Euro, TrendingUp, ArrowRight } from 'lucide-react'
import { FASE_LABELS, FASE_COLORS } from '@/lib/utils'

export default async function AutoescuelaDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/autoescuela/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('autoescuela_id')
    .eq('id', user.id)
    .single()

  if (!usuario?.autoescuela_id) redirect('/autoescuela/registro')
  const aeId = usuario.autoescuela_id

  // Stats en paralelo
  const [leadsRes, alumnosRes, clasesRes, asignacionesRes] = await Promise.all([
    supabase.from('lead_assignments').select('id, estado, created_at').eq('autoescuela_id', aeId),
    supabase.from('alumnos').select('id, fase, activo').eq('autoescuela_id', aeId).eq('activo', true),
    supabase.from('clases').select('id, estado').eq('autoescuela_id', aeId).eq('estado', 'realizada'),
    supabase.from('lead_assignments').select('precio_lead').eq('autoescuela_id', aeId),
  ])

  const leads     = leadsRes.data ?? []
  const alumnos   = alumnosRes.data ?? []
  const clasesHechas = clasesRes.count ?? 0
  const totalPagado  = (asignacionesRes.data ?? []).reduce((s, a) => s + (a.precio_lead ?? 0), 0)

  const leadsNuevos    = leads.filter((l) => l.estado === 'enviado').length
  const leadsContactados = leads.filter((l) => l.estado === 'contactado').length
  const alumnosActivos = alumnos.length
  const aprobados      = alumnos.filter((a) => a.fase === 'aprobado').length

  // Próximas clases
  const { data: proximasClases } = await supabase
    .from('clases')
    .select('*, alumno:alumnos(nombre, apellidos)')
    .eq('autoescuela_id', aeId)
    .eq('estado', 'programada')
    .gte('fecha_inicio', new Date().toISOString())
    .order('fecha_inicio')
    .limit(5)

  const stats = [
    { label: 'Leads nuevos', value: leadsNuevos, sub: `${leadsContactados} contactados`, icon: Users, color: 'bg-blue-50 text-blue-600', href: '/autoescuela/leads' },
    { label: 'Alumnos activos', value: alumnosActivos, sub: `${aprobados} aprobados`, icon: UserCheck, color: 'bg-green-50 text-green-600', href: '/autoescuela/alumnos' },
    { label: 'Clases realizadas', value: clasesHechas, sub: 'total', icon: TrendingUp, color: 'bg-purple-50 text-purple-600', href: '/autoescuela/calendario' },
    { label: 'Leads pagados', value: `${totalPagado.toFixed(0)}€`, sub: `${leads.length} total`, icon: Euro, color: 'bg-orange-50 text-orange-600', href: '/autoescuela/facturacion' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen de tu autoescuela</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Estado alumnos */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Estado de alumnos</h2>
            <Link href="/autoescuela/alumnos" className="text-sm text-brand-600 hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-2">
            {Object.entries(FASE_LABELS).map(([fase, label]) => {
              const count = alumnos.filter((a) => a.fase === fase).length
              if (count === 0) return null
              return (
                <div key={fase} className="flex items-center justify-between">
                  <span className={`badge ${FASE_COLORS[fase]}`}>{label}</span>
                  <span className="font-bold text-gray-900">{count}</span>
                </div>
              )
            })}
            {alumnosActivos === 0 && (
              <p className="text-gray-400 text-sm">No hay alumnos activos aún</p>
            )}
          </div>
        </div>

        {/* Próximas clases */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Próximas clases</h2>
            <Link href="/autoescuela/calendario" className="text-sm text-brand-600 hover:underline">
              Ver calendario →
            </Link>
          </div>
          <div className="space-y-3">
            {(proximasClases ?? []).length === 0 ? (
              <p className="text-gray-400 text-sm">No hay clases programadas</p>
            ) : (
              (proximasClases ?? []).map((clase) => {
                const fecha = new Date(clase.fecha_inicio)
                const alumno = clase.alumno as { nombre?: string; apellidos?: string } | null
                return (
                  <div key={clase.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex flex-col items-center justify-center text-xs font-bold text-brand-600 flex-shrink-0">
                      <span>{fecha.getDate()}</span>
                      <span className="font-normal">{fecha.toLocaleDateString('es-ES', { month: 'short' })}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {alumno?.nombre} {alumno?.apellidos}
                      </p>
                      <p className="text-xs text-gray-500">
                        {fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        {clase.profesor && ` · ${clase.profesor}`}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
