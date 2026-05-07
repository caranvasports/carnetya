'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, RefreshCw, Mail, Phone, AlertCircle, Database, CheckCircle2, ChevronDown } from 'lucide-react'

type Lead = {
  id: string
  nombre: string
  telefono: string
  email: string
  tipo_carnet: string | null
  urgencia: string
  edad: number | null
  tiene_experiencia: boolean
  estado: string
  utm_source: string | null
  ciudad_id: string | null
  ciudad?: { nombre?: string | null; slug?: string | null } | null
  created_at: string
}

const ESTADOS = ['nuevo', 'asignado', 'contactado', 'convertido', 'perdido'] as const
const ESTADO_STYLE: Record<string, { badge: string; dot: string }> = {
  nuevo:      { badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',    dot: 'bg-blue-400' },
  asignado:   { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
  contactado: { badge: 'bg-violet-500/15 text-violet-400 border-violet-500/30', dot: 'bg-violet-400' },
  convertido: { badge: 'bg-green-500/15 text-green-400 border-green-500/30',  dot: 'bg-green-400' },
  perdido:    { badge: 'bg-gray-500/15 text-gray-400 border-gray-600',        dot: 'bg-gray-500' },
}

function EstadoBadge({ estado, onChange }: { estado: string; onChange: (e: string) => void }) {
  const [open, setOpen] = useState(false)
  const style = ESTADO_STYLE[estado] ?? ESTADO_STYLE.nuevo
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.badge}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {estado}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 top-8 z-20 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden w-36">
          {ESTADOS.map((e) => (
            <button
              key={e}
              onClick={() => { onChange(e); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-700 transition-colors ${e === estado ? 'text-white font-semibold' : 'text-gray-300'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${ESTADO_STYLE[e]?.dot}`} />
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function LeadSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-5 py-4 border-b border-gray-800/50 flex items-center gap-4">
          <div className="w-32 h-4 bg-gray-800 rounded" />
          <div className="flex-1 space-y-2">
            <div className="w-28 h-3 bg-gray-800 rounded" />
            <div className="w-40 h-3 bg-gray-800 rounded" />
          </div>
          <div className="w-20 h-6 bg-gray-800 rounded-full" />
          <div className="w-16 h-3 bg-gray-800 rounded" />
        </div>
      ))}
    </div>
  )
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [noTable, setNoTable] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupDone, setSetupDone] = useState(false)
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [search, setSearch] = useState('')

  const loadLeads = useCallback(async () => {
    setLoading(true)
    setNoTable(false)
    const params = new URLSearchParams()
    if (estadoFilter !== 'todos') params.set('estado', estadoFilter)
    const res = await fetch(`/api/admin/leads?${params}`)
    if (res.status === 404) {
      const json = await res.json().catch(() => ({}))
      if (json.noTable) { setNoTable(true); setLoading(false); return }
    }
    if (res.ok) {
      const data = await res.json()
      setLeads(data)
    }
    setLoading(false)
  }, [estadoFilter])

  useEffect(() => { loadLeads() }, [loadLeads])

  async function setupDb() {
    setSetupLoading(true)
    const res = await fetch('/api/admin/setup-db', { method: 'POST' })
    setSetupLoading(false)
    if (res.ok) {
      setSetupDone(true)
      setNoTable(false)
      setTimeout(loadLeads, 500)
    }
  }

  async function cambiarEstado(leadId: string, nuevoEstado: string) {
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, estado: nuevoEstado } : l))
    await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId, estado: nuevoEstado }),
    })
  }

  const filtered = leads.filter((l) => {
    if (!search) return true
    const q = search.toLowerCase()
    return l.nombre.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.telefono.includes(q)
  })

  const counts = leads.reduce((acc, l) => ({ ...acc, [l.estado]: (acc[l.estado] ?? 0) + 1 }), {} as Record<string, number>)

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {loading ? 'Cargando...' : noTable ? 'Base de datos no configurada' : `${filtered.length} de ${leads.length} leads`}
          </p>
        </div>
        <button
          onClick={loadLeads}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 hover:text-white text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Setup DB Banner */}
      {noTable && (
        <div className="bg-gray-900 border border-amber-500/30 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Tabla de leads no creada</h3>
              <p className="text-gray-400 text-sm mb-4">
                Los leads llegan por email a <span className="text-white">carnetyainfo@gmail.com</span>.
                Para gestionarlos aquí, crea la tabla con un clic:
              </p>
              <button
                onClick={setupDb}
                disabled={setupLoading || setupDone}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                {setupDone ? (
                  <><CheckCircle2 className="w-4 h-4" /> Tabla creada — recargando...</>
                ) : setupLoading ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Creando tabla...</>
                ) : (
                  <><Database className="w-4 h-4" /> Crear tabla de leads</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {!noTable && (
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre, email o teléfono..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['todos', ...ESTADOS] as string[]).map((e) => (
              <button
                key={e}
                onClick={() => setEstadoFilter(e)}
                className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors border ${
                  estadoFilter === e
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'
                }`}
              >
                {e}
                {e !== 'todos' && counts[e] ? (
                  <span className="ml-1.5 opacity-60 font-normal">{counts[e]}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {!noTable && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {loading ? (
            <LeadSkeleton />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <AlertCircle className="w-8 h-8 text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium">
                {leads.length === 0 ? 'Todavía no hay leads' : 'No hay leads con esos filtros'}
              </p>
              {leads.length === 0 && (
                <p className="text-gray-600 text-sm mt-1">Los formularios de la web enviarán leads aquí en tiempo real</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Contacto</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Carnet</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">{lead.nombre}</div>
                        <div className="text-xs text-gray-500 mt-0.5 flex gap-2">
                          {lead.ciudad?.nombre && <span>{lead.ciudad.nombre}</span>}
                          {lead.edad && <span>{lead.edad} años</span>}
                          {lead.tiene_experiencia && <span>· Con experiencia</span>}
                          {lead.urgencia === 'rapido' && <span className="text-orange-400">· Urgente</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <a href={`tel:${lead.telefono}`} className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm transition-colors mb-1">
                          <Phone className="w-3.5 h-3.5 text-gray-500" />
                          {lead.telefono}
                        </a>
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs transition-colors">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        {lead.tipo_carnet ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-300 text-xs font-medium border border-blue-600/20">
                            {lead.tipo_carnet}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <EstadoBadge
                          estado={lead.estado}
                          onChange={(e) => cambiarEstado(lead.id, e)}
                        />
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                        <div className="text-gray-600 mt-0.5">
                          {new Date(lead.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
