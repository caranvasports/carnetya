'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Phone, MessageSquare, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

type ContactEntry = {
  id: string
  tipo: string
  asunto: string | null
  mensaje_html: string | null
  enviado_ok: boolean
  error_msg: string | null
  created_at: string
  lead: {
    nombre: string
    email: string
    telefono: string
    ciudad?: { nombre: string }
  }
}

const TIPO_ICON: Record<string, React.ReactNode> = {
  email:    <Mail className="w-4 h-4 text-blue-500" />,
  llamada:  <Phone className="w-4 h-4 text-green-500" />,
  whatsapp: <MessageSquare className="w-4 h-4 text-emerald-500" />,
}

export default function HistorialContactosPage() {
  const [entries, setEntries] = useState<ContactEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [autoescuelaId, setAutoescuelaId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: u } = await supabase
        .from('usuarios')
        .select('autoescuela_id')
        .eq('id', user.id)
        .single()
      if (u?.autoescuela_id) setAutoescuelaId(u.autoescuela_id)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!autoescuelaId) return
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('contact_log')
        .select('*, lead:leads(nombre, email, telefono, ciudad:ciudades(nombre))')
        .eq('autoescuela_id', autoescuelaId)
        .order('created_at', { ascending: false })
        .limit(200)
      setEntries((data as ContactEntry[]) ?? [])
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoescuelaId])

  const stats = {
    total: entries.length,
    ok: entries.filter((e) => e.enviado_ok).length,
    error: entries.filter((e) => !e.enviado_ok).length,
    leadsUnicos: new Set(entries.map((e) => (e.lead as { nombre?: string })?.nombre ?? '')).size,
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de contactos</h1>
          <p className="text-gray-500 text-sm mt-1">Registro de todos los emails enviados a tus leads</p>
        </div>
        <button
          onClick={() => setAutoescuelaId((id) => id)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total enviados', value: stats.total, color: 'bg-blue-50 text-blue-700' },
          { label: 'Enviados OK', value: stats.ok, color: 'bg-green-50 text-green-700' },
          { label: 'Con error', value: stats.error, color: 'bg-red-50 text-red-700' },
          { label: 'Leads contactados', value: stats.leadsUnicos, color: 'bg-purple-50 text-purple-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl p-4 ${color}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium mt-1 opacity-80">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Cargando historial...
        </div>
      ) : entries.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-lg mb-1">Sin contactos aún</p>
          <p className="text-sm">Cuando envíes emails a tus leads, aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const lead = entry.lead as { nombre: string; email: string; telefono: string; ciudad?: { nombre: string } }
            const isOpen = expanded === entry.id

            return (
              <div key={entry.id} className="card overflow-hidden">
                <div
                  className="p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : entry.id)}
                >
                  <div className="mt-0.5">{TIPO_ICON[entry.tipo] ?? <Mail className="w-4 h-4 text-gray-400" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{lead?.nombre ?? 'Alumno'}</span>
                      <span className="text-gray-400 text-xs">{lead?.email}</span>
                      {lead?.ciudad?.nombre && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {lead.ciudad.nombre}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{entry.asunto ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {entry.enviado_ok ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Enviado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Error
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(entry.created_at).toLocaleString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    {entry.error_msg && (
                      <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-600">
                        <strong>Error:</strong> {entry.error_msg}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mb-2 font-semibold">Vista previa del email enviado:</div>
                    {entry.mensaje_html ? (
                      <div
                        className="bg-white border border-gray-200 rounded-lg p-4 max-h-64 overflow-auto text-sm"
                        dangerouslySetInnerHTML={{ __html: entry.mensaje_html }}
                      />
                    ) : (
                      <p className="text-sm text-gray-400 italic">Sin contenido guardado</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
