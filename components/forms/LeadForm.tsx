'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'
import { type LeadFormData } from '@/types'
import { CIUDADES } from '@/data/cities'

const schema = z.object({
  nombre:             z.string().min(2, 'Nombre requerido'),
  telefono:           z.string().regex(/^[6-9]\d{8}$/, 'Teléfono no válido (ej: 612345678)'),
  email:              z.string().email('Email no válido'),
  ciudad:             z.string().min(1, 'Selecciona una ciudad'),
  edad:               z.coerce.number().min(14, 'Mínimo 14 años').max(99, 'Edad no válida'),
  tiene_experiencia:  z.boolean(),
  urgencia:           z.enum(['rapido', 'normal']),
})

type FormData = z.infer<typeof schema>

const STEPS = [
  { title: '¿Dónde buscas?', fields: ['ciudad'] },
  { title: 'Cuéntanos un poco', fields: ['edad', 'tiene_experiencia', 'urgencia'] },
  { title: 'Tus datos de contacto', fields: ['nombre', 'telefono', 'email'] },
]

interface LeadFormProps {
  defaultCiudad?: string
  onSuccess?: () => void
}

export default function LeadForm({ defaultCiudad, onSuccess }: LeadFormProps) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ciudad: defaultCiudad ?? '',
      tiene_experiencia: false,
      urgencia: 'normal',
    },
  })

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

  const urgenciaValue = watch('urgencia')
  const experienciaValue = watch('tiene_experiencia')

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
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
                    : 'bg-gray-100 text-gray-400'
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

        <h3 className="text-xl font-bold text-gray-900 mb-6">{STEPS[step].title}</h3>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Step 0: Ciudad */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="label">Tu ciudad</label>
                <select {...register('ciudad')} className="input-field">
                  <option value="">Selecciona tu ciudad...</option>
                  {CIUDADES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                {errors.ciudad && <p className="text-red-500 text-xs mt-1">{errors.ciudad.message}</p>}
              </div>
            </div>
          )}

          {/* Step 1: Perfil */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="label">Tu edad</label>
                <input
                  type="number"
                  {...register('edad')}
                  placeholder="Ej: 22"
                  className="input-field"
                  min={14}
                  max={99}
                />
                {errors.edad && <p className="text-red-500 text-xs mt-1">{errors.edad.message}</p>}
              </div>

              <div>
                <label className="label">¿Tienes experiencia conduciendo?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: false, label: 'No, empiezo de cero' },
                    { value: true, label: 'Sí, algo de experiencia' },
                  ].map((opt) => (
                    <label
                      key={String(opt.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        experienciaValue === opt.value
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('tiene_experiencia', { setValueAs: (v) => v === 'true' })}
                        value={String(opt.value)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">¿Con qué urgencia necesitas el carnet?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'rapido', label: '🚀 Lo antes posible', desc: 'Curso intensivo' },
                    { value: 'normal', label: '🕐 Sin prisa', desc: 'Ritmo normal' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex flex-col p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        urgenciaValue === opt.value
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('urgencia')}
                        value={opt.value}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-xs text-gray-500">{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contacto */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input
                  type="text"
                  {...register('nombre')}
                  placeholder="Tu nombre"
                  className="input-field"
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input
                  type="tel"
                  {...register('telefono')}
                  placeholder="612 345 678"
                  className="input-field"
                />
                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="tu@email.com"
                  className="input-field"
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
