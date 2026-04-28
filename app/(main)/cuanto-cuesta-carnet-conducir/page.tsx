import { type Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Clock, Euro, BookOpen } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'
import LeadForm from '@/components/forms/LeadForm'
import FAQSection from '@/components/seo/FAQSection'
import { CIUDADES } from '@/data/cities'
import { type FAQItem } from '@/types'

export const metadata: Metadata = buildMetadata({
  title: `¿Cuánto cuesta el carnet de conducir en España? — Precios ${new Date().getFullYear()}`,
  description:
    'Guía completa sobre el precio del carnet de conducir en España. Coste por ciudad, qué incluye, cómo ahorrar y comparativa de autoescuelas. Actualizado 2025.',
  canonical: '/cuanto-cuesta-carnet-conducir',
})

const PRECIOS_CIUDADES = [
  { ciudad: 'Madrid',    slug: 'madrid',    min: 700, max: 1200, media: 850 },
  { ciudad: 'Barcelona', slug: 'barcelona', min: 750, max: 1300, media: 900 },
  { ciudad: 'Valencia',  slug: 'valencia',  min: 620, max: 1000, media: 780 },
  { ciudad: 'Sevilla',   slug: 'sevilla',   min: 600, max: 950,  media: 750 },
  { ciudad: 'Zaragoza',  slug: 'zaragoza',  min: 580, max: 900,  media: 720 },
  { ciudad: 'Málaga',    slug: 'malaga',    min: 600, max: 950,  media: 740 },
  { ciudad: 'Bilbao',    slug: 'bilbao',    min: 680, max: 1100, media: 820 },
  { ciudad: 'Alicante',  slug: 'alicante',  min: 580, max: 900,  media: 760 },
]

const DESGLOSE_PRECIO = [
  { concepto: 'Matrícula y alta como alumno', precio: '50€ – 100€' },
  { concepto: 'Clases teóricas (presencial u online)', precio: 'Incluido' },
  { concepto: 'Material didáctico y app DGT', precio: '20€ – 50€' },
  { concepto: 'Clases prácticas (10-15 clases estándar)', precio: '250€ – 500€' },
  { concepto: 'Tasas examen teórico DGT', precio: '46,54€' },
  { concepto: 'Tasas examen práctico DGT', precio: '93,08€' },
  { concepto: 'Gestión documentación', precio: '30€ – 60€' },
]

const faqs: FAQItem[] = [
  {
    pregunta: '¿Cuánto cuesta el carnet de conducir en España en 2025?',
    respuesta: 'El precio medio del carnet de conducir (Permiso B) en España en 2025 es de unos 800€-900€. El precio puede variar entre 580€ en ciudades más pequeñas y más de 1.300€ en grandes ciudades como Madrid o Barcelona. Este precio suele incluir las clases teóricas, entre 10 y 15 clases prácticas y los exámenes de la DGT.',
  },
  {
    pregunta: '¿Qué está incluido en el precio del carnet?',
    respuesta: 'El precio del carnet de conducir generalmente incluye: matrícula, acceso a clases teóricas, material didáctico (app para test DGT), clases prácticas (número variable), primera convocatoria del examen teórico y primera convocatoria del examen práctico. Las tasas de la DGT están incluidas en autoescuelas todo incluido, pero algunas cobran aparte.',
  },
  {
    pregunta: '¿Cuántas clases prácticas necesito para aprobar?',
    respuesta: 'El número medio de clases prácticas en España es de 17-25 clases. Los paquetes básicos incluyen 10-12 clases y el resto se pagan aparte (entre 25€ y 40€/clase). Si partes de cero, calcula entre 20 y 25 clases. Si ya tienes algo de experiencia, puedes necesitar menos.',
  },
  {
    pregunta: '¿Se puede pagar el carnet a plazos?',
    respuesta: 'Sí, muchas autoescuelas ofrecen pago fraccionado, generalmente en 2-4 cuotas. Algunas también colaboran con entidades financieras para aplazamientos más largos. Al comparar autoescuelas en CarnetYa, puedes preguntar directamente las condiciones de pago a cada una.',
  },
  {
    pregunta: '¿Por qué el carnet es más caro en Madrid y Barcelona?',
    respuesta: 'Los precios son más altos en las grandes ciudades por el mayor coste del alquiler de locales, combustible, vehículos de prácticas y salarios. Además, la densidad de tráfico en estas ciudades hace necesarias más clases prácticas para alcanzar el nivel exigido. Sin embargo, también hay más autoescuelas y por tanto más competencia.',
  },
  {
    pregunta: '¿Cuánto cuesta el carnet de moto?',
    respuesta: 'El Permiso A2 (motos hasta 35kW) cuesta entre 400€ y 800€. El Permiso A (motos sin límite) tiene un coste similar. Si ya tienes el carnet de coche, el coste suele ser algo inferior. El Permiso AM (ciclomotor) es el más económico, desde 200€.',
  },
]

