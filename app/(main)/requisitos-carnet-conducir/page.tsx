import { type Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { CheckCircle, ArrowRight } from 'lucide-react'
import FAQSection from '@/components/seo/FAQSection'

export const metadata: Metadata = buildMetadata({
  title: 'Requisitos para el carnet de conducir en España 2025',
  description:
    'Todos los requisitos para sacar el carnet de conducir en España: edad mínima, documentación, reconocimiento médico, proceso paso a paso y costes.',
  canonical: '/requisitos-carnet-conducir',
})

export default function RequisitosPage() {
  return (
    <>
      <section className="bg-brand-700 text-white py-12">
        <div className="container-main max-w-4xl">
          <h1 className="text-4xl font-black mb-4">
            Requisitos para el carnet de conducir en España
          </h1>
          <p className="text-blue-100 text-xl">
            Todo lo que necesitas saber antes de matricularte en una autoescuela. Actualizado {new Date().getFullYear()}.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container-main max-w-4xl space-y-10">

          {/* Edad mínima */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edad mínima para cada tipo de carnet</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 font-semibold text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3">Permiso</th>
                    <th className="text-left px-4 py-3">Tipo de vehículo</th>
                    <th className="text-center px-4 py-3">Edad mínima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { permiso: 'AM', tipo: 'Ciclomotores y cuatriciclos ligeros', edad: '15 años' },
                    { permiso: 'A1', tipo: 'Motos hasta 125cc', edad: '16 años' },
                    { permiso: 'B', tipo: 'Coches y furgonetas hasta 3.500kg', edad: '18 años (17 con acompañante)' },
                    { permiso: 'A2', tipo: 'Motos hasta 35kW (≈47cv)', edad: '18 años' },
                    { permiso: 'A', tipo: 'Todas las motocicletas', edad: '20 años (con A2 2 años)' },
                    { permiso: 'C', tipo: 'Camiones y vehículos pesados', edad: '21 años' },
                    { permiso: 'D', tipo: 'Autobuses y transporte de viajeros', edad: '24 años' },
                  ].map((row) => (
                    <tr key={row.permiso} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-brand-600">{row.permiso}</td>
                      <td className="px-4 py-3 text-gray-700">{row.tipo}</td>
                      <td className="px-4 py-3 text-center font-medium">{row.edad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Documentación */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Documentación necesaria</h2>
            <div className="space-y-2">
              {[
                'DNI o NIE en vigor',
                'Fotografía reciente en color (formato carnet)',
                'Certificado de aptitud psicofísica (reconocimiento médico en centro autorizado)',
                'Impreso de solicitud del permiso (lo gestiona la autoescuela)',
                'Justificante del pago de tasas de la DGT',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Proceso */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Proceso paso a paso</h2>
            <div className="space-y-4">
              {[
                { step: '01', title: 'Elegir autoescuela', desc: 'Compara precios, valoraciones y horarios. Solicita presupuesto gratuito en CarnetYa.' },
                { step: '02', title: 'Reconocimiento médico', desc: 'Acude a un centro de reconocimiento de conductores autorizado por la DGT. Coste: 30-45€. Te darán el informe de aptitud.' },
                { step: '03', title: 'Matricularte en la autoescuela', desc: 'Con tu DNI y el informe médico. La autoescuela tramitará tu expediente en la DGT.' },
                { step: '04', title: 'Estudiar el teórico', desc: 'Clases presenciales u online + práctica con app de test DGT. Tiempo estimado: 2-6 semanas.' },
                { step: '05', title: 'Examen teórico', desc: '30 preguntas con 3 fallos máximos (Permiso B). Si apruebas, puedes comenzar las prácticas.' },
                { step: '06', title: 'Clases prácticas', desc: 'Mínimo de clases según la autoescuela. Tiempo medio hasta estar listo: 2-4 meses.' },
                { step: '07', title: 'Examen práctico', desc: 'Con un examinador de la DGT en un circuito real. Si apruebas, ¡ya tienes el carnet!' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {step}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-brand-600 text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">¿Listo para empezar?</h2>
            <p className="text-blue-100 mb-6">Compara autoescuelas y recibe presupuestos gratis en 2 minutos</p>
            <Link href="/comparar" className="inline-flex items-center gap-2 bg-cta hover:bg-cta-hover text-white font-bold px-8 py-3 rounded-xl transition-colors">
              Comparar autoescuelas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <FAQSection
            faqs={[
              {
                pregunta: '¿Se puede sacar el carnet de coche con 17 años?',
                respuesta: 'Sí, en España puedes obtener el Permiso B a los 17 años mediante la modalidad "Conducción Acompañada" (CAA), que te permite conducir con un acompañante mayor de 25 años con al menos 3 años de antigüedad del permiso. Al cumplir 18 años, el permiso se convierte en definitivo después de un curso breve.',
              },
              {
                pregunta: '¿Cuánto cuesta el reconocimiento médico?',
                respuesta: 'El reconocimiento médico en un centro autorizado por la DGT cuesta entre 30€ y 45€. Es un trámite rápido (unos 20 minutos) donde comprueban tu visión, audición y aptitudes psicomotrices. Necesitas el informe para matricularte en la autoescuela.',
              },
              {
                pregunta: '¿Qué pasa si suspendo el examen teórico?',
                respuesta: 'Si suspendes el examen teórico de la DGT, puedes volverte a presentar pagando de nuevo las tasas (46,54€). No hay límite de intentos. La mayoría de autoescuelas cobran un suplemento por la gestión del segundo o tercer intento.',
              },
            ]}
          />
        </div>
      </section>
    </>
  )
}
