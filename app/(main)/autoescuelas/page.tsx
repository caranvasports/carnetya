import { type Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { CIUDADES } from '@/data/cities'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Autoescuelas por ciudad en España — CarnetYa',
  description: 'Encuentra autoescuelas, precios del carnet de conducir y rankings locales en las principales ciudades de España.',
  canonical: '/autoescuelas',
})

export default function AutoescuelasIndexPage() {
  const grouped = CIUDADES.reduce((acc, ciudad) => {
    const provincia = ciudad.provincia
    acc[provincia] = acc[provincia] ?? []
    acc[provincia].push(ciudad)
    return acc
  }, {} as Record<string, typeof CIUDADES[number][]>)

  return (
    <>
      <section className="bg-gradient-to-br from-brand-700 to-brand-500 text-white py-12">
        <div className="container-main">
          <div className="flex items-center gap-2 text-blue-100 mb-3">
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">Autoescuelas por ciudad</span>
          </div>
          <h1 className="text-4xl font-black mb-3">Autoescuelas en España</h1>
          <p className="text-blue-100 text-lg max-w-3xl">
            Compara autoescuelas, precios del carnet y rankings locales en {CIUDADES.length} ciudades españolas.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="container-main">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(grouped).map(([provincia, ciudades]) => (
              <div key={provincia} className="card p-5">
                <h2 className="font-bold text-gray-900 mb-3">{provincia}</h2>
                <div className="space-y-2">
                  {ciudades.map((ciudad) => (
                    <Link
                      key={ciudad.slug}
                      href={`/autoescuelas/${ciudad.slug}`}
                      className="flex items-center justify-between gap-3 text-sm text-gray-600 hover:text-brand-600 transition-colors"
                    >
                      <span>{ciudad.nombre}</span>
                      <span className="text-xs text-gray-400">Ver</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