export default function CuantoCuestaPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-500 text-white py-14">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl font-black mb-4">
                ¿Cuánto cuesta el carnet de conducir en {new Date().getFullYear()}?
              </h1>
              <p className="text-blue-100 text-xl mb-6">
                Guía completa con precios reales por ciudad, desglose de gastos y consejos para ahorrar hasta 300€.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Precio mínimo', value: '580€' },
                  { label: 'Precio medio', value: '~800€' },
                  { label: 'Precio máximo', value: '1.300€+' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black">{value}</p>
                    <p className="text-xs text-blue-200 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* Tabla precios por ciudad */}
      <section className="py-14">
        <div className="container-main">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Precio del carnet por ciudad</h2>
          <p className="text-gray-500 mb-8">Actualizado {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Ciudad</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Desde</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Precio medio</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Hasta</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {PRECIOS_CIUDADES.map((row) => (
                  <tr key={row.slug} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{row.ciudad}</td>
                    <td className="px-5 py-3.5 text-right text-green-600 font-semibold">{row.min}€</td>
                    <td className="px-5 py-3.5 text-right font-bold text-gray-900">{row.media}€</td>
                    <td className="px-5 py-3.5 text-right text-gray-500">{row.max}€</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/precio-carnet-conducir/${row.slug}`}
                        className="text-brand-600 font-medium hover:underline"
                      >
                        Ver autoescuelas →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Desglose */}
      <section className="py-14 bg-gray-50">
        <div className="container-main max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">¿En qué se gasta el dinero del carnet?</h2>
          <p className="text-gray-500 mb-8">Desglose de los conceptos que componen el precio del carnet de conducir</p>

          <div className="space-y-3">
            {DESGLOSE_PRECIO.map(({ concepto, precio }) => (
              <div key={concepto} className="flex items-center justify-between bg-white rounded-xl px-5 py-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-800">{concepto}</span>
                </div>
                <span className="font-bold text-gray-900">{precio}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700">
              <strong>💡 Consejo:</strong> El mayor gasto variable son las clases prácticas adicionales (25€–40€/clase).
              Cuanto mejor sea la autoescuela, menos clases necesitarás para aprobar.
            </p>
          </div>
        </div>
      </section>

      {/* Consejos para ahorrar */}
      <section className="py-14">
        <div className="container-main max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Cómo ahorrar dinero con tu carnet
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                icon: Euro,
                title: 'Compara siempre el precio total',
                desc: 'No te fijes solo en la matrícula. Suma todas las clases prácticas que necesitarás y las tasas.',
              },
              {
                icon: BookOpen,
                title: 'Estudia el teórico por tu cuenta',
                desc: 'Con apps gratuitas de test DGT puedes prepararte sin pagar clases teóricas extra.',
              },
              {
                icon: Clock,
                title: 'Evita los cursos intensivos caros',
                desc: 'Si no tienes prisa, un curso normal a 2-3 clases por semana suele ser más económico.',
              },
              {
                icon: CheckCircle,
                title: 'Usa CarnetYa para comparar',
                desc: 'Solicita presupuestos a múltiples autoescuelas y negocia. Puedes ahorrar hasta 300€.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5 flex gap-4">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/comparar" className="btn-primary">
              Comparar precios ahora — gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-4 bg-gray-50">
        <div className="container-main max-w-4xl">
          <FAQSection faqs={faqs} />
        </div>
      </section>
    </>
  )
}
