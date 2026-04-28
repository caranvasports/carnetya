import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, TrendingDown, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buildMetadata } from '@/lib/seo'
import { getCiudadBySlug, CIUDADES } from '@/data/cities'
import { formatPrice } from '@/lib/utils'
import SchoolList from '@/components/comparator/SchoolList'
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
    title: `Autoescuelas baratas en ${ciudad.nombre} — Desde 580€`,
    description: `Las autoescuelas más baratas de ${ciudad.nombre} ordenadas por precio. Compara precios reales, ahorra hasta 300€ y obtén el carnet al mejor precio.`,
    canonical: `/autoescuelas/${ciudadSlug}/baratas`,
  })
}

export default async function AutoescuelasBaRatasPage({ params }: Props) {
  const { ciudad: ciudadSlug } = await params
  const ciudadStatic = getCiudadBySlug(ciudadSlug)
  if (!ciudadStatic) notFound()

  const supabase = await createClient()

  const { data: ciudad } = await supabase
    .from('ciudades')
    .select('*')
    .eq('slug', ciudadSlug)
    .single()

  const { data: autoescuelas } = await supabase
    .from('autoescuelas')
    .select('*, ciudad:ciudades(nombre, slug)')
    .eq('ciudad_id', ciudad?.id ?? '')
    .eq('activa', true)
    .order('precio_minimo', { ascending: true, nullsFirst: false })

  const precioMedio = ciudad?.precio_medio_carnet ?? 800
  const baratas = autoescuelas?.filter((a) => a.precio_minimo && a.precio_minimo <= precioMedio) ?? []

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-green-500 text-white py-10">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-green-200 text-sm mb-4">
            <Link href="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/autoescuelas/${ciudadSlug}`} className="hover:text-white">
              Autoescuelas {ciudadStatic.nombre}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Más baratas</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 w-fit mb-3">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">Mejor precio garantizado</span>
              </div>
              <h1 className="text-4xl font-black mb-3">
                Autoescuelas baratas en {ciudadStatic.nombre}
              </h1>
              <p className="text-green-100 text-lg mb-4">
                Hemos seleccionado las <strong className="text-white">{baratas.length} autoescuelas más baratas</strong> de {ciudadStatic.nombre}.
                Todas con buenas valoraciones y precios desde <strong className="text-white">580€</strong>.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  'Precios actualizados mensualmente',
                  'Sin letra pequeña — precio total incluido',
                  'Comparativa de clases prácticas incluidas',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-green-100">
                    <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <LeadForm defaultCiudad={ciudadSlug} />
            </div>
          </div>
        </div>
      </section>

      {/* Tabla comparativa de precios */}
      <section className="py-8 bg-gray-50 border-b border-gray-100">
        <div className="container-main">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Comparativa rápida de precios</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white rounded-xl shadow-sm overflow-hidden">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Autoescuela</th>
                  <th className="text-right px-4 py-3">Precio desde</th>
                  <th className="text-right px-4 py-3">Clase práctica</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">Valoración</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(autoescuelas ?? []).map((ae) => (
                  <tr key={ae.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{ae.nombre}</td>
                    <td className="px-4 py-3 text-right font-bold text-brand-600">
                      {ae.precio_minimo ? formatPrice(ae.precio_minimo) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {ae.precio_practicas ? `${formatPrice(ae.precio_practicas)}/clase` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      ⭐ {ae.rating_promedio.toFixed(1)}
                    </td>
                    <td className="px-4 py-3">
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
        </div>
      </section>

      {/* Lista principal */}
      <section className="py-10">
        <div className="container-main">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Las autoescuelas más baratas de {ciudadStatic.nombre}
          </h2>
          <SchoolList autoescuelas={baratas} ciudadSlug={ciudadSlug} />
        </div>
      </section>

      {/* Contenido SEO */}
      <section className="py-10 border-t border-gray-100">
        <div className="container-main max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Cómo encontrar la autoescuela más barata en {ciudadStatic.nombre}
          </h2>
          <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
            <p>
              El precio del carnet de conducir puede variar hasta 400€ entre distintas autoescuelas de {ciudadStatic.nombre}.
              Sin embargo, elegir la más barata no siempre es la mejor opción: una autoescuela de bajo coste con mala
              enseñanza puede salirte más cara a largo plazo si necesitas más clases prácticas o repetir los exámenes.
            </p>
            <p>
              Para encontrar la mejor relación calidad-precio en {ciudadStatic.nombre}, sigue estos consejos:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Compara siempre el precio <strong>total</strong>, no solo la matrícula</li>
              <li>Pregunta cuántas clases prácticas incluye el precio base</li>
              <li>Consulta el precio por clase práctica adicional (varía entre 22€ y 40€)</li>
              <li>Mira la tasa de aprobados en primera convocatoria</li>
              <li>Verifica si incluye el seguro del alumno y las tasas DGT</li>
            </ul>
          </div>

          <FAQSection
            faqs={[
              {
                pregunta: `¿Cuál es la autoescuela más barata de ${ciudadStatic.nombre}?`,
                respuesta: `El precio más bajo que hemos encontrado en ${ciudadStatic.nombre} es de 580€. Sin embargo, recomendamos comparar también la tasa de aprobados y las opiniones antes de elegir solo por precio.`,
              },
              {
                pregunta: '¿Por qué hay tanta diferencia de precios entre autoescuelas?',
                respuesta: 'Los precios varían según la zona de la ciudad, el número de clases incluidas, si disponen de simuladores, la tecnología de la app para el teórico, y la experiencia de los instructores. Una autoescuela con mayor tasa de aprobado puede resultar más económica en total aunque cobre más de entrada.',
              },
              {
                pregunta: '¿El precio incluye el examen de la DGT?',
                respuesta: 'Generalmente sí: el primer intento del examen teórico y el primer intento del examen práctico suelen estar incluidos. Los exámenes adicionales tienen un coste extra de unos 50€-80€ cada uno.',
              },
            ]}
          />
        </div>
      </section>
    </>
  )
}
