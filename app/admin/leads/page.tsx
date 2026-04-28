'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type Lead } from '@/types'
import { Search, Filter, RefreshCw, Mail, Phone } from 'lucide-react'

const ESTADO_OPTIONS = ['todos', 'nuevo', 'asignado', 'contactado', 'convertido', 'perdido']
const ESTADO_COLORS: Record<string, string> = {
  nuevo:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
  asignado:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  contactado: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  convertido: 'bg-green-500/20 text-green-400 border-green-500/30',
  perdido:    'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const loadLeads = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('leads')
      .select('*, ciudad:ciudades(nombre)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (estadoFilter !== 'todos') {
      query = query.eq('estado', estadoFilter)
    }

    const { data } = await query
    setLeads((data as Lead[]) ?? [])
    setLoading(false)
  }, [estadoFilter])

  useEffect(() => { loadLeads() }, [loadLeads])

  async function cambiarEstado(leadId: string, nuevoEstado: string) {
    await supabase.from('leads').update({ estado: nuevoEstado }).eq('id', leadId)
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, estado: nuevoEstado as Lead['estado'] } : l))
    )
  }

  const filtered = leads.filter((l) =>
    search
      ? l.nombre.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        l.telefono.includes(search)
      : true
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de leads</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} leads</p>
        </div>
        <button
          onClick={loadLeads}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-xl text-gray-300 hover:text-white text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ESTADO_OPTIONS.map((e) => (
            <button
              key={e}
              onClick={() => setEstadoFilter(e)}
              className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-colors border ${
                estadoFilter === e
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No hay leads con esos filtros</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500 text-xs uppercase border-b border-gray-800">
                <tr>
                  <th className="text-left px-5 py-3">Nombre</th>
                  <th className="text-left px-5 py-3">Contacto</th>
                  <th className="text-left px-5 py-3">Ciudad</th>
                  <th className="text-left px-5 py-3">Perfil</th>
                  <th className="text-left px-5 py-3">Estado</th>
                  <th className="text-left px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-white font-medium">{lead.nombre}</td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        <a
                          href={`tel:${lead.telefono}`}
                          className="flex items-center gap-1.5 text-gray-300 hover:text-white"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {lead.telefono}
                        </a>
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1.5 text-gray-300 hover:text-white"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {lead.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">
                      {(lead.ciudad as { nombre?: string } | null)?.nombre ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">
                      <div className="text-xs space-y-0.5">
                        <div>{lead.edad ? `${lead.edad} años` : '—'}</div>
                        <div>{lead.urgencia === 'rapido' ? '🚀 Urgente' : '⏱ Normal'}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={lead.estado}
                        onChange={(e) => cambiarEstado(lead.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border bg-transparent cursor-pointer ${
                          ESTADO_COLORS[lead.estado] ?? ESTADO_COLORS.nuevo
                        }`}
                      >
                        {['nuevo', 'asignado', 'contactado', 'convertido', 'perdido'].map((e) => (
                          <option key={e} value={e} className="bg-gray-900 text-white">
                            {e}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {new Date(lead.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <a
                        href={`/admin/leads/${lead.id}`}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        Detalle →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
