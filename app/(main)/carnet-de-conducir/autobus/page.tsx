import { type Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import LeadForm from '@/components/forms/LeadForm'
import FAQSection from '@/components/seo/FAQSection'
import Link from 'next/link'
import { CheckCircle, Clock, Euro, Bus } from 'lucide-react'

export const metadata: Metadata = buildMetadata({
  title: 'Carnet de Autobús (Permiso D y D1) 2025 — Precio y Requisitos',
  description:
    'Guía del carnet de autobús en España (permiso D y D1): requisitos, precio, edad mínima y cómo obtenerlo para conducir autobuses y minibuses de forma profesional.',
  canonical: '/carnet-de-conducir/autobus',
})

const FAQS = [
  {
    pregunta: '¿Qué diferencia hay entre el carnet D y el D1?',
    respuesta: 'El D1 es para minibuses de entre 8 y 16 plazas (microbuses, ambulancias grandes, furgonetas de pasajeros). El D no tiene límite de plazas y es el que se necesita para autobuses urbanos, interurbanos y autocares.',
  },
  {
    pregunta: '¿Con qué edad puedo sacar el carnet de autobús?',
    respuesta: 'El D1 requiere 21 años. El D requiere 24 años, aunque con el CPC inicial (formación profesional) puedes acceder a los 21 años. Además debes tener el permiso B en vigor.',
  },
  {
    pregunta: '¿Es necesario el CAP para conducir autobuses?',
    respuesta: 'Sí, el CAP (Certificado de Aptitud Profesional) es obligatorio para el transporte profesional de viajeros. Se obtiene con una formación inicial de 280 horas (o 140 h si ya tienes otro CAP) y se renueva cada 5 años con 35 horas de formación continua.',
  },
  {
    pregunta: '¿Cuánto gana un conductor de autobús en España?',
    respuesta: 'El salario medio de un conductor de autobús urbano en España es de 22.000–28.000 € brutos anuales. Los conductores de autocar turístico o internacional pueden ganar más, especialmente con complementos por dietas y kilometraje.',
  },
  {
    pregunta: '¿Hay demanda de conductores de autobús en España?',
    respuesta: 'Sí, existe una alta demanda de conductores de autobús, especialmente en grandes ciudades y empresas de transporte urbano. EMT Madrid, TMB Barcelona y otras empresas públicas realizan oposiciones regularmente.',
  },
]

export default function CarnetAutobusPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-purple-700 to-purple-900 text-white py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <Link href="/carnet-de-conducir" className="text-purple-200 text-sm hover:text-white mb-3 inline-flex items-center gap-1">
                ← Todos los tipos de carnet
              </Link>
              <div className="inline-flex items-center gap-2 bg-purple-500/40 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Bus className="w-4 h-4" /> Permisos D1 · D
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
                Carnet de Autobús{' '}
                <span className="text-yellow-300 block">Permiso D y D1</span>
              </h1>
              <p className="text-purple-100 text-lg mb-6 leading-relaxed">
                Para conducir autobuses urbanos, autocares y minibuses de forma profesional. Alta demanda laboral y estabilidad. Todo lo que necesitas saber en 2025.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-white/15 rounded-full px-4 py-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 3–5 meses</span>
                <span className="bg-white/15 rounded-full px-4 py-1.5 flex items-center gap-1.5"><Euro className="w-3.5 h-3.5" /> Desde 2.000 €</span>
                <span className="bg-white/15 rounded-full px-4 py-1.5 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-300" /> +21 años (D1)</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-purple-700 px-6 py-4">
                <p className="text-white font-semibold text-center">Compara autoescuelas para carnet D</p>
                <p className="text-purple-200 text-xs text-center mt-0.5">Gratis · Sin compromiso · Hasta 3 presupuestos</p>
              </div>
              <div className="p-1">
                <LeadForm defaultCarnet="D" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requisitos */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Requisitos para el Permiso D (autobús)</h2>
          <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
            {[
              'Tener el Permiso B en vigor',
              'Edad mínima: 21 años para el D1 / 24 años para el D',
              'Apto en reconocimiento médico-psicotécnico',
              'Superar el examen teórico DGT específico para el D',
              'Mínimo 5 horas de prácticas en autobús (media real: 20–30 h)',
              'Superar el examen práctico DGT',
              'Para uso profesional: CAP (Certificado de Aptitud Profesional)',
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQSection faqs={FAQS} title="Preguntas frecuentes sobre el carnet de autobús" />
        </div>
      </section>
    </>
  )
}
