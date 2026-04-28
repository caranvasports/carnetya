'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type Alumno } from '@/types'
import { FASE_LABELS, FASE_COLORS } from '@/lib/utils'
import { UserPlus, Search, Phone, Mail, BookOpen } from 'lucide-react'

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [faseFilter, setFaseFilter] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const [autoescuelaId, setAutoescuelaId] = useState<string | null>(null)
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
  }, [])

  const loadAlumnos = useCallback(async () => {
    if (!autoescuelaId) return
    setLoading(true)
    const { data } = await supabase
      .from('alumnos')
      .select('*')
      .eq('autoescuela_id', autoescuelaId)
      .order('created_at', { ascending: false })
    setAlumnos((data as Alumno[]) ?? [])
    setLoading(false)
  }, [autoescuelaId])

  useEffect(() => { loadAlumnos() }, [loadAlumnos])

  async function cambiarFase(alumnoId: string, nuevaFase: string) {
    await supabase.from('alumnos').update({ fase: nuevaFase }).eq('id', alumnoId)
    setAlumnos((prev) =>
      prev.map((a) => (a.id === alumnoId ? { ...a, fase: nuevaFase as Alumno['fase'] } : a))
    )
  }

  const filtered = alumnos.filter((a) => {
    const matchSearch = search
      ? `${a.nombre} ${a.apellidos ?? ''}`.toLowerCase().includes(search.toLowerCase()) ||
        a.telefono?.includes(search) || a.email?.includes(search)
      : true
    const matchFase = faseFilter === 'todos' ? true : a.fase === faseFilter
    return matchSearch && matchFase && a.activo
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alumnos</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} alumnos activos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo alumno
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar alumno..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={faseFilter}
          onChange={(e) => setFaseFilter(e.target.value)}
          className="input-field sm:w-56"
        >
          <option value="todos">Todas las fases</option>
          {Object.entries(FASE_LABELS).map(([fase, label]) => (
            <option key={fase} value={fase}>{label}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay alumnos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alumno) => (
            <div key={alumno.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">
                      {alumno.nombre} {alumno.apellidos}
                    </h3>
                    <span className={`badge text-xs ${FASE_COLORS[alumno.fase]}`}>
                      {FASE_LABELS[alumno.fase]}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2 text-sm text-gray-500">
                    {alumno.telefono && (
                      <a href={`tel:${alumno.telefono}`} className="flex items-center gap-1.5 hover:text-brand-600">
                        <Phone className="w-3.5 h-3.5" /> {alumno.telefono}
                      </a>
                    )}
                    {alumno.email && (
                      <a href={`mailto:${alumno.email}`} className="flex items-center gap-1.5 hover:text-brand-600 truncate">
                        <Mail className="w-3.5 h-3.5" /> {alumno.email}
                      </a>
                    )}
                    <span>
                      🚗 {alumno.clases_practicas_realizadas} clases
                      {alumno.precio_clase_practica
                        ? ` · ${alumno.precio_clase_practica}€/clase`
                        : ''}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <select
                    value={alumno.fase}
                    onChange={(e) => cambiarFase(alumno.id, e.target.value)}
                    className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white"
                  >
                    {Object.entries(FASE_LABELS).map(([fase, label]) => (
                      <option key={fase} value={fase}>{label}</option>
                    ))}
                  </select>
                  <a
                    href={`/autoescuela/alumnos/${alumno.id}`}
                    className="text-sm text-brand-600 hover:underline whitespace-nowrap"
                  >
                    Ver →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal nuevo alumno */}
      {showForm && (
        <NuevoAlumnoModal
          autoescuelaId={autoescuelaId!}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); loadAlumnos() }}
        />
      )}
    </div>
  )
}

function NuevoAlumnoModal({
  autoescuelaId,
  onClose,
  onSuccess,
}: {
  autoescuelaId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    nombre: '', apellidos: '', telefono: '', email: '',
    precio_matricula: '', precio_clase_practica: '',
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('alumnos').insert({
      autoescuela_id: autoescuelaId,
      nombre: form.nombre,
      apellidos: form.apellidos || null,
      telefono: form.telefono || null,
      email: form.email || null,
      precio_matricula: form.precio_matricula ? Number(form.precio_matricula) : null,
      precio_clase_practica: form.precio_clase_practica ? Number(form.precio_clase_practica) : null,
      fase: 'pendiente_inicio',
    })
    setSaving(false)
    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Nuevo alumno</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nombre *</label>
              <input
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="input-field"
                placeholder="Nombre"
              />
            </div>
            <div>
              <label className="label">Apellidos</label>
              <input
                value={form.apellidos}
                onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                className="input-field"
                placeholder="Apellidos"
              />
            </div>
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="input-field"
              placeholder="612 345 678"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              placeholder="alumno@email.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Precio matrícula (€)</label>
              <input
                type="number"
                value={form.precio_matricula}
                onChange={(e) => setForm({ ...form, precio_matricula: e.target.value })}
                className="input-field"
                placeholder="750"
              />
            </div>
            <div>
              <label className="label">€ por clase práctica</label>
              <input
                type="number"
                value={form.precio_clase_practica}
                onChange={(e) => setForm({ ...form, precio_clase_practica: e.target.value })}
                className="input-field"
                placeholder="30"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
              {saving ? 'Guardando...' : 'Crear alumno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
