import { type Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import LeadForm from '@/components/forms/LeadForm'
import FAQSection from '@/components/seo/FAQSection'
import Link from 'next/link'
import { CheckCircle, Clock, Euro, Truck, Briefcase } from 'lucide-react'

export const metadata: Metadata = buildMetadata({
  title: 'Carnet de Camión (Permiso C y C1) 2025 — Precio y Requisitos',
  description:
    'Guía del carnet de camión en España (permiso C y C1): precio, edad mínima, requisitos, exámenes y salidas laborales. Compara autoescuelas de CAP y camión.',
  canonical: '/carnet-de-conducir/camion',
})

const DIFERENCIAS = [
  { permiso: 'C1', desc: 'Vehículos de entre 3.500 kg y 7.500 kg de MMA. Ideal para furgones grandes, camionetas de reparto pesadas y ambulancias.', edad: '18 años', precio: '1.200–2.000 €' },
  { permiso: 'C',  desc: 'Vehículos de más de 3.500 kg sin límite de tonelaje. Incluye camiones de transporte de mercancías, mudanzas, maquinaria pesada.', edad: '21 años (18 con CPC)', precio: '1.500–3.000 €' },
]

const FAQS = [
  {
    pregunta: '¿Qué diferencia hay entre el carnet C y el C1?',
    respuesta: 'El C1 es para vehículos de entre 3.500 y 7.500 kg (furgones grandes, camionetas pesadas). El C no tiene límite superior de tonelaje y permite conducir cualquier camión. Para el transporte profesional de mercancías, necesitas el C más el CAP (Certificado de Aptitud Profesional).',
  },
  {
    pregunta: '¿Con qué edad se puede sacar el carnet de camión?',
    respuesta: 'El C1 se puede obtener desde los 18 años. El C requiere 21 años, aunque con el CPC inicial (formación profesional de conductor) puedes acceder a los 18 años.',
  },
  {
    pregunta: '¿Qué es el CAP y es obligatorio para camioneros?',
    respuesta: 'El Certificado de Aptitud Profesional (CAP) es obligatorio para el transporte profesional de mercancías (permiso C) y de viajeros (permiso D). No es necesario para uso privado. Se renueva cada 5 años con 35 horas de formación continua.',
  },
  {
    pregunta: '¿Cuánto gana un camionero en España?',
    respuesta: 'El salario medio de un camionero en España es de 25.000–35.000 € brutos anuales. Los conductores internacionales o de mercancías peligrosas (ADR) pueden superar los 40.000 €. La demanda de camioneros es muy alta actualmente.',
  },
  {
    pregunta: '¿Puedo financiar el carnet de camión?',
    respuesta: 'Sí. Muchas autoescuelas ofrecen financiación propia o acuerdos con empresas de transporte que pagan el carnet a cambio de un contrato de trabajo. También existen ayudas del SEPE para desempleados que quieren obtener el carnet C.',
  },
]

export default function CarnetCamionPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <Link href="/carnet-de-conducir" className="text-green-200 text-sm hover:text-white mb-3 inline-flex items-center gap-1">
                ← Todos los tipos de carnet
              </Link>
              <div className="inline-flex items-center gap-2 bg-green-500/40 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Truck className="w-4 h-4" /> Permisos C1 · C
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
                Carnet de Camión<br />
                <span className="text-yellow-300">Permiso C y C1</span>
              </h1>
              <p className="text-green-100 text-lg mb-6 leading-relaxed">
                El carnet más demandado por el sector del transporte y la logística. Alta inserción laboral y posibilidad de financiación por la empresa. Guía actualizada 2025.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-white/15 rounded-full px-4 py-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 2–4 meses</span>
                <span className="bg-white/15 rounded-full px-4 py-1.5 flex items-center gap-1.5"><Euro className="w-3.5 h-3.5" /> Desde 1.500 €</span>
                <span className="bg-white/15 rounded-full px-4 py-1.5 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-yellow-300" /> Alta demanda laboral</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-green-700 px-6 py-4">
                <p className="text-white font-semibold text-center">Compara autoescuelas de camión</p>
                <p className="text-green-200 text-xs text-center mt-0.5">Gratis · Sin compromiso · Hasta 3 presupuestos</p>
              </div>
              <div className="p-1">
                <LeadForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diferencias C / C1 */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Permiso C vs Permiso C1: diferencias clave</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {DIFERENCIAS.map((d) => (
              <div key={d.permiso} className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <div className="text-3xl font-black text-green-600 mb-2">Permiso {d.permiso}</div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{d.desc}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Edad mín.: <strong className="text-gray-800">{d.edad}</strong></span>
                  <span className="text-green-600 font-semibold">{d.precio}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
            <p><strong>Necesario para trabajar:</strong> Si quieres conducir camiones de forma profesional también necesitas el <strong>CAP</strong> (Certificado de Aptitud Profesional). Muchas autoescuelas ofrecen el C + CAP en un solo paquete.</p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQSection faqs={FAQS} title="Preguntas frecuentes sobre el carnet de camión" />
        </div>
      </section>
    </>
  )
}
