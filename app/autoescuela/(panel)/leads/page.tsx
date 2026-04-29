'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Phone, Mail, Clock, CheckCircle, Eye } from 'lucide-react'

type LeadAssignmentWithLead = {
  id: string
  lead_id: string
  precio_lead: number
  estado: string
  created_at: string
  lead: {
    id: string
    nombre: string
    telefono: string
    email: string
    edad?: number
    urgencia: string
    tiene_experiencia: boolean
    ciudad?: { nombre: string }
  }
}

const ESTADO_COLORS: Record<string, string> = {
  enviado:    'bg-blue-100 text-blue-700',
  visto:      'bg-gray-100 text-gray-700',
  contactado: 'bg-yellow-100 text-yellow-700',
  convertido: 'bg-green-100 text-green-700',
  rechazado:  'bg-red-100 text-red-700',
}

export default function AutoescuelaLeadsPage() {
  const [assignments, setAssignments] = useState<LeadAssignmentWithLead[]>([])
  const [loading, setLoading] = useState(true)
  const [autoescuelaId, setAutoescuelaId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: u } = await supabase.from('usuarios').select('autoescuela_id').eq('id', user.id).single()
      if (u?.autoescuela_id) setAutoescuelaId(u.autoescuela_id)
    }
    init()
  }, [])

  const loadLeads = useCallback(async () => {
    if (!autoescuelaId) return
    setLoading(true)
    const { data } = await supabase
      .from('lead_assignments')
      .select('*, lead:leads(*, ciudad:ciudades(nombre))')
      .eq('autoescuela_id', autoescuelaId)
      .order('created_at', { ascending: false })

    setAssignments((data as LeadAssignmentWithLead[]) ?? [])
    setLoading(false)
  }, [autoescuelaId])

  useEffect(() => { loadLeads() }, [loadLeads])

  async function marcarVisto(assignId: string, leadId: string) {
    await supabase
      .from('lead_assignments')
      .update({ estado: 'visto', visto_at: new Date().toISOString() })
      .eq('id', assignId)

    setAssignments((prev) =>
      prev.map((a) => (a.id === assignId ? { ...a, estado: 'visto' } : a))
    )
  }

  async function cambiarEstado(assignId: string, nuevoEstado: string) {
    const update: Record<string, string> = { estado: nuevoEstado }
    if (nuevoEstado === 'contactado') update.contactado_at = new Date().toISOString()

    await supabase.from('lead_assignments').update(update).eq('id', assignId)
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignId ? { ...a, estado: nuevoEstado } : a))
    )
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">Cargando leads...</div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis leads</h1>
        <p className="text-gray-500 text-sm mt-1">
          {assignments.length} leads recibidos ·{' '}
          {assignments.filter((a) => a.estado === 'enviado').length} sin ver
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <p className="font-medium text-lg mb-2">Aún no tienes leads</p>
          <p className="text-sm">Cuando un alumno solicite información en tu ciudad, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => {
            const lead = a.lead
            const isNew = a.estado === 'enviado'

            return (
              <div
                key={a.id}
                className={`card p-5 ${isNew ? 'ring-2 ring-brand-400' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Info alumno */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{lead.nombre}</h3>
                      {isNew && (
                        <span className="badge bg-brand-100 text-brand-700 text-xs">Nuevo</span>
                      )}
                      <span className={`badge text-xs ${ESTADO_COLORS[a.estado] ?? ESTADO_COLORS.visto}`}>
                        {a.estado}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <a href={`tel:${lead.telefono}`} className="hover:text-brand-600 font-medium">
                          {lead.telefono}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <a href={`mailto:${lead.email}`} className="hover:text-brand-600">
                          {lead.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {lead.urgencia === 'rapido' ? '🚀 Urgente' : '⏱ Normal'}
                          {lead.edad ? ` · ${lead.edad} años` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        Recibido {new Date(a.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2 min-w-[160px]">
                    {isNew && (
                      <button
                        onClick={() => marcarVisto(a.id, a.lead_id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Marcar visto
                      </button>
                    )}
                    <a
                      href={`tel:${lead.telefono}`}
                      onClick={() => cambiarEstado(a.id, 'contactado')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 text-sm transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Llamar ahora
                    </a>
                    <select
                      value={a.estado}
                      onChange={(e) => cambiarEstado(a.id, e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white"
                    >
                      {['enviado', 'visto', 'contactado', 'convertido', 'rechazado'].map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
