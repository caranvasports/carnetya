import Link from 'next/link'
import { Check, Star, Zap, Building2 } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'
import { type Metadata } from 'next'

export const metadata: Metadata = buildMetadata({
  title: 'Planes para autoescuelas — CarnetYa',
  description: 'Elige el plan que mejor se adapte a tu autoescuela. Desde gratis hasta premium con leads exclusivos y panel de gestión completo.',
  canonical: '/autoescuela/planes',
})

const PLANES = [
  {
    nombre: 'Free',
    precio: '0',
    descripcion: 'Para empezar y probar la plataforma',
    color: 'border-gray-200',
    badgeColor: 'bg-gray-100 text-gray-600',
    destacado: false,
    features: [
      'Perfil público en el comparador',
      'Ficha con fotos y descripción',
      'Reseñas de alumnos',
      'Estadísticas básicas',
      '✗ Sin leads de alumnos',
      '✗ Sin panel de gestión',
    ],
    cta: 'Empezar gratis',
    ctaHref: '/autoescuela/registro',
    ctaClass: 'btn-secondary w-full justify-center',
  },
  {
    nombre: 'Basic',
    precio: '29',
    descripcion: 'Para autoescuelas que quieren crecer',
    color: 'border-brand-300',
    badgeColor: 'bg-brand-100 text-brand-700',
    destacado: false,
    features: [
      'Todo lo del plan Free',
      'Hasta 20 leads/mes (5€/lead)',
      'Panel de gestión de alumnos',
      'Seguimiento de fases del alumno',
      'Soporte por email',
      '✗ Sin acceso prioritario a leads',
    ],
    cta: 'Empezar con Basic',
    ctaHref: '/autoescuela/registro',
    ctaClass: 'btn-secondary w-full justify-center',
  },
  {
    nombre: 'Premium',
    precio: '79',
    descripcion: 'Para autoescuelas que quieren dominar su ciudad',
    color: 'border-yellow-400 shadow-lg shadow-yellow-100',
    badgeColor: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
    destacado: true,
    features: [
      'Todo lo del plan Basic',
      'Hasta 60 leads/mes (8€/lead)',
      'Leads prioritarios y exclusivos',
      'Posición destacada en el comparador',
      'Calendario de clases',
      'Gestión de facturación',
      'Soporte prioritario',
    ],
    cta: '¡Quiero ser Premium!',
    ctaHref: '/autoescuela/registro?plan=premium',
    ctaClass: 'btn-primary w-full justify-center',
  },
]

export default function AutoescuelaPlanesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-600 text-white py-16 text-center">
        <div className="container-main max-w-3xl">
          <h1 className="text-4xl font-black mb-3">Planes para autoescuelas</h1>
          <p className="text-blue-100 text-lg">
            Empieza gratis. Crece con nosotros. Sin permanencia, cancela cuando quieras.
          </p>
        </div>
      </section>

      {/* Planes */}
      <section className="py-16">
        <div className="container-main max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            {PLANES.map((plan) => (
              <div
                key={plan.nombre}
                className={`bg-white rounded-2xl border-2 p-7 flex flex-col relative ${plan.color}`}
              >
                {plan.destacado && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-black px-4 py-1 rounded-full">
                      ⭐ MÁS POPULAR
                    </span>
                  </div>
                )}
                <div className="mb-5">
                  <span className={`inline-block text-xs font-bold rounded-full px-3 py-1 mb-3 ${plan.badgeColor}`}>
                    {plan.nombre}
                  </span>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black text-gray-900">{plan.precio}€</span>
                    {plan.precio !== '0' && <span className="text-gray-500 mb-1">/mes</span>}
                    {plan.precio === '0' && <span className="text-gray-500 mb-1">/siempre</span>}
                  </div>
                  <p className="text-sm text-gray-500">{plan.descripcion}</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((feat, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2 text-sm ${feat.startsWith('✗') ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {feat.startsWith('✗') ? (
                        <span className="mt-0.5 w-4 h-4 shrink-0" />
                      ) : (
                        <Check className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
                      )}
                      {feat.replace('✗ ', '')}
                    </li>
                  ))}
                </ul>
                <Link href={plan.ctaHref} className={`${plan.ctaClass} flex items-center gap-2`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ planes */}
      <section className="py-10 bg-white">
        <div className="container-main max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Preguntas sobre los planes</h2>
          <div className="space-y-3">
            {[
              {
                q: '¿Puedo cambiar de plan en cualquier momento?',
                a: 'Sí. Puedes subir o bajar de plan cuando quieras desde tu panel de facturación. Los cambios se aplican al inicio del siguiente ciclo de facturación.',
              },
              {
                q: '¿Cómo funciona el pago por leads?',
                a: 'Los leads son solicitudes de alumnos reales que buscan autoescuela en tu ciudad. Solo recibes leads que coincidan con tu zona. El coste se descuenta de tu saldo o se factura mensualmente.',
              },
              {
                q: '¿Hay permanencia mínima?',
                a: 'No. Puedes cancelar en cualquier momento. No hay comisiones de cancelación ni contratos de permanencia.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="group border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex justify-between items-center p-5 cursor-pointer font-medium text-gray-800 hover:bg-gray-50">
                  {q}
                  <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-600">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
