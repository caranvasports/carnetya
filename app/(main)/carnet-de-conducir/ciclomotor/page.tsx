import { type Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import LeadForm from '@/components/forms/LeadForm'
import FAQSection from '@/components/seo/FAQSection'
import Link from 'next/link'
import { CheckCircle, Clock, Euro, Zap, BookOpen } from 'lucide-react'

export const metadata: Metadata = buildMetadata({
  title: 'Carnet de Ciclomotor (Permiso AM) 2025 — Precio, Edad y Cómo Sacarlo',
  description:
    'Guía completa del carnet de ciclomotor (permiso AM): precio desde 150 €, edad mínima 15 años, examen teórico DGT y qué vehículos puedes conducir.',
  canonical: '/carnet-de-conducir/ciclomotor',
})

const VEHICULOS = [
  { tipo: 'Ciclomotores de 2 ruedas', cc: 'Hasta 50 cc', vel: 'Hasta 45 km/h' },
  { tipo: 'Ciclomotores de 3 ruedas', cc: 'Hasta 50 cc', vel: 'Hasta 45 km/h' },
  { tipo: 'Quads ligeros', cc: 'Hasta 50 cc', vel: 'Hasta 45 km/h' },
  { tipo: 'Vehículos eléctricos equivalentes', cc: '≤ 4 kW', vel: 'Hasta 45 km/h' },
]

const PASOS = [
  { icon: BookOpen, titulo: 'Apúntate a una autoescuela', desc: 'Busca una autoescuela homologada en tu ciudad. Necesitarás el DNI, una foto y el reconocimiento médico.' },
  { icon: CheckCircle, titulo: 'Estudia el temario teórico', desc: 'El examen consta de 20 preguntas. Solo se puede fallar 2. El temario es el mismo que el del carnet B.' },
  { icon: Zap, titulo: 'Aprueba el examen teórico', desc: 'Se realiza en los centros de examen DGT o en la propia autoescuela según la provincia. Coste: ~10 €.' },
  { icon: Euro, titulo: '¡Listo!', desc: 'A diferencia de otros permisos, el AM no requiere examen práctico. Con el teórico aprobado ya tienes el carnet.' },
]

const FAQS = [
  {
    pregunta: '¿Cuánto cuesta el carnet de ciclomotor en 2025?',
    respuesta: 'El carnet AM cuesta entre 150 € y 350 € dependiendo de la autoescuela y la ciudad. Es el más económico de todos los permisos. El precio incluye matrícula, clases teóricas, preparación del examen y tasas DGT.',
  },
  {
    pregunta: '¿A qué edad se puede sacar el carnet de ciclomotor?',
    respuesta: 'Desde los 15 años. Es el permiso de conducción que se puede obtener más joven en España. Necesitas el consentimiento de tus padres o tutores si eres menor de 18 años.',
  },
  {
    pregunta: '¿El carnet AM tiene examen práctico?',
    respuesta: 'No. El permiso AM solo requiere superar el examen teórico. No hay examen de circulación ni de maniobras. Esto lo hace el permiso más fácil y rápido de obtener.',
  },
  {
    pregunta: '¿Puedo circular por autopista con el carnet de ciclomotor?',
    respuesta: 'No. Los ciclomotores (hasta 50 cc y 45 km/h) están prohibidos en autopistas, autovías y vías donde la velocidad mínima supera los 40 km/h. Puedes circular por vías urbanas e interurbanas con límite de 50 km/h o menos.',
  },
  {
    pregunta: '¿Con el carnet B puedo conducir un ciclomotor?',
    respuesta: 'Sí. El permiso B incluye la habilitación para conducir ciclomotores. No necesitas el AM si ya tienes el B. Lo mismo aplica para los permisos A1, A2 y A.',
  },
  {
    pregunta: '¿Los patinetes eléctricos necesitan carnet?',
    respuesta: 'Los VMP (Vehículos de Movilidad Personal) como los patinetes eléctricos de uso personal NO necesitan carnet de conducir. Sin embargo, los que superen 25 km/h o los que se clasifiquen como ciclomotores sí requieren el AM.',
  },
]

export default function CarnetCiclomotorPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <Link href="/carnet-de-conducir" className="text-yellow-100 text-sm hover:text-white mb-3 inline-flex items-center gap-1">
                ← Todos los tipos de carnet
              </Link>
              <div className="inline-flex items-center gap-2 bg-yellow-600/40 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Zap className="w-4 h-4" /> Permiso AM — El más fácil
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
                Carnet de Ciclomotor{' '}
                <span className="text-white drop-shadow block">Permiso AM</span>
              </h1>
              <p className="text-yellow-100 text-lg mb-6 leading-relaxed">
                El carnet más asequible y rápido de obtener. Solo examen teórico, sin prácticas. Desde los 15 años y desde 150 €. Ideal para desplazarte por ciudad.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-white/20 rounded-full px-4 py-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 2–4 semanas</span>
                <span className="bg-white/20 rounded-full px-4 py-1.5 flex items-center gap-1.5"><Euro className="w-3.5 h-3.5" /> Desde 150 €</span>
                <span className="bg-white/20 rounded-full px-4 py-1.5 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> +15 años</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-yellow-600 px-6 py-4">
                <p className="text-white font-semibold text-center">Compara autoescuelas en tu ciudad</p>
                <p className="text-yellow-100 text-xs text-center mt-0.5">Gratis · Sin compromiso · Hasta 3 presupuestos</p>
              </div>
              <div className="p-1">
                <LeadForm defaultCarnet="AM" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 mb-8 text-center">Cómo obtener el carnet AM paso a paso</h2>
          <div className="grid sm:grid-cols-4 gap-5">
            {PASOS.map((p, i) => {
              const Icon = p.icon
              return (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{p.titulo}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Vehículos permitidos */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 mb-5">¿Qué vehículos puedes conducir con el permiso AM?</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-yellow-500 text-white">
                <tr>
                  <th className="text-left px-5 py-3">Tipo de vehículo</th>
                  <th className="text-left px-5 py-3">Cilindrada / Potencia</th>
                  <th className="text-left px-5 py-3">Velocidad máx.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {VEHICULOS.map((v) => (
                  <tr key={v.tipo} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-800 font-medium">{v.tipo}</td>
                    <td className="px-5 py-3 text-gray-600">{v.cc}</td>
                    <td className="px-5 py-3 text-gray-600">{v.vel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQSection faqs={FAQS} title="Preguntas frecuentes sobre el carnet de ciclomotor" />
        </div>
      </section>
    </>
  )
}
