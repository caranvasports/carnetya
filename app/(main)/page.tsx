import Link from 'next/link'
import { Search, Star, Shield, TrendingDown, Users, CheckCircle, ArrowRight, MapPin } from 'lucide-react'
import { type Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { CIUDADES } from '@/data/cities'
import LeadForm from '@/components/forms/LeadForm'

export const metadata: Metadata = buildMetadata({
  title: 'Encuentra tu autoescuela — Compara precios y opiniones',
  description:
    'CarnetYa: compara autoescuelas en toda España. Consulta precios, valoraciones y consigue el carnet de conducir al mejor precio. ¡Gratis y sin compromiso!',
  canonical: '/',
})

const STATS = [
  { icon: Users,     value: '+10.000', label: 'Alumnos al mes' },
  { icon: Shield,    value: '+500',    label: 'Autoescuelas verificadas' },
  { icon: Star,      value: '4.7/5',   label: 'Valoración media' },
  { icon: TrendingDown, value: '-30%', label: 'Ahorro medio' },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Busca en tu ciudad', desc: 'Introduce tu ciudad y te mostramos todas las autoescuelas disponibles.' },
  { step: '2', title: 'Compara y filtra', desc: 'Filtra por precio, valoración y servicios. Lee opiniones reales de alumnos.' },
  { step: '3', title: 'Recibe presupuestos', desc: 'Rellena el formulario y recibe hasta 3 presupuestos personalizados gratis.' },
]

const TESTIMONIALS = [
  {
    name: 'María G.',
    ciudad: 'Madrid',
    rating: 5,
    text: 'Ahorré 250€ comparando autoescuelas. Encontré una cercana a casa con mejores opiniones que la que conocía.',
  },
  {
    name: 'Carlos R.',
    ciudad: 'Valencia',
    rating: 5,
    text: 'Me puse en contacto con 3 autoescuelas a la vez y elegí la que mejor se adaptaba a mi horario.',
  },
  {
    name: 'Ana P.',
    ciudad: 'Barcelona',
    rating: 5,
    text: 'Facilísimo de usar. En 5 minutos tenía los presupuestos en el móvil. 100% recomendable.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* ──── HERO ──── */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="container-main pt-16 pb-12 lg:pt-24 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                El comparador #1 de autoescuelas en España
              </div>
              <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4">
                Consigue tu carnet al{' '}
                <span className="text-yellow-300">mejor precio</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Compara autoescuelas, precios y opiniones. Recibe presupuestos gratis de hasta 3 autoescuelas cercanas.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {STATS.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-lg leading-none">{value}</p>
                      <p className="text-blue-200 text-xs">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="lg:pl-8">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* ──── CIUDADES PRINCIPALES ──── */}
      <section className="bg-gray-50 py-14">
        <div className="container-main">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Autoescuelas por ciudad
            </h2>
            <p className="text-gray-600">Encuentra autoescuelas en las principales ciudades de España</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CIUDADES.slice(0, 12).map((ciudad) => (
              <Link
                key={ciudad.slug}
                href={`/autoescuelas/${ciudad.slug}`}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-brand-300 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  <MapPin className="w-5 h-5 text-brand-500" />
                </div>
                <span className="text-sm font-semibold text-gray-800 group-hover:text-brand-600 transition-colors text-center">
                  {ciudad.nombre}
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/autoescuelas" className="text-brand-600 font-medium hover:underline text-sm">
              Ver todas las ciudades →
            </Link>
          </div>
        </div>
      </section>

      {/* ──── CÓMO FUNCIONA ──── */}
      <section className="py-16">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">¿Cómo funciona CarnetYa?</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              En menos de 5 minutos puedes comparar precios y recibir presupuestos personalizados
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4">
                  {step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/comparar" className="btn-primary">
              Comparar ahora — gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ──── TESTIMONIOS ──── */}
      <section className="bg-gray-50 py-16">
        <div className="container-main">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Lo que dicen nuestros usuarios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-6">
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.ciudad}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── CTA FINAL ──── */}
      <section className="bg-brand-600 text-white py-16">
        <div className="container-main text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Miles de alumnos ya han encontrado su autoescuela con CarnetYa. Es gratis y solo tarda 2 minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/comparar" className="bg-cta hover:bg-cta-hover text-white font-bold px-8 py-4 rounded-xl transition-colors">
              Comparar autoescuelas gratis
            </Link>
            <Link href="/cuanto-cuesta-carnet-conducir" className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl transition-colors">
              ¿Cuánto cuesta el carnet?
            </Link>
          </div>
        </div>
      </section>

      {/* ──── PARA AUTOESCUELAS ──── */}
      <section className="py-16">
        <div className="container-main">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row gap-8 items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-3">¿Tienes una autoescuela?</h2>
              <p className="text-gray-300 max-w-md">
                Recibe leads cualificados de alumnos en tu zona. Gestiona tus alumnos, clases y facturación en un solo panel. Desde 29€/mes.
              </p>
              <ul className="mt-4 space-y-2">
                {['Leads exclusivos de tu ciudad', 'Panel de gestión de alumnos', 'Calendario de clases', 'Soporte prioritario'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/autoescuela/registro" className="btn-primary whitespace-nowrap">
                Registrar mi autoescuela
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/autoescuela/planes" className="text-center text-sm text-gray-400 hover:text-white transition-colors">
                Ver planes y precios →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
