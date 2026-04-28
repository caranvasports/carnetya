import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Star, ArrowRight } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'
import { getCiudadBySlug, CIUDADES } from '@/data/cities'
import { createClient } from '@/lib/supabase/server'
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
    title: `Las mejores autoescuelas de ${ciudad.nombre} ${new Date().getFullYear()} — Ranking`,
    description: `Ranking de las mejores autoescuelas de ${ciudad.nombre} según valoraciones reales de alumnos. Las mejor valoradas, con mayor tasa de aprobados.`,
    canonical: `/autoescuelas/${ciudadSlug}/mejores`,
  })
}

export default async function MejoresAutoescuelasPage({ params }: Props) {
  const { ciudad: ciudadSlug } = await params
  const ciudadStatic = getCiudadBySlug(ciudadSlug)
  if (!ciudadStatic) notFound()

  const supabase = await createClient()
  const { data: ciudad } = await supabase.from('ciudades').select('id').eq('slug', ciudadSlug).single()

  const { data: autoescuelas } = await supabase
    .from('autoescuelas')
    .select('*, ciudad:ciudades(nombre, slug)')
    .eq('ciudad_id', ciudad?.id ?? '')
    .eq('activa', true)
    .gte('rating_promedio', 4)
    .order('rating_promedio', { ascending: false })
    .order('total_reviews', { ascending: false })

  return (
    <>
      <section className="bg-gradient-to-br from-yellow-600 to-orange-500 text-white py-12">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-yellow-100 text-sm mb-4">
            <Link href="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/autoescuelas/${ciudadSlug}`} className="hover:text-white">
              Autoescuelas {ciudadStatic.nombre}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Mejores</span>
          </nav>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 w-fit mb-3">
                <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                <span className="text-sm font-medium">Top valoradas por alumnos</span>
              </div>
              <h1 className="text-4xl font-black mb-3">
                Mejores autoescuelas de {ciudadStatic.nombre}
              </h1>
              <p className="text-yellow-100 text-lg">
                Ranking basado en <strong className="text-white">valoraciones reales</strong> de alumnos.
                Solo autoescuelas con 4+ estrellas.
              </p>
            </div>
            <div>
              <LeadForm defaultCiudad={ciudadSlug} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-main">
          <SchoolList autoescuelas={autoescuelas ?? []} ciudadSlug={ciudadSlug} />
        </div>
      </section>

      <section className="py-4 bg-gray-50">
        <div className="container-main max-w-4xl">
          <FAQSection
            faqs={[
              {
                pregunta: `¿Cómo se eligen las mejores autoescuelas de ${ciudadStatic.nombre}?`,
                respuesta: 'Este ranking se basa en las valoraciones dejadas por alumnos reales que han completado su formación. Solo aparecen autoescuelas con una media de 4 estrellas o más y con un mínimo de opiniones verificadas. Las autoescuelas verificadas por nuestro equipo reciben una distinción especial.',
              },
              {
                pregunta: '¿La mejor valorada es siempre la mejor opción?',
                respuesta: 'No necesariamente. La mejor autoescuela para ti depende de tu presupuesto, disponibilidad horaria y ubicación. Una autoescuela excelente pero lejana puede ser menos conveniente que una buena en tu barrio. Recomendamos solicitar presupuesto a varias y comparar.',
              },
            ]}
          />
        </div>
      </section>
    </>
  )
}
