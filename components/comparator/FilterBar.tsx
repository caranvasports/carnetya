'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { type FiltrosAutoescuelas } from '@/types'

interface FilterBarProps {
  onFilterChange: (filtros: FiltrosAutoescuelas) => void
}

const PRECIO_MAX_OPTIONS = [600, 700, 800, 900, 1000, 1200]
const RATING_MIN_OPTIONS = [3, 3.5, 4, 4.5]
const ORDEN_OPTIONS = [
  { value: 'rating',   label: 'Mejor valoradas' },
  { value: 'precio',   label: 'Más baratas primero' },
  { value: 'reviews',  label: 'Más opiniones' },
]

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [filtros, setFiltros] = useState<FiltrosAutoescuelas>({ ordenarPor: 'rating' })
  const [mobileOpen, setMobileOpen] = useState(false)

  function updateFiltros(update: Partial<FiltrosAutoescuelas>) {
    const newFiltros = { ...filtros, ...update }
    setFiltros(newFiltros)
    onFilterChange(newFiltros)
  }

  function clearAll() {
    const reset: FiltrosAutoescuelas = { ordenarPor: 'rating' }
    setFiltros(reset)
    onFilterChange(reset)
  }

  const hasActiveFilters = filtros.precioMax || filtros.ratingMin

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        {/* Ordenar */}
        <select
          value={filtros.ordenarPor}
          onChange={(e) => updateFiltros({ ordenarPor: e.target.value as FiltrosAutoescuelas['ordenarPor'] })}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
        >
          {ORDEN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Precio máx */}
        <select
          value={filtros.precioMax ?? ''}
          onChange={(e) => updateFiltros({ precioMax: e.target.value ? Number(e.target.value) : undefined })}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
        >
          <option value="">Cualquier precio</option>
          {PRECIO_MAX_OPTIONS.map((p) => (
            <option key={p} value={p}>Hasta {p}€</option>
          ))}
        </select>

        {/* Rating mín */}
        <select
          value={filtros.ratingMin ?? ''}
          onChange={(e) => updateFiltros({ ratingMin: e.target.value ? Number(e.target.value) : undefined })}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
        >
          <option value="">Cualquier valoración</option>
          {RATING_MIN_OPTIONS.map((r) => (
            <option key={r} value={r}>★ {r}+ estrellas</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" /> Limpiar filtros
          </button>
        )}
      </div>

      {/* Mobile toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl px-4 py-2 bg-white"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-cta" />
          )}
        </button>

        {mobileOpen && (
          <div className="mt-3 p-4 bg-white rounded-xl border border-gray-200 space-y-4">
            <div>
              <label className="label">Ordenar por</label>
              <select
                value={filtros.ordenarPor}
                onChange={(e) => updateFiltros({ ordenarPor: e.target.value as FiltrosAutoescuelas['ordenarPor'] })}
                className="input-field"
              >
                {ORDEN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Precio máximo</label>
              <select
                value={filtros.precioMax ?? ''}
                onChange={(e) => updateFiltros({ precioMax: e.target.value ? Number(e.target.value) : undefined })}
                className="input-field"
              >
                <option value="">Sin límite</option>
                {PRECIO_MAX_OPTIONS.map((p) => (
                  <option key={p} value={p}>Hasta {p}€</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Valoración mínima</label>
              <select
                value={filtros.ratingMin ?? ''}
                onChange={(e) => updateFiltros({ ratingMin: e.target.value ? Number(e.target.value) : undefined })}
                className="input-field"
              >
                <option value="">Cualquiera</option>
                {RATING_MIN_OPTIONS.map((r) => (
                  <option key={r} value={r}>★ {r}+ estrellas</option>
                ))}
              </select>
            </div>
            <div className="flex justify-between">
              {hasActiveFilters && (
                <button onClick={clearAll} className="text-sm text-red-500">
                  Limpiar
                </button>
              )}
              <button
                onClick={() => setMobileOpen(false)}
                className="btn-primary text-sm py-2 ml-auto"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
