import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, UserCheck, Calendar, CreditCard, Settings, LogOut, Car } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const navItems = [
  { label: 'Dashboard',  href: '/autoescuela/dashboard', icon: LayoutDashboard },
  { label: 'Mis leads',  href: '/autoescuela/leads', icon: Users },
  { label: 'Alumnos',    href: '/autoescuela/alumnos', icon: UserCheck },
  { label: 'Calendario', href: '/autoescuela/calendario', icon: Calendar },
  { label: 'Facturación', href: '/autoescuela/facturacion', icon: CreditCard },
  { label: 'Mi perfil',  href: '/autoescuela/perfil', icon: Settings },
]

export default async function AutoescuelaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/autoescuela/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('role, nombre, autoescuela_id')
    .eq('id', user.id)
    .single()

  if (!usuario || !['admin', 'autoescuela'].includes(usuario.role)) redirect('/')

  const { data: autoescuela } = usuario.autoescuela_id
    ? await supabase
        .from('autoescuelas')
        .select('nombre, plan')
        .eq('id', usuario.autoescuela_id)
        .single()
    : { data: null }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none truncate max-w-[150px]">
                {autoescuela?.nombre ?? 'Mi Autoescuela'}
              </p>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{autoescuela?.plan ?? 'free'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors text-sm font-medium group"
            >
              <Icon className="w-4 h-4 group-hover:text-brand-600" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-gray-500">Conectado como</p>
            <p className="text-sm font-medium text-gray-800 truncate">{usuario.nombre ?? user.email}</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full text-sm"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
