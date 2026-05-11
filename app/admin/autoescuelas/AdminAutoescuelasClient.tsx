'use client'

import { useEffect, useMemo, useState } from 'react'
import { Building2, CheckCircle, Mail, Plus, RefreshCw, Search, Send, XCircle } from 'lucide-react'
import { CIUDADES } from '@/data/cities'

type AutoescuelaAdmin = {
  id: string
  nombre: string
  slug: string
  email: string | null
  telefono: string | null
  plan: string
  activa: boolean
  verificada: boolean
  captacion_marcada?: boolean
  captacion_estado?: string
  captacion_email_sent_at?: string | null
  registered?: boolean
  leads_count?: number
  ciudad?: { nombre?: string | null; slug?: string | null } | null
}

export default function AdminAutoescuelasClient({ initialAutoescuelas }: { initialAutoescuelas: AutoescuelaAdmin[] }) {
  const [autoescuelas, setAutoescuelas] = useState(initialAutoescuelas)
  const [loading, setLoading] = useState(false)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', ciudad_slug: '', telefono: '', contacto_nombre: '', web: '' })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/autoescuelas')
    if (res.ok) setAutoescuelas(await res.json())
    setLoading(false)
  }

  useEffect(() => { if (!initialAutoescuelas.length) load() }, [])

  async function createAutoescuela(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/autoescuelas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, marcada: true }),
    })
    setLoading(false)
    if (res.ok) {
      setForm({ nombre: '', email: '', ciudad_slug: '', telefono: '', contacto_nombre: '', web: '' })
      setFormOpen(false)
      load()
    }
  }

  async function toggleMarcada(autoescuela: AutoescuelaAdmin) {
    setAutoescuelas((prev) => prev.map((a) => a.id === autoescuela.id ? { ...a, captacion_marcada: !a.captacion_marcada } : a))
    await fetch('/api/admin/autoescuelas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: autoescuela.id, captacion_marcada: !autoescuela.captacion_marcada }),
    })
  }

  async function sendInvite(autoescuela: AutoescuelaAdmin) {
    setSendingId(autoescuela.id)
    const res = await fetch('/api/admin/autoescuelas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: autoescuela.id }),
    })
    setSendingId(null)
    if (res.ok) load()
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return autoescuelas
    return autoescuelas.filter((a) =>
      a.nombre.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.ciudad?.nombre?.toLowerCase().includes(q)
    )
  }, [autoescuelas, search])

  const stats = useMemo(() => ({
    total: autoescuelas.length,
    marcadas: autoescuelas.filter((a) => a.captacion_marcada).length,
    registradas: autoescuelas.filter((a) => a.registered).length,
    leads: autoescuelas.reduce((sum, a) => sum + (a.leads_count ?? 0), 0),
  }), [autoescuelas])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Autoescuelas</h1>
          <p className="text-gray-400 text-sm mt-1">Captación, registro y leads por autoescuela</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
          <button onClick={() => setFormOpen((v) => !v)} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Añadir
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {[
          ['Total', stats.total],
          ['Marcadas', stats.marcadas],
          ['Registradas', stats.registradas],
          ['Leads asignados', stats.leads],
        ].map(([label, value]) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-black text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      {formOpen && (
        <form onSubmit={createAutoescuela} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 grid md:grid-cols-3 gap-4">
          <input required placeholder="Nombre autoescuela" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white" />
          <select required value={form.ciudad_slug} onChange={(e) => setForm({ ...form, ciudad_slug: e.target.value })} className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white">
            <option value="">Ciudad</option>
            {CIUDADES.map((c) => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
          </select>
          <input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white" />
          <input placeholder="Persona de contacto" value={form.contacto_nombre} onChange={(e) => setForm({ ...form, contacto_nombre: e.target.value })} className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white" />
          <input placeholder="Web" value={form.web} onChange={(e) => setForm({ ...form, web: e.target.value })} className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white" />
          <button disabled={loading} className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50">Guardar autoescuela</button>
        </form>
      )}

      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, email o ciudad..." className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Autoescuela</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Ciudad</th>
              <th className="text-center px-5 py-3 font-medium">Marcada</th>
              <th className="text-center px-5 py-3 font-medium">Registro</th>
              <th className="text-right px-5 py-3 font-medium">Leads</th>
              <th className="text-left px-5 py-3 font-medium">Estado</th>
              <th className="text-right px-5 py-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map((ae) => (
              <tr key={ae.id} className="bg-gray-900 hover:bg-gray-800/60 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-medium text-white flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-500" />{ae.nombre}</div>
                  <div className="text-gray-500 text-xs">{ae.slug}</div>
                </td>
                <td className="px-5 py-3.5 text-gray-300">{ae.email ?? '—'}</td>
                <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell">{ae.ciudad?.nombre ?? '—'}</td>
                <td className="px-5 py-3.5 text-center">
                  <button onClick={() => toggleMarcada(ae)} className="inline-flex justify-center">
                    {ae.captacion_marcada ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-600" />}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-center">
                  {ae.registered ? <span className="text-green-400 text-xs font-semibold">Registrada</span> : <span className="text-amber-400 text-xs">No registrada</span>}
                </td>
                <td className="px-5 py-3.5 text-right text-white font-bold">{ae.leads_count ?? 0}</td>
                <td className="px-5 py-3.5">
                  <span className="text-xs bg-gray-800 text-gray-300 rounded-full px-2.5 py-1">{ae.captacion_estado ?? 'pendiente'}</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button disabled={!ae.email || sendingId === ae.id} onClick={() => sendInvite(ae)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-40">
                    {sendingId === ae.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Enviar mail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-4 flex items-center gap-2">
        <Mail className="w-3.5 h-3.5" /> Las autoescuelas marcadas pueden entrar en el flujo automático de invitación y seguimiento.
      </p>
    </div>
  )
}
