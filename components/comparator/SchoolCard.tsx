import Link from 'next/link'
import Image from 'next/image'
import { MapPin, CheckCircle, ArrowRight, Award } from 'lucide-react'
import { type Autoescuela } from '@/types'
import { formatPrice } from '@/lib/utils'
import StarRating from '@/components/ui/StarRating'
import Badge from '@/components/ui/Badge'
import ContactReveal from './ContactReveal'

interface SchoolCardProps {
  autoescuela: Autoescuela
  ciudadSlug: string
  position?: number
}

export default function SchoolCard({ autoescuela, ciudadSlug, position }: SchoolCardProps) {
  const {
    nombre, slug, descripcion, precio_minimo, precio_maximo,
    precio_practicas, rating_promedio, total_reviews,
    logo_url, servicios, verificada, destacada, plan, telefono,
  } = autoescuela

  const href = `/autoescuelas/${ciudadSlug}/${slug}`

  return (
    <article
      className={`card flex flex-col sm:flex-row gap-4 p-4 sm:p-6 ${
        destacada ? 'ring-2 ring-brand-500' : ''
      }`}
    >
      {destacada && (
        <div className="hidden sm:flex absolute -top-3 left-4">
          <Badge variant="premium" className="gap-1">
            <Award className="w-3 h-3" /> Destacada
          </Badge>
        </div>
      )}

      {/* Logo / posición */}
      <div className="flex sm:flex-col items-center gap-4 sm:gap-2">
        {position && (
          <span className="text-2xl font-black text-gray-200">#{position}</span>
        )}
        <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {logo_url ? (
            <Image src={logo_url} alt={nombre} width={64} height={64} className="object-contain" />
          ) : (
            <span className="text-2xl font-bold text-brand-300">
              {nombre.charAt(0)}
            </span>
          )}
        </div>
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <Link href={href} className="font-bold text-lg text-gray-900 hover:text-brand-600 transition-colors line-clamp-1">
              {nombre}
            </Link>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="line-clamp-1">{autoescuela.direccion ?? autoescuela.ciudad?.nombre}</span>
            </div>
          </div>

          {/* Mobile price */}
          <div className="sm:hidden text-right">
            <p className="text-lg font-bold text-brand-600">
              {precio_minimo ? `desde ${formatPrice(precio_minimo)}` : 'Consultar'}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-3 mb-2">
          <StarRating rating={rating_promedio} totalReviews={total_reviews} size="sm" />
          {verificada && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> Verificada
            </span>
          )}
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{descripcion}</p>

        {/* Tags servicios */}
        {servicios && servicios.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {servicios.slice(0, 4).map((s) => (
              <Badge key={s} variant="info" className="text-xs">{s}</Badge>
            ))}
            {servicios.length > 4 && (
              <Badge variant="default" className="text-xs">+{servicios.length - 4}</Badge>
            )}
          </div>
        )}
      </div>

      {/* Price + CTA (desktop) */}
      <div className="hidden sm:flex flex-col items-end justify-between min-w-[160px]">
        <div className="text-right">
          {precio_minimo && precio_maximo ? (
            <>
              <p className="text-xs text-gray-500">Precio total estimado</p>
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(precio_minimo)} – {formatPrice(precio_maximo)}
              </p>
            </>
          ) : (
            <p className="text-xl font-bold text-gray-900">Consultar precio</p>
          )}
          {precio_practicas && (
            <p className="text-xs text-gray-500">
              Prácticas: {formatPrice(precio_practicas)}/clase
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <ContactReveal
            autoescuelaId={autoescuela.id}
            autoescuelaNombre={nombre}
            telefono={telefono ?? null}
            email={autoescuela.email}
            ciudadSlug={ciudadSlug}
          />
          <Link href={href} className="btn-primary text-sm py-2.5">
            Ver detalles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="sm:hidden flex flex-col gap-2">
        {(telefono || autoescuela.email) && (
          <ContactReveal
            autoescuelaId={autoescuela.id}
            autoescuelaNombre={nombre}
            telefono={telefono ?? null}
            email={autoescuela.email}
            ciudadSlug={ciudadSlug}
          />
        )}
        <Link href={href} className="btn-primary text-sm py-2.5">
          Ver más
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  )
}
