'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Phone, Mail, Clock, Eye, Lock, ExternalLink } from 'lucide-react'

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
    tipo_carnet?: string
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
  const [plan, setPlan] = useState<string>('free')
  const [paypalUrl, setPaypalUrl] = useState('https://www.paypal.com/paypalme/carnetya')
  const [leadPrice, setLeadPrice] = useState('8')
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [emailMsg, setEmailMsg] = useState<{ id: string; ok: boolean; text: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: u } = await supabase
        .from('usuarios')
        .select('autoescuela_id, autoescuelas(plan)')
        .eq('id', user.id)
        .single()
      if (u?.autoescuela_id) {
        setAutoescuelaId(u.autoescuela_id)
        const p = (u as { autoescuelas?: { plan?: string } }).autoescuelas?.plan ?? 'free'
        setPlan(p)
      }

      // Load config
      const { data: cfgRows } = await supabase
        .from('email_config')
        .select('key, value')
        .in('key', ['paypal_url', 'lead_price'])
      for (const row of cfgRows ?? []) {
        if (row.key === 'paypal_url') setPaypalUrl(row.value)
        if (row.key === 'lead_price') setLeadPrice(row.value)
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, [autoescuelaId, supabase])

  useEffect(() => { loadLeads() }, [loadLeads])

  async function marcarVisto(assignId: string) {
    await supabase
      .from('lead_assignments')
      .update({ estado: 'visto', visto_at: new Date().toISOString() })
      .eq('id', assignId)
    setAssignments((prev) => prev.map((a) => (a.id === assignId ? { ...a, estado: 'visto' } : a)))
  }

  async function cambiarEstado(assignId: string, nuevoEstado: string) {
    const update: Record<string, string> = { estado: nuevoEstado }
    if (nuevoEstado === 'contactado') update.contactado_at = new Date().toISOString()
    await supabase.from('lead_assignments').update(update).eq('id', assignId)
    setAssignments((prev) => prev.map((a) => (a.id === assignId ? { ...a, estado: nuevoEstado } : a)))
  }

  async function enviarEmail(assignId: string) {
    setSendingEmail(assignId)
    setEmailMsg(null)
    try {
      const res = await fetch('/api/autoescuela/leads/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: assignId }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setEmailMsg({ id: assignId, ok: true, text: `Email enviado a ${data.sentTo ?? 'alumno'}` })
        setAssignments((prev) => prev.map((a) => (a.id === assignId ? { ...a, estado: 'contactado' } : a)))
      } else {
        setEmailMsg({ id: assignId, ok: false, text: data.error ?? 'Error al enviar' })
      }
    } catch {
      setEmailMsg({ id: assignId, ok: false, text: 'Error de red' })
    }
    setSendingEmail(null)
    setTimeout(() => setEmailMsg(null), 8000)
  }

  const isFree = plan === 'free'

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando leads...</div>

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis leads</h1>
        <p className="text-gray-500 text-sm mt-1">
          {assignments.length} leads recibidos ·{' '}
          {assignments.filter((a) => a.estado === 'enviado').length} sin ver
        </p>
        {isFree && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Lock className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800 text-sm">Plan gratuito — datos de contacto bloqueados</p>
              <p className="text-amber-700 text-xs mt-0.5">Activa tu cuenta ({leadPrice}€/lead) para ver nombre, teléfono y email de cada alumno.</p>
            </div>
            <a
              href={paypalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#0070ba] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#005ea6] transition-colors shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              Pagar con PayPal
            </a>
            <a
              href="/autoescuela/registro"
              className="flex items-center gap-1.5 bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors shrink-0"
            >
              Registrarme
            </a>
          </div>
        )}
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
              <div key={a.id} className={`card p-5 ${isNew ? 'ring-2 ring-brand-400' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Name: blurred for free plan */}
                      {isFree ? (
                        <span className="font-bold text-gray-900 blur-sm select-none">Nombre Apellido</span>
                      ) : (
                        <h3 className="font-bold text-gray-900">{lead.nombre}</h3>
                      )}
                      {isNew && <span className="badge bg-brand-100 text-brand-700 text-xs">Nuevo</span>}
                      <span className={`badge text-xs ${ESTADO_COLORS[a.estado] ?? ESTADO_COLORS.visto}`}>
                        {a.estado}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      {/* Phone */}
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {isFree ? (
                          <span className="blur-sm select-none font-medium text-brand-600">6XX XXX XXX</span>
                        ) : (
                          <a href={`tel:${lead.telefono}`} className="hover:text-brand-600 font-medium">{lead.telefono}</a>
                        )}
                      </div>
                      {/* Email */}
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {isFree ? (
                          <span className="blur-sm select-none">alumno@email.com</span>
                        ) : (
                          <a href={`mailto:${lead.email}`} className="hover:text-brand-600">{lead.email}</a>
                        )}
                      </div>
                      {/* Urgencia — visible siempre */}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {lead.urgencia === 'rapido' ? '🚀 Urgente' : '⏱ Normal'}
                          {lead.edad ? ` · ${lead.edad} años` : ''}
                          {lead.tipo_carnet ? ` · Carnet ${lead.tipo_carnet}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        {lead.ciudad?.nombre ?? ''}
                        {' · '}Recibido {new Date(a.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>

                    {isFree && (
                      <div className="flex items-center gap-2 mt-2">
                        <Lock className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-amber-700 font-medium">
                          Datos bloqueados — paga {leadPrice}€ para desbloquear
                        </span>
                        <a
                          href={paypalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#0070ba] hover:underline font-semibold"
                        >
                          Pagar con PayPal →
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions — only for paid plans */}
                  {!isFree && (
                    <div className="flex flex-col gap-2 min-w-[160px]">
                      {isNew && (
                        <button
                          onClick={() => marcarVisto(a.id)}
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
                      <button
                        onClick={() => enviarEmail(a.id)}
                        disabled={sendingEmail === a.id}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm transition-colors disabled:opacity-50"
                      >
                        <Mail className="w-4 h-4" />
                        {sendingEmail === a.id ? 'Enviando...' : 'Enviar email'}
                      </button>
                      {emailMsg?.id === a.id && (
                        <span className={`text-xs font-medium ${emailMsg.ok ? 'text-green-600' : 'text-red-500'}`}>
                          {emailMsg.text}
                        </span>
                      )}
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
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

