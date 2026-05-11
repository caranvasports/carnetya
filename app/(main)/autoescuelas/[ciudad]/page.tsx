import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import { MapPin, TrendingDown, Star, ChevronRight, CheckCircle2, Clock, ShieldCheck, PhoneCall } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buildMetadata, buildBreadcrumbSchema, buildFAQSchema } from '@/lib/seo'
import { getCiudadBySlug, CIUDADES } from '@/data/cities'
import { formatPrice } from '@/lib/utils'
import { type FAQItem } from '@/types'
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
    title: `Autoescuelas en ${ciudad.nombre} — Compara precios ${new Date().getFullYear()}`,
    description: `Compara las mejores autoescuelas de ${ciudad.nombre}. Precios desde 600€, valoraciones reales y presupuestos gratis. ¡Encuentra la mejor autoescuela en ${ciudad.nombre}!`,
    canonical: `/autoescuelas/${ciudadSlug}`,
  })
}

function getFAQs(ciudadNombre: string, precioMedio: number): FAQItem[] {
  return [
    {
      pregunta: `¿Cuánto cuesta sacarse el carnet de conducir en ${ciudadNombre}?`,
      respuesta: `El precio del carnet de conducir en ${ciudadNombre} varía entre 600€ y 1.200€ según la autoescuela y el número de clases prácticas necesarias. El precio medio en ${ciudadNombre} es de unos ${precioMedio}€. Este precio incluye la matrícula, las clases teóricas, el material didáctico y las tasas de examen.`,
    },
    {
      pregunta: `¿Cuánto tiempo se tarda en sacar el carnet en ${ciudadNombre}?`,
      respuesta: `El tiempo medio para obtener el carnet de conducir en ${ciudadNombre} es de 3 a 6 meses para el proceso estándar. Si optas por un curso intensivo, puedes conseguirlo en 4-8 semanas. El tiempo depende de tu dedicación, el número de clases por semana y los plazos para los exámenes de la DGT.`,
    },
    {
      pregunta: `¿Cuál es la mejor autoescuela de ${ciudadNombre}?`,
      respuesta: `Las mejores autoescuelas de ${ciudadNombre} según valoraciones de alumnos son las que aparecen en lo alto de este listado. Para elegir la mejor, considera la proximidad a tu casa o trabajo, el horario, el precio total y las opiniones de otros alumnos.`,
    },
    {
      pregunta: `¿Qué incluye el precio del carnet en ${ciudadNombre}?`,
      respuesta: `El precio del carnet de conducir en ${ciudadNombre} generalmente incluye: matrícula y alta como alumno, acceso a clases teóricas presenciales y/o online, aplicación para practicar el test DGT, clases prácticas (número variable según la tarifa), primera convocatoria de examen teórico y primera convocatoria de examen práctico. Las clases prácticas adicionales y los exámenes extra tienen coste adicional.`,
    },
    {
      pregunta: `¿Puedo pagar el carnet a plazos en ${ciudadNombre}?`,
      respuesta: `Sí, la mayoría de autoescuelas en ${ciudadNombre} ofrecen opciones de pago fraccionado. Puedes pagar una parte al matricularte y el resto por mensualidades. Algunas autoescuelas también aceptan financiación externa. Al comparar, consulta siempre las condiciones de pago.`,
    },
  ]
}

