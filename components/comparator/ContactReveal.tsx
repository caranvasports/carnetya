'use client'

import { useState } from 'react'
import { Phone, Eye, Loader2, CheckCircle } from 'lucide-react'

interface ContactRevealProps {
  autoescuelaId: string
  autoescuelaNombre: string
  telefono: string | null
  email?: string | null
  ciudadSlug: string
}

export default function ContactReveal({
  autoescuelaId,
  autoescuelaNombre,
  telefono,
  email,
  ciudadSlug,
}: ContactRevealProps) {
  const [state, setState] = useState<'hidden' | 'form' | 'revealed'>('hidden')
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const contactoDisplay = telefono || email || null
  if (!contactoDisplay) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Introduce tu teléfono o email')
      return
    }
    setLoading(true)
    setError('')

    try {
      await fetch('/api/contact-reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacto: trimmed,
          autoescuela_id: autoescuelaId,
          autoescuela_nombre: autoescuelaNombre,
          ciudad_slug: ciudadSlug,
          fuente_url: typeof window !== 'undefined' ? window.location.href : '',
          utm_source: typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('utm_source') ?? undefined
            : undefined,
        }),
      })
      setState('revealed')
    } catch {
      setError('Error, inténtalo de nuevo')
    } finally {
      setLoading(false)
    }
  }

  if (state === 'revealed') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
          <CheckCircle className="w-3.5 h-3.5" /> Contacto desbloqueado
        </div>
        {telefono && (
          <a
            href={`tel:${telefono}`}
            className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            <Phone className="w-4 h-4" />
            {telefono}
          </a>
        )}
        {email && !telefono && (
          <a
            href={`mailto:${email}`}
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            {email}
          </a>
        )}
      </div>
    )
  }

  if (state === 'form') {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError('') }}
          placeholder="Tu teléfono o email"
          className="text-sm px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none w-full"
          autoFocus
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 text-sm bg-brand-600 text-white py-2 px-3 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {loading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Eye className="w-3.5 h-3.5" />}
          Ver teléfono gratis
        </button>
        <p className="text-xs text-gray-400 text-center leading-tight">
          Solo para enviarte las mejores opciones
        </p>
      </form>
    )
  }

  // Estado inicial: número oculto
  return (
    <button
      onClick={() => setState('form')}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors group"
    >
      <Phone className="w-4 h-4" />
      <span className="font-mono tracking-widest text-gray-400 select-none">••• ••• •••</span>
      <span className="text-xs text-brand-600 font-medium group-hover:underline">Ver</span>
    </button>
  )
}
