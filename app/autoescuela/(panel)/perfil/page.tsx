'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CIUDADES } from '@/data/cities'
import { Save, Camera } from 'lucide-react'

export default function PerfilAutoescuelaPage() {
  const supabase = createClient()
  const [autoescuelaId, setAutoescuelaId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    email_contacto: '',
    website: '',
    precio_minimo: '',
    precio_maximo: '',
    precio_practicas: '',
    horario: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: u } = await supabase.from('usuarios').select('autoescuela_id').eq('id', user.id).single()
      if (!u?.autoescuela_id) return
      setAutoescuelaId(u.autoescuela_id)
      const { data: ae } = await supabase
        .from('autoescuelas')
        .select('nombre, descripcion, direccion, telefono, email_contacto, website, precio_minimo, precio_maximo, precio_practicas, horario')
        .eq('id', u.autoescuela_id)
        .single()
      if (ae) {
        setForm({
          nombre: ae.nombre ?? '',
          descripcion: ae.descripcion ?? '',
          direccion: ae.direccion ?? '',
          telefono: ae.telefono ?? '',
          email_contacto: ae.email_contacto ?? '',
          website: ae.website ?? '',
          precio_minimo: ae.precio_minimo?.toString() ?? '',
          precio_maximo: ae.precio_maximo?.toString() ?? '',
          precio_practicas: ae.precio_practicas?.toString() ?? '',
          horario: ae.horario ?? '',
        })
      }
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!autoescuelaId) return
    setSaving(true)
    await supabase.from('autoescuelas').update({
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      direccion: form.direccion || null,
      telefono: form.telefono || null,
      email_contacto: form.email_contacto || null,
      website: form.website || null,
      precio_minimo: form.precio_minimo ? Number(form.precio_minimo) : null,
      precio_maximo: form.precio_maximo ? Number(form.precio_maximo) : null,
      precio_practicas: form.precio_practicas ? Number(form.precio_practicas) : null,
      horario: form.horario || null,
    }).eq('id', autoescuelaId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-gray-500 text-sm mt-1">
          Esta información aparece en el comparador para los futuros alumnos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info básica */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-4">Información básica</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Nombre de la autoescuela *</label>
              <input
                required
                value={form.nombre}
                onChange={(e) => update('nombre', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => update('descripcion', e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Describe brevemente tu autoescuela: años de experiencia, especialidades, lo que os hace diferentes..."
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Dirección</label>
                <input
                  value={form.direccion}
                  onChange={(e) => update('direccion', e.target.value)}
                  className="input-field"
                  placeholder="Calle Mayor 10, Valencia"
                />
              </div>
              <div>
                <label className="label">Horario</label>
                <input
                  value={form.horario}
                  onChange={(e) => update('horario', e.target.value)}
                  className="input-field"
                  placeholder="Lun-Vie 9:00-20:00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-4">Datos de contacto</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Teléfono</label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => update('telefono', e.target.value)}
                className="input-field"
                placeholder="912 345 678"
              />
            </div>
            <div>
              <label className="label">Email de contacto</label>
              <input
                type="email"
                value={form.email_contacto}
                onChange={(e) => update('email_contacto', e.target.value)}
                className="input-field"
                placeholder="info@miautoescuela.es"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Página web</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => update('website', e.target.value)}
                className="input-field"
                placeholder="https://www.miautoescuela.es"
              />
            </div>
          </div>
        </div>

        {/* Precios */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-4">Precios (€)</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Precio desde</label>
              <input
                type="number"
                value={form.precio_minimo}
                onChange={(e) => update('precio_minimo', e.target.value)}
                className="input-field"
                placeholder="700"
              />
            </div>
            <div>
              <label className="label">Precio hasta</label>
              <input
                type="number"
                value={form.precio_maximo}
                onChange={(e) => update('precio_maximo', e.target.value)}
                className="input-field"
                placeholder="1200"
              />
            </div>
            <div>
              <label className="label">€ por clase práctica</label>
              <input
                type="number"
                value={form.precio_practicas}
                onChange={(e) => update('precio_practicas', e.target.value)}
                className="input-field"
                placeholder="30"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {saved && (
            <span className="text-green-600 text-sm font-medium self-center">✓ Cambios guardados</span>
          )}
          <button type="submit" disabled={saving} className="btn-primary gap-2 disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
