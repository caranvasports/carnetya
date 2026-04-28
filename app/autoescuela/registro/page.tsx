'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CIUDADES } from '@/data/cities'

export default function AutoescuelaRegistroPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre_autoescuela: '',
    ciudad_slug: '',
    nombre_contacto: '',
    email: '',
    password: '',
    telefono: '',
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nombre: form.nombre_contacto,
          rol: 'autoescuela',
        },
      },
    })

    if (signUpError || !authData.user) {
      setError(signUpError?.message ?? 'Error al crear la cuenta. Inténtalo de nuevo.')
      setLoading(false)
      return
    }

    // 2. Buscar ciudad
    const { data: ciudad } = await supabase
      .from('ciudades')
      .select('id')
      .eq('slug', form.ciudad_slug)
      .single()

    // 3. Crear autoescuela
    const { data: autoescuela } = await supabase
      .from('autoescuelas')
      .insert({
        nombre: form.nombre_autoescuela,
        slug: form.nombre_autoescuela.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        ciudad_id: ciudad?.id,
        telefono: form.telefono || null,
        plan: 'free',
        activa: true,
      })
      .select()
      .single()

    // 4. Actualizar perfil de usuario con autoescuela_id
    if (autoescuela) {
      await supabase
        .from('usuarios')
        .update({ autoescuela_id: autoescuela.id, rol: 'autoescuela' })
        .eq('id', authData.user.id)
    }

    setLoading(false)
    router.push('/autoescuela/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-700 text-xl font-black">
            <div className="bg-brand-600 p-2 rounded-xl">
              <Car className="w-6 h-6 text-white" />
            </div>
            CarnetYa
          </Link>
          <p className="text-gray-500 text-sm mt-2">Registra tu autoescuela — es gratis</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Crear cuenta de autoescuela</h1>
          <p className="text-gray-500 text-sm mb-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/autoescuela/login" className="text-brand-600 font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nombre de la autoescuela *</label>
              <input
                required
                value={form.nombre_autoescuela}
                onChange={(e) => updateField('nombre_autoescuela', e.target.value)}
                className="input-field"
                placeholder="Autoescuela Centro"
              />
            </div>
            <div>
              <label className="label">Ciudad *</label>
              <select
                required
                value={form.ciudad_slug}
                onChange={(e) => updateField('ciudad_slug', e.target.value)}
                className="input-field"
              >
                <option value="">Selecciona tu ciudad</option>
                {CIUDADES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Teléfono de contacto</label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => updateField('telefono', e.target.value)}
                className="input-field"
                placeholder="912 345 678"
              />
            </div>
            <hr className="border-gray-100" />
            <div>
              <label className="label">Tu nombre *</label>
              <input
                required
                value={form.nombre_contacto}
                onChange={(e) => updateField('nombre_contacto', e.target.value)}
                className="input-field"
                placeholder="Nombre del director/a"
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="input-field"
                placeholder="info@miautoescuela.es"
              />
            </div>
            <div>
              <label className="label">Contraseña *</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="input-field"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-60"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Al registrarte aceptas los{' '}
              <Link href="/terminos" className="text-brand-600 hover:underline">Términos de uso</Link>
              {' '}y la{' '}
              <Link href="/privacidad" className="text-brand-600 hover:underline">Política de privacidad</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
