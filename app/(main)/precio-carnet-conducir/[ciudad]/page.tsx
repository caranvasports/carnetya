import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, TrendingDown, Info } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'
import { getCiudadBySlug, CIUDADES } from '@/data/cities'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import LeadForm from '@/components/forms/LeadForm'
import FAQSection from '@/components/seo/FAQSection'

interface Props {
  params: Promise<{ ciudad: string }>
}

export async function generateStaticParams() {
  return CIUDADES.map((c) => ({ ciudad: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ciudad: ciudadSlug } = await params
  const ciudad = getCiudadBySlug(ciudadSlug)
  if (!ciudad) return {}

  return buildMetadata({
    title: `Precio carnet de conducir en ${ciudad.nombre} ${new Date().getFullYear()}`,
    description: `¿Cuánto cuesta el carnet de conducir en ${ciudad.nombre}? Comparativa de precios actualizada. Desde 580€. Compara autoescuelas y ahorra hasta 300€.`,
    canonical: `/precio-carnet-conducir/${ciudadSlug}`,
  })
}

export default async function PrecioCarnetCiudadPage({ params }: Props) {
  const { ciudad: ciudadSlug } = await params
  const ciudadStatic = getCiudadBySlug(ciudadSlug)
  if (!ciudadStatic) notFound()

  const supabase = await createClient()
  const { data: ciudad } = await supabase
    .from('ciudades')
    .select('precio_medio_carnet')
    .eq('slug', ciudadSlug)
    .single()

  const precioMedio = ciudad?.precio_medio_carnet ?? 800

  const { data: autoescuelas } = await supabase
    .from('autoescuelas')
    .select('id, nombre, slug, precio_minimo, precio_maximo, precio_practicas, rating_promedio')
    .eq('activa', true)
    .not('precio_minimo', 'is', null)
    .order('precio_minimo')
    .limit(10)

  const precioMin = autoescuelas?.[0]?.precio_minimo ?? precioMedio - 200
  const precioMax = autoescuelas?.[autoescuelas.length - 1]?.precio_maximo ?? precioMedio + 300

  return (
    <>
      <section className="bg-gradient-to-br from-brand-700 to-brand-600 text-white py-12">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-blue-200 text-sm mb-4">
            <Link href="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/cuanto-cuesta-carnet-conducir" className="hover:text-white">Precio carnet</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{ciudadStatic.nombre}</span>
          </nav>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl font-black mb-3">
                Precio del carnet de conducir en {ciudadStatic.nombre}
              </h1>
              <p className="text-blue-100 text-lg mb-6">
                Comparativa completa y actualizada a {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Desde', value: `${precioMin}€` },
                  { label: 'Precio medio', value: `${precioMedio}€` },
                  { label: 'Hasta', value: `${precioMax}€` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-xl font-black">{value}</p>
                    <p className="text-xs text-blue-200 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <LeadForm defaultCiudad={ciudadSlug} />
            </div>
          </div>
        </div>
      </section>

      {/* Tabla de precios */}
      <section className="py-12">
        <div className="container-main max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Precios actualizados por autoescuela en {ciudadStatic.nombre}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Info className="w-4 h-4" />
            Precios orientativos. Incluye matrícula + clases teóricas + exámenes.
          </div>

          {autoescuelas && autoescuelas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Autoescuela</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">Precio desde</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">Precio hasta</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">€/clase</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Rating</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {autoescuelas.map((ae) => (
                    <tr key={ae.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{ae.nombre}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-green-600">
                        {ae.precio_minimo ? formatPrice(ae.precio_minimo) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right text-gray-600">
                        {ae.precio_maximo ? formatPrice(ae.precio_maximo) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right text-gray-500 hidden md:table-cell">
                        {ae.precio_practicas ? `${ae.precio_practicas}€` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right hidden md:table-cell">
                        ⭐ {ae.rating_promedio?.toFixed(1) ?? '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/autoescuelas/${ciudadSlug}/${ae.slug}`}
                          className="text-brand-600 font-medium hover:underline text-xs"
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Cargando precios...</p>
          )}

          <div className="mt-6 text-center">
            <Link href={`/autoescuelas/${ciudadSlug}`} className="btn-primary">
              Ver todas las autoescuelas de {ciudadStatic.nombre}
            </Link>
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="py-4 bg-gray-50">
        <div className="container-main max-w-4xl">
          <FAQSection
            title={`Preguntas sobre el precio del carnet en ${ciudadStatic.nombre}`}
            faqs={[
              {
                pregunta: `¿Cuánto cuesta el carnet de conducir en ${ciudadStatic.nombre} en ${new Date().getFullYear()}?`,
                respuesta: `El precio del carnet de conducir (Permiso B) en ${ciudadStatic.nombre} varía entre ${precioMin}€ y ${precioMax}€. El precio medio está en ${precioMedio}€. Este precio incluye matrícula, clases teóricas, material y los exámenes de la DGT. Las clases prácticas adicionales cuestan entre 25€ y 35€ la hora.`,
              },
              {
                pregunta: `¿Se puede encontrar el carnet por menos de 700€ en ${ciudadStatic.nombre}?`,
                respuesta: `Sí, en ${ciudadStatic.nombre} hay autoescuelas con precios desde ${precioMin}€ para paquetes básicos. Ten en cuenta que estos paquetes pueden incluir menos clases prácticas, por lo que el coste final puede ser mayor si necesitas más clases para aprobar.`,
              },
              {
                pregunta: '¿El precio varía según el barrio?',
                respuesta: `Sí, las autoescuelas situadas en el centro o en zonas más céntricas tienden a ser más caras que las de barrios periféricos. Sin embargo, la diferencia no suele superar los 150€ y lo más importante es la calidad del instructor y la tasa de aprobados.`,
              },
            ]}
          />
        </div>
      </section>
    </>
  )
}
