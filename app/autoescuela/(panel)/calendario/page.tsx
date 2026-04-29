'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'

interface ClaseCalendario {
  id: string
  alumno_nombre: string
  alumno_apellidos: string
  fecha_hora_inicio: string
  fecha_hora_fin: string
  instructor: string | null
  tipo: string
  completada: boolean
  notas: string | null
}

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const HORAS = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 a 20:00

function semanaActual(offset = 0) {
  const hoy = new Date()
  const diaSemana = hoy.getDay() === 0 ? 7 : hoy.getDay()
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - (diaSemana - 1) + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes)
    d.setDate(lunes.getDate() + i)
    return d
  })
}

export default function CalendarioPage() {
  const [clases, setClases] = useState<ClaseCalendario[]>([])
  const [semanaOffset, setSemanaOffset] = useState(0)
  const [autoescuelaId, setAutoescuelaId] = useState<string | null>(null)
  const supabase = createClient()
  const dias = semanaActual(semanaOffset)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: u } = await supabase.from('usuarios').select('autoescuela_id').eq('id', user.id).single()
      if (u?.autoescuela_id) setAutoescuelaId(u.autoescuela_id)
    }
    init()
  }, [])

  const loadClases = useCallback(async () => {
    if (!autoescuelaId) return
    const inicio = dias[0].toISOString()
    const fin = dias[6].toISOString()
    const { data } = await supabase
      .from('clases')
      .select(`
        id, fecha_hora_inicio, fecha_hora_fin, instructor, tipo, completada, notas,
        alumno:alumnos(nombre, apellidos)
      `)
      .eq('autoescuela_id', autoescuelaId)
      .gte('fecha_hora_inicio', inicio)
      .lte('fecha_hora_inicio', fin)
      .order('fecha_hora_inicio')

    setClases(
      (data ?? []).map((c: any) => ({
        ...c,
        alumno_nombre: c.alumno?.nombre ?? '',
        alumno_apellidos: c.alumno?.apellidos ?? '',
      }))
    )
  }, [autoescuelaId, semanaOffset])

  useEffect(() => { loadClases() }, [loadClases])

  function clasesDelDia(dia: Date) {
    const diaStr = dia.toISOString().split('T')[0]
    return clases.filter((c) => c.fecha_hora_inicio.startsWith(diaStr))
  }

  const hoy = new Date().toISOString().split('T')[0]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de clases prácticas</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSemanaOffset((o) => o - 1)}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSemanaOffset(0)}
            className="text-sm font-medium text-brand-600 hover:underline px-2"
          >
            Hoy
          </button>
          <button
            onClick={() => setSemanaOffset((o) => o + 1)}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vista semanal */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 divide-x divide-gray-100 border-b border-gray-100">
          {dias.map((dia, i) => {
            const diaStr = dia.toISOString().split('T')[0]
            const esHoy = diaStr === hoy
            return (
              <div key={i} className={`p-3 text-center ${esHoy ? 'bg-brand-50' : ''}`}>
                <p className="text-xs font-medium text-gray-500">{DIAS[i]}</p>
                <p className={`text-lg font-black mt-0.5 ${esHoy ? 'text-brand-600' : 'text-gray-800'}`}>
                  {dia.getDate()}
                </p>
                <p className="text-xs text-gray-400">
                  {dia.toLocaleDateString('es-ES', { month: 'short' })}
                </p>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-7 divide-x divide-gray-100 min-h-[400px]">
          {dias.map((dia, i) => {
            const clasesHoy = clasesDelDia(dia)
            return (
              <div key={i} className="p-2 space-y-1.5">
                {clasesHoy.length === 0 ? (
                  <div className="text-xs text-gray-300 text-center mt-4">Sin clases</div>
                ) : (
                  clasesHoy.map((clase) => {
                    const hora = new Date(clase.fecha_hora_inicio).toLocaleTimeString('es-ES', {
                      hour: '2-digit', minute: '2-digit',
                    })
                    return (
                      <div
                        key={clase.id}
                        className={`text-xs rounded-lg p-2 ${
                          clase.completada
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-brand-50 border border-brand-200 text-brand-700'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-bold mb-0.5">
                          <Clock className="w-3 h-3" /> {hora}
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <User className="w-3 h-3 shrink-0" />
                          <span className="truncate">{clase.alumno_nombre}</span>
                        </div>
                        {clase.instructor && (
                          <div className="text-xs opacity-70 truncate mt-0.5">{clase.instructor}</div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-4 text-center">
        Las clases se crean desde la ficha de cada alumno.
      </p>
    </div>
  )
}
