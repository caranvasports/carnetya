'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { CreditCard, TrendingUp, ArrowUpRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface LeadAsignacion {
  id: string
  precio_lead: number
  created_at: string
  estado: string
  lead: {
    nombre: string
    ciudad: string
  }
}

export default function FacturacionPage() {
  const [asignaciones, setAsignaciones] = useState<LeadAsignacion[]>([])
  const [plan, setPlan] = useState<string>('free')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: u } = await supabase
        .from('usuarios')
        .select('autoescuela_id')
        .eq('id', user.id)
        .single()
      if (!u?.autoescuela_id) return

      const [{ data: ae }, { data: leads }] = await Promise.all([
        supabase.from('autoescuelas').select('plan').eq('id', u.autoescuela_id).single(),
        supabase
          .from('lead_assignments')
          .select('id, precio_lead, created_at, estado, lead:leads(nombre, ciudad_id)')
          .eq('autoescuela_id', u.autoescuela_id)
          .order('created_at', { ascending: false })
          .limit(50),
      ])

      if (ae) setPlan(ae.plan)
      setAsignaciones((leads as any[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const totalPagado = asignaciones.reduce((sum, a) => sum + (a.precio_lead ?? 0), 0)
  const leadsMes = asignaciones.filter((a) => {
    const fecha = new Date(a.created_at)
    const ahora = new Date()
    return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
  }).length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
          <p className="text-gray-500 text-sm mt-1">Historial de leads y tu plan actual</p>
        </div>
        <Link href="/autoescuela/planes" className="btn-primary text-sm gap-2">
          <TrendingUp className="w-4 h-4" />
          Mejorar plan
        </Link>
      </div>

      {/* Plan actual */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Plan actual</p>
          <p className="text-2xl font-black text-gray-900 capitalize">{plan}</p>
          <Link href="/autoescuela/planes" className="text-xs text-brand-600 hover:underline flex items-center gap-1 mt-2">
            Cambiar plan <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Leads este mes</p>
          <p className="text-2xl font-black text-gray-900">{leadsMes}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Gasto total en leads</p>
          <p className="text-2xl font-black text-gray-900">{formatPrice(totalPagado)}</p>
        </div>
      </div>

      {/* Historial */}
      <h2 className="text-lg font-bold text-gray-900 mb-3">Historial de leads recibidos</h2>
      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : asignaciones.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aún no has recibido leads.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Alumno</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Fecha</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Estado</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Coste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {asignaciones.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 font-medium text-gray-900">
                    {(a.lead as any)?.nombre ?? 'Anónimo'}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">
                    {new Date(a.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge text-xs ${
                      a.estado === 'convertido'
                        ? 'bg-green-100 text-green-700'
                        : a.estado === 'contactado'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {a.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-gray-900">
                    {a.precio_lead ? `${a.precio_lead}€` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
