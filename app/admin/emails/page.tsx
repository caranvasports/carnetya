'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Mail, RefreshCw, Save, Send, Eye, EyeOff } from 'lucide-react'

type Template = {
  id: string
  nombre: string
  subject: string
  html: string
  activa?: boolean
  updated_at?: string
}

const TEMPLATE_VARS: Record<string, string[]> = {
  admin_nuevo_lead:       ['{{nombre}}', '{{telefono}}', '{{email}}', '{{ciudad}}', '{{urgencia}}', '{{admin_url}}'],
  nueva_autoescuela:      ['{{nombre_autoescuela}}', '{{ciudad}}', '{{panel_url}}'],
  nuevo_lead_autoescuela: ['{{nombre_autoescuela}}', '{{ciudad}}', '{{urgencia}}', '{{tipo_carnet}}', '{{panel_url}}'],
  lead_no_registrada:     ['{{ciudad}}', '{{num_leads}}', '{{precio_lead}}', '{{registro_url}}', '{{paypal_url}}'],
  lead_reminder:          ['{{nombre_autoescuela}}', '{{ciudad}}', '{{dias}}', '{{panel_url}}'],
}

export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [previewMode, setPreviewMode] = useState(true)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const selected = templates.find((t) => t.id === selectedId)

  async function load() {
    setLoading(true)
    setApiError(null)
    try {
      const res = await fetch('/api/admin/email-templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
        if (!selectedId && data.length > 0) setSelectedId(data[0].id)
      } else {
        const data = await res.json().catch(() => ({}))
        setApiError(data.error ?? `Error ${res.status}`)
      }
    } catch (e) {
      setApiError(String(e))
    }
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function flash(ok: boolean, text: string) {
    setMsg({ ok, text })
    setTimeout(() => setMsg(null), 5000)
  }

  async function save() {
    if (!selected) return
    setSaving(true)
    const res = await fetch('/api/admin/email-templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, subject: selected.subject, html: selected.html }),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (res.ok) { flash(true, 'Plantilla guardada correctamente'); load() }
    else flash(false, data.error ?? 'Error al guardar')
  }

  async function sendTest() {
    if (!selected) return
    setSending(true)
    const res = await fetch('/api/admin/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: selected.id }),
    })
    const data = await res.json().catch(() => ({}))
    setSending(false)
    if (res.ok && data.ok) flash(true, data.mensaje ?? 'Email de prueba enviado')
    else flash(false, data.error ?? data.mensaje ?? 'Error al enviar')
  }

  function updateSelected(field: 'subject' | 'html', value: string) {
    setTemplates((prev) => prev.map((t) => t.id === selectedId ? { ...t, [field]: value } : t))
  }

  const vars = selectedId ? (TEMPLATE_VARS[selectedId] ?? []) : []

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-6 h-6" /> Emails
          </h1>
          <p className="text-gray-400 text-sm mt-1">Plantillas automáticas de captación y notificación</p>
        </div>
        <button onClick={load} disabled={loading} className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm flex items-center gap-2 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      {apiError && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 text-sm font-semibold">Error cargando plantillas</p>
            <p className="text-red-400 text-xs mt-1">{apiError}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-500 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Cargando plantillas...
        </div>
      ) : (
        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="bg-gray-900 border border-gray-800 rounded-2xl p-3 h-fit">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mb-1">Plantillas</p>
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left rounded-xl px-4 py-3 text-sm transition-colors ${selectedId === t.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                <span className="font-semibold block truncate">{t.nombre}</span>
                <span className="text-xs opacity-60">{t.id}</span>
              </button>
            ))}
          </aside>

          {/* Editor */}
          <main className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            {!selected ? (
              <div className="text-gray-500 text-sm py-20 text-center">Selecciona una plantilla</div>
            ) : (
              <>
                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Asunto</label>
                  <input
                    value={selected.subject}
                    onChange={(e) => updateSelected('subject', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Variables */}
                {vars.length > 0 && (
                  <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-gray-400 mb-2">Variables disponibles</p>
                    <div className="flex flex-wrap gap-1.5">
                      {vars.map((v) => (
                        <span
                          key={v}
                          onClick={() => navigator.clipboard?.writeText(v)}
                          title="Clic para copiar"
                          className="cursor-pointer bg-gray-700 hover:bg-blue-700 text-blue-300 hover:text-white text-xs font-mono px-2 py-1 rounded-md transition-colors select-none"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Toggle editor / preview */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPreviewMode(false)}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${!previewMode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                  >
                    <EyeOff className="w-4 h-4" /> Editar HTML
                  </button>
                  <button
                    onClick={() => setPreviewMode(true)}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${previewMode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                  >
                    <Eye className="w-4 h-4" /> Vista previa
                  </button>
                </div>

                {previewMode ? (
                  <div className="border border-gray-700 rounded-xl overflow-hidden">
                    <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-xs text-gray-400 ml-2 flex-1 truncate">{selected.subject}</span>
                    </div>
                    <div className="bg-white max-h-[500px] overflow-auto">
                      <div dangerouslySetInnerHTML={{ __html: selected.html }} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">HTML</label>
                    <textarea
                      value={selected.html}
                      onChange={(e) => updateSelected('html', e.target.value)}
                      rows={20}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono leading-relaxed focus:border-blue-500 outline-none resize-y"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-800">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button
                    onClick={sendTest}
                    disabled={sending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" /> {sending ? 'Enviando...' : 'Enviar test al admin'}
                  </button>

                  {msg && (
                    <span className={`flex items-center gap-2 text-sm font-medium ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>
                      {msg.ok
                        ? <CheckCircle2 className="w-4 h-4" />
                        : <AlertCircle className="w-4 h-4" />}
                      {msg.text}
                    </span>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  )
}


  async function load() {
    setLoading(true)
    setApiError(null)
    try {
      const res = await fetch('/api/admin/email-templates')
      if (res.ok) {
        setTemplates(await res.json())
      } else {
        const data = await res.json().catch(() => ({}))
        setApiError(data.error ?? `Error ${res.status}`)
      }
    } catch (e) {
      setApiError(String(e))
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    if (!selected) return
    setSaving(true)
    setSaveMsg(null)
    const res = await fetch('/api/admin/email-templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, subject: selected.subject, html: selected.html }),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (res.ok) {
      setSaveMsg({ ok: true, text: 'Plantilla guardada' })
      load()
    } else {
      setSaveMsg({ ok: false, text: data.error ?? 'Error al guardar' })
    }
    setTimeout(() => setSaveMsg(null), 4000)
  }

  function updateSelected(field: 'subject' | 'html', value: string) {
    setTemplates((prev) => prev.map((t) => t.id === selectedId ? { ...t, [field]: value } : t))
  }

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Mail className="w-6 h-6" /> Emails</h1>
          <p className="text-gray-400 text-sm mt-1">Plantillas automáticas para captación de autoescuelas</p>
        </div>
        <button onClick={load} disabled={loading} className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm flex items-center gap-2 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      {apiError && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 text-sm font-semibold">Error cargando plantillas</p>
            <p className="text-red-400 text-xs mt-1">{apiError}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-500 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Cargando plantillas...
        </div>
      ) : (
        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          <aside className="bg-gray-900 border border-gray-800 rounded-2xl p-3 h-fit">
            {templates.length === 0 ? (
              <p className="text-gray-500 text-xs px-4 py-3">Sin plantillas</p>
            ) : templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedId(template.id)}
                className={`w-full text-left rounded-xl px-4 py-3 text-sm transition-colors ${selectedId === template.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                <span className="font-semibold block">{template.nombre}</span>
                <span className="text-xs opacity-70">{template.id}</span>
              </button>
            ))}
          </aside>

          <main className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            {!selected ? (
              <div className="text-gray-500 text-sm py-20 text-center">Selecciona una plantilla</div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Asunto del email</label>
                  <input
                    value={selected.subject}
                    onChange={(e) => updateSelected('subject', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">HTML del email</label>
                  <textarea
                    value={selected.html}
                    onChange={(e) => updateSelected('html', e.target.value)}
                    rows={16}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-sm text-white font-mono leading-relaxed focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 text-xs text-gray-400">
                  Variables disponibles:&nbsp;
                  {['{{nombre_autoescuela}}', '{{contacto_nombre}}', '{{ciudad}}', '{{registro_url}}'].map((v) => (
                    <span key={v} className="text-white mr-2">{v}</span>
                  ))}
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-white mb-3">Vista previa</h2>
                  <div className="bg-white rounded-xl p-5 max-h-[400px] overflow-auto" dangerouslySetInnerHTML={{ __html: selected.html }} />
                </div>

                <div className="flex items-center gap-4">
                  <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                    <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar plantilla'}
                  </button>
                  {saveMsg && (
                    <span className={`flex items-center gap-2 text-sm ${saveMsg.ok ? 'text-green-400' : 'text-red-400'}`}>
                      {saveMsg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {saveMsg.text}
                    </span>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}
