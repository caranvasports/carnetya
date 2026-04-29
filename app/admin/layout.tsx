import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Building2, Settings, BarChart3, LogOut } from 'lucide-react'
import { getAdminSession } from '@/lib/admin-auth'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Leads',     href: '/admin/leads', icon: Users },
  { label: 'Autoescuelas', href: '/admin/autoescuelas', icon: Building2 },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Config',    href: '/admin/config', icon: Settings },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <span className="text-lg font-bold">
            Carnet<span className="text-cta">Ya</span>
            <span className="text-xs text-gray-400 ml-2">Admin</span>
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 px-3 mb-3 truncate">{session.email}</p>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full text-sm"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-950">
        {children}
      </main>
    </div>
  )
}
