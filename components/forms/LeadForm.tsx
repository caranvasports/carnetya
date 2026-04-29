'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'
import { CIUDADES } from '@/data/cities'

const CARNETS = [
  { value: 'B',  label: 'B — Coche' },
  { value: 'A',  label: 'A — Moto' },
  { value: 'AM', label: 'AM — Ciclomotor' },
  { value: 'A1', label: 'A1 — Moto pequeña' },
  { value: 'A2', label: 'A2 — Moto mediana' },
  { value: 'C',  label: 'C — Camión' },
  { value: 'D',  label: 'D — Autobús' },
]

const schema = z.object({
  nombre:             z.string().min(2, 'Nombre requerido'),
  telefono:           z.string().regex(/^[6-9]\d{8}$/, 'Teléfono no válido (ej: 612345678)'),
  email:              z.string().email('Email no válido'),
  ciudad:             z.string().min(1, 'Selecciona una ciudad'),
  tipo_carnet:        z.string().min(1, 'Selecciona un tipo de carnet'),
  edad:               z.coerce.number().min(14, 'Mínimo 14 años').max(99, 'Edad no válida'),
  tiene_experiencia:  z.boolean(),
  urgencia:           z.enum(['rapido', 'normal']),
})

type FormData = z.infer<typeof schema>

interface LeadFormProps {
  defaultCiudad?: string
  defaultCarnet?: string
  onSuccess?: () => void
}

export default function LeadForm({ defaultCiudad, defaultCarnet, onSuccess }: LeadFormProps) {
  // Si ciudad Y carnet ya están preseleccionados, empezamos en el paso de perfil
  const skipStep0 = !!(defaultCiudad && defaultCarnet)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ciudad:            defaultCiudad  ?? '',
      tipo_carnet:       defaultCarnet  ?? '',
      tiene_experiencia: false,
      urgencia:          'normal',
    },
  })

  // Step 0 puede tener 0, 1 o 2 campos visibles según lo que ya esté prerellenado
  const step0Fields: string[] = []
  if (!defaultCiudad) step0Fields.push('ciudad')
  if (!defaultCarnet) step0Fields.push('tipo_carnet')

  const STEPS = skipStep0
    ? [
        { title: 'Cuéntanos un poco', fields: ['edad', 'tiene_experiencia', 'urgencia'] },
        { title: 'Tus datos de contacto', fields: ['nombre', 'telefono', 'email'] },
      ]
    : [
        { title: step0Fields.length === 2 ? '¿Dónde y qué carnet buscas?' : step0Fields.includes('ciudad') ? '¿Dónde buscas?' : '¿Qué carnet necesitas?', fields: step0Fields },
        { title: 'Cuéntanos un poco', fields: ['edad', 'tiene_experiencia', 'urgencia'] },
        { title: 'Tus datos de contacto', fields: ['nombre', 'telefono', 'email'] },
      ]

  async function validateStep() {
    const fields = STEPS[step].fields as (keyof FormData)[]
    return trigger(fields)
  }

  async function nextStep() {
    const valid = await validateStep()
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          fuente_url: window.location.href,
        }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Error al enviar')
      }
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/gracias')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const urgenciaValue       = watch('urgencia')
  const experienciaValue    = watch('tiene_experiencia')

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100">
        <div
          className="h-full bg-cta transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="p-6 sm:p-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step
                    ? 'bg-green-500 text-white'
                    : i === step
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 w-8 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <p className="text-xl font-bold text-gray-900 mb-6">{STEPS[step].title}</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Step 0: Ciudad + Carnet (solo si skipStep0 = false) */}
          {!skipStep0 && step === 0 && (
            <div className="space-y-4">
              {!defaultCiudad && (
                <div>
                  <label className="label">Tu ciudad</label>
                  <select {...register('ciudad')} className="input-field text-gray-900">
                    <option value="">Selecciona tu ciudad...</option>
                    {CIUDADES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.ciudad && <p className="text-red-500 text-xs mt-1">{errors.ciudad.message}</p>}
                </div>
              )}
              {!defaultCarnet && (
                <div>
                  <label className="label">¿Qué carnet necesitas?</label>
                  <select {...register('tipo_carnet')} className="input-field text-gray-900">
                    <option value="">Selecciona el tipo de carnet...</option>
                    {CARNETS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {errors.tipo_carnet && <p className="text-red-500 text-xs mt-1">{errors.tipo_carnet.message}</p>}
                </div>
              )}
            </div>
          )}

          {/* Step perfil (índice 1 normal, 0 si skipStep0) */}
          {STEPS[step].fields.includes('edad') && (
            <div className="space-y-4">
              <div>
                <label className="label">Tu edad</label>
                <input
                  type="number"
                  {...register('edad')}
                  placeholder="Ej: 22"
                  className="input-field text-gray-900"
                  min={14}
                  max={99}
                />
                {errors.edad && <p className="text-red-500 text-xs mt-1">{errors.edad.message}</p>}
              </div>

              <div>
                <label className="label">¿Tienes experiencia conduciendo?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: false, label: '🚫 No', desc: 'Empiezo de cero' },
                    { value: true,  label: '✅ Sí', desc: 'Algo de experiencia' },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => setValue('tiene_experiencia', opt.value, { shouldValidate: true })}
                      className={`flex flex-col p-3 rounded-xl border-2 cursor-pointer transition-all text-left ${
                        experienciaValue === opt.value
                          ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-200'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
                      <span className="text-xs text-gray-600 mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">¿Con qué urgencia necesitas el carnet?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'rapido', label: '🚀 Urgente', desc: 'Curso intensivo' },
                    { value: 'normal', label: '🕐 Sin prisa', desc: 'Ritmo normal' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('urgencia', opt.value as 'rapido' | 'normal', { shouldValidate: true })}
                      className={`flex flex-col p-3 rounded-xl border-2 cursor-pointer transition-all text-left ${
                        urgenciaValue === opt.value
                          ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-200'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
                      <span className="text-xs text-gray-600 mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step contacto */}
          {STEPS[step].fields.includes('nombre') && (
            <div className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input
                  type="text"
                  {...register('nombre')}
                  placeholder="Tu nombre"
                  className="input-field text-gray-900"
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input
                  type="tel"
                  {...register('telefono')}
                  placeholder="612 345 678"
                  className="input-field text-gray-900"
                />
                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="tu@email.com"
                  className="input-field text-gray-900"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <p className="text-xs text-gray-400">
                Al enviar aceptas nuestra{' '}
                <a href="/privacidad" className="underline hover:text-gray-600">política de privacidad</a>.
                Solo usaremos tus datos para conectarte con autoescuelas.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Atrás
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 btn-primary"
              >
                Continuar
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Ver autoescuelas gratis
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
