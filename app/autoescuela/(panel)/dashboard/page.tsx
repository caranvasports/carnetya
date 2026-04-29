import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, UserCheck, Euro, TrendingUp, AlertCircle } from 'lucide-react'

export default async function AutoescuelaDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/autoescuela/login')

  // Intentar leer datos; si las tablas no existen mostrar estado de configuración
  let dbReady = false
  let leadsNuevos = 0, leadsContactados = 0, alumnosActivos = 0, totalPagado = 0
  try {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('autoescuela_id')
      .eq('id', user.id)
      .single()

    if (usuario?.autoescuela_id) {
      const aeId = usuario.autoescuela_id
      const [leadsRes, alumnosRes, asignRes] = await Promise.all([
        supabase.from('lead_assignments').select('estado').eq('autoescuela_id', aeId),
        supabase.from('alumnos').select('id').eq('autoescuela_id', aeId).eq('activo', true),
        supabase.from('lead_assignments').select('precio_lead').eq('autoescuela_id', aeId),
      ])
      leadsNuevos     = (leadsRes.data ?? []).filter((l) => l.estado === 'enviado').length
      leadsContactados = (leadsRes.data ?? []).filter((l) => l.estado === 'contactado').length
      alumnosActivos  = (alumnosRes.data ?? []).length
      totalPagado     = (asignRes.data ?? []).reduce((s, a) => s + (a.precio_lead ?? 0), 0)
      dbReady = true
    }
  } catch { /* tablas no configuradas */ }

  if (!dbReady) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel en configuración</h1>
        <p className="text-gray-500 max-w-md mb-6">
          Tu cuenta está activa. El equipo de CarnetYa está configurando tu panel. 
          Recibirás un email en <strong>{user.email}</strong> cuando esté listo.
        </p>
        <p className="text-sm text-gray-400">
          ¿Tienes dudas? Escríbenos a{' '}
          <a href="mailto:carnetyainfo@gmail.com" className="text-brand-600 hover:underline">
            carnetyainfo@gmail.com
          </a>
        </p>
      </div>
    )
  }

  const stats = [
    { label: 'Leads nuevos',    value: leadsNuevos,                sub: `${leadsContactados} contactados`, icon: Users,        color: 'bg-blue-50 text-blue-600',   href: '/autoescuela/leads' },
    { label: 'Alumnos activos', value: alumnosActivos,             sub: 'activos hoy',                     icon: UserCheck,    color: 'bg-green-50 text-green-600', href: '/autoescuela/alumnos' },
    { label: 'Clases',          value: '—',                        sub: 'ver calendario',                  icon: TrendingUp,   color: 'bg-purple-50 text-purple-600', href: '/autoescuela/calendario' },
    { label: 'Leads pagados',   value: `${totalPagado.toFixed(0)}€`, sub: 'total acumulado',               icon: Euro,         color: 'bg-orange-50 text-orange-600', href: '/autoescuela/facturacion' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen de tu autoescuela</p>
      </div>
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
    </div>
  )
}
