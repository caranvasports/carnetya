'use client'

import { useState, useMemo } from 'react'
import { type Autoescuela, type FiltrosAutoescuelas } from '@/types'
import SchoolCard from './SchoolCard'
import FilterBar from './FilterBar'
import { Search } from 'lucide-react'

interface SchoolListProps {
  autoescuelas: Autoescuela[]
  ciudadSlug: string
}

export default function SchoolList({ autoescuelas, ciudadSlug }: SchoolListProps) {
  const [filtros, setFiltros] = useState<FiltrosAutoescuelas>({ ordenarPor: 'rating' })
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    let list = [...autoescuelas]

    // Búsqueda por nombre
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((a) =>
        a.nombre.toLowerCase().includes(q) || a.direccion?.toLowerCase().includes(q)
      )
    }

    // Precio máximo
    if (filtros.precioMax) {
      list = list.filter((a) => !a.precio_minimo || a.precio_minimo <= filtros.precioMax!)
    }

    // Rating mínimo
    if (filtros.ratingMin) {
      list = list.filter((a) => a.rating_promedio >= filtros.ratingMin!)
    }

    // Ordenar
    switch (filtros.ordenarPor) {
      case 'precio':
        list.sort((a, b) => (a.precio_minimo ?? 9999) - (b.precio_minimo ?? 9999))
        break
      case 'reviews':
        list.sort((a, b) => b.total_reviews - a.total_reviews)
        break
      case 'rating':
      default:
        list.sort((a, b) => {
          if (b.destacada !== a.destacada) return b.destacada ? 1 : -1
          return b.rating_promedio - a.rating_promedio
        })
    }

    return list
  }, [autoescuelas, filtros, searchQuery])

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar autoescuela por nombre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
          />
        </div>
        <FilterBar onFilterChange={setFiltros} />
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} autoescuela{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No se encontraron autoescuelas con esos filtros</p>
          <p className="text-sm mt-1">Prueba a ajustar los filtros</p>
        </div>
      ) : (
        <div className="space-y-4 relative">
          {filtered.map((ae, index) => (
            <SchoolCard
              key={ae.id}
              autoescuela={ae}
              ciudadSlug={ciudadSlug}
              position={index + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