export default async function CiudadPage({ params }: Props) {
  const { ciudad: ciudadSlug } = await params
  const ciudadStatic = getCiudadBySlug(ciudadSlug)
  if (!ciudadStatic) notFound()

  const supabase = await createClient()

  // Cargar ciudad y autoescuelas
  const { data: ciudad } = await supabase
    .from('ciudades')
    .select('*')
    .eq('slug', ciudadSlug)
    .eq('activa', true)
    .single()

  const { data: autoescuelas } = await supabase
    .from('autoescuelas')
    .select('*, ciudad:ciudades(nombre, slug)')
    .eq('ciudad_id', ciudad?.id ?? '')
    .eq('activa', true)
    .order('destacada', { ascending: false })
    .order('rating_promedio', { ascending: false })

  const precioMedio = ciudad?.precio_medio_carnet ?? 800
  const faqs = getFAQs(ciudadStatic.nombre, precioMedio)

  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Autoescuelas', url: '/autoescuelas' },
    { name: ciudadStatic.nombre, url: `/autoescuelas/${ciudadSlug}` },
  ]

  const hayAutoescuelas = (autoescuelas?.length ?? 0) > 0

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema(breadcrumbs)) }}
      />

      {/* ──── HERO CIUDAD ──── */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-500 text-white py-12">
        <div className="container-main">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-blue-200 text-sm mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="hover:text-white">Autoescuelas</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{ciudadStatic.nombre}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 text-blue-200 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{ciudadStatic.provincia}</span>
              </div>
              <h1 className="text-4xl font-black mb-3">
                Autoescuelas en {ciudadStatic.nombre}
              </h1>
              {hayAutoescuelas ? (
                <>
                  <p className="text-blue-100 text-lg mb-6">
                    Compara las <strong className="text-white">{autoescuelas!.length}</strong> mejores autoescuelas de {ciudadStatic.nombre}.
                    Valoraciones reales y presupuestos gratis.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { icon: Star, text: `Precio medio: ${formatPrice(precioMedio)}` },
                      { icon: TrendingDown, text: `${autoescuelas!.length} autoescuelas` },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{text}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-blue-100 text-lg mb-6">
                    Cuéntanos qué carnet necesitas y te enviamos <strong className="text-white">presupuestos gratis</strong> de autoescuelas en {ciudadStatic.nombre}.
                    Sin compromiso.
                  </p>
                  <div className="flex flex-col gap-3">
                    {[
                      { icon: CheckCircle2, text: 'Gratis y sin compromiso' },
                      { icon: Clock,        text: 'Respuesta en menos de 24h' },
                      { icon: ShieldCheck,  text: 'Tus datos están seguros' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 text-blue-100">
                        <Icon className="w-4 h-4 text-green-300 shrink-0" />
                        <span className="text-sm">{text}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div>
              <div className="bg-white/5 rounded-2xl p-1">
                <LeadForm defaultCiudad={ciudadSlug} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── VARIANTES SEO ──── */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container-main py-3 flex gap-3 overflow-x-auto text-sm">
          {[
            { label: `Todas`, href: `/autoescuelas/${ciudadSlug}` },
            { label: `Más baratas`, href: `/autoescuelas/${ciudadSlug}/baratas` },
            { label: `Mejor valoradas`, href: `/autoescuelas/${ciudadSlug}/mejores` },
            { label: `Precio carnet`, href: `/precio-carnet-conducir/${ciudadSlug}` },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ──── CONTENIDO PRINCIPAL ──── */}
      {hayAutoescuelas ? (
        /* Con autoescuelas: comparador + sidebar */
        <section className="py-10">
          <div className="container-main">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <SchoolList
                  autoescuelas={autoescuelas!}
                  ciudadSlug={ciudadSlug}
                />
              </div>
              <aside className="space-y-6">
                <div className="card p-6">
                  <h2 className="font-bold text-gray-900 mb-1">¿Cuál te conviene?</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Rellena el formulario y recibe hasta 3 presupuestos personalizados gratis.
                  </p>
                  <LeadForm defaultCiudad={ciudadSlug} />
                </div>
                <div className="card p-6">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Precio carnet en {ciudadStatic.nombre}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'Precio mínimo', value: '580€' },
                      { label: 'Precio medio', value: formatPrice(precioMedio) },
                      { label: 'Precio máximo', value: '1.200€' },
                      { label: 'Clase práctica', value: '25€ – 35€' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/precio-carnet-conducir/${ciudadSlug}`}
                    className="mt-4 text-sm text-brand-600 hover:underline block"
                  >
                    Guía completa de precios →
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>
      ) : (
        /* Sin autoescuelas: sección conversión */
        <section className="py-14 bg-gray-50">
          <div className="container-main max-w-5xl">
            {/* Aviso amable */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-10 flex items-start gap-3">
              <PhoneCall className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Todavía no tenemos autoescuelas verificadas en {ciudadStatic.nombre}.</strong>{' '}
                Déjanos tus datos y te avisamos en cuanto tengamos opciones disponibles, o te conectamos con autoescuelas de la zona.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 items-start">
              {/* Beneficios */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Recibe presupuestos gratis en {ciudadStatic.nombre}
                </h2>
                <p className="text-gray-500 mb-8">
                  Rellena el formulario en menos de 2 minutos y te enviamos las mejores opciones adaptadas a ti.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: CheckCircle2, title: 'Comparamos por ti', desc: 'Sin tener que llamar a cada autoescuela una por una.' },
                    { icon: Clock,        title: 'Respuesta rápida',  desc: 'Te contactamos en menos de 24 horas con opciones reales.' },
                    { icon: ShieldCheck,  title: 'Sin compromiso',    desc: 'Pides información, y decides tú con libertad total.' },
                    { icon: Star,         title: 'Solo lo mejor',     desc: 'Trabajamos con autoescuelas verificadas y bien valoradas.' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <li key={title} className="flex items-start gap-3">
                      <span className="mt-0.5 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-brand-600" />
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{title}</p>
                        <p className="text-gray-500 text-sm">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Formulario */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <p className="text-sm font-semibold text-brand-600 mb-1">Es gratis y tarda 2 minutos</p>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Solicita tu presupuesto</h3>
                <LeadForm defaultCiudad={ciudadSlug} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ──── CONTENIDO SEO ──── */}
      <section className="py-10 border-t border-gray-100">
        <div className="container-main max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Autoescuelas en {ciudadStatic.nombre}: guía completa {new Date().getFullYear()}
          </h2>
          <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
            <p>
              Encontrar la mejor autoescuela en <strong>{ciudadStatic.nombre}</strong> puede marcar la diferencia entre
              aprobar rápido y gastar más de lo necesario. En CarnetYa hemos analizado todas las autoescuelas
              disponibles en {ciudadStatic.nombre} para que puedas tomar la mejor decisión con la información más actualizada.
            </p>
            <p>
              El <strong>precio del carnet de conducir en {ciudadStatic.nombre}</strong> varía considerablemente según la
              autoescuela, el barrio y el tipo de formación. El precio medio está en torno a <strong>{formatPrice(precioMedio)}</strong>,
              aunque puedes encontrar opciones desde 580€ si buscas bien. Este precio incluye normalmente la matrícula, las
              clases teóricas, el material y las primeras convocatorias de examen.
            </p>
            <p>
              Antes de elegir autoescuela en {ciudadStatic.nombre}, considera estos factores clave:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Ubicación:</strong> ¿está cerca de tu casa o trabajo?</li>
              <li><strong>Horario:</strong> ¿se adapta a tus disponibilidades?</li>
              <li><strong>Precio total:</strong> compara el precio completo, no solo la matrícula</li>
              <li><strong>Tasa de aprobados:</strong> las mejores superan el 75% en primeras convocatorias</li>
              <li><strong>Opiniones:</strong> lee las reseñas recientes de alumnos reales</li>
              <li><strong>Tecnología:</strong> ¿tienen app para preparar el teórico?</li>
            </ul>
            <p>
              En {ciudadStatic.nombre} puedes elegir entre autoescuelas tradicionales presenciales, autoescuelas online
              para el teórico con prácticas presenciales, y cursos intensivos para obtener el carnet en el menor tiempo posible.
            </p>
          </div>

          <FAQSection faqs={faqs} />
        </div>
      </section>
    </>
  )
}
