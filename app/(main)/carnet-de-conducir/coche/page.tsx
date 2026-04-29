import { type Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import LeadForm from '@/components/forms/LeadForm'
import FAQSection from '@/components/seo/FAQSection'
import Link from 'next/link'
import { CheckCircle, Clock, Euro, Car, AlertCircle, BookOpen } from 'lucide-react'

export const metadata: Metadata = buildMetadata({
  title: 'Carnet de Coche (Permiso B) 2025 — Precio, Requisitos y Cómo Sacarlo',
  description:
    'Todo sobre el carnet de conducir de coche (permiso B): precio medio, requisitos, edad mínima, exámenes DGT y cómo sacarlo más rápido. Compara autoescuelas y ahorra.',
  canonical: '/carnet-de-conducir/coche',
})

const REQUISITOS = [
  { ok: true,  text: 'Edad mínima: 18 años (17 con PAM, Práctica Acompañada de Menores)' },
  { ok: true,  text: 'DNI, NIE o pasaporte en vigor' },
  { ok: true,  text: 'Apto en reconocimiento médico-psicotécnico' },
  { ok: true,  text: 'Superar el examen teórico DGT (30 preguntas, máx. 3 fallos)' },
  { ok: true,  text: 'Mínimo 3 horas de prácticas homologadas (media real: 20–30 h)' },
  { ok: true,  text: 'Superar el examen práctico DGT' },
]

const EXAMENES = [
  { titulo: 'Examen teórico', detalle: '30 preguntas tipo test. 3 fallos como máximo. Coste: ~10 € por intento (tasas DGT).' },
  { titulo: 'Examen práctico', detalle: '35–40 minutos en circuito abierto con examinador. Puntuación de 0 a 10. Aprobado: 5 o más.' },
]

const PRECIOS = [
  { concepto: 'Matrícula + apertura de expediente', rango: '50 – 150 €' },
  { concepto: 'Reconocimiento médico-psicotécnico', rango: '30 – 50 €' },
  { concepto: 'Tasas DGT (teórico + práctico)', rango: '60 – 120 €' },
  { concepto: 'Clases teóricas (30 h aprox.)', rango: 'Incluido o 0 – 100 €' },
  { concepto: 'Clases prácticas (20–30 h × 30–45 €/h)', rango: '600 – 1.350 €' },
  { concepto: 'TOTAL ESTIMADO', rango: '800 – 1.800 €' },
]

const FAQS = [
  {
    pregunta: '¿Cuánto cuesta el carnet de coche en 2025?',
    respuesta: 'El precio medio del permiso B en España es de 1.100–1.300 € para un alumno que necesita 25 horas de prácticas. En ciudades grandes (Madrid, Barcelona) el coste puede superar los 1.500 €. En ciudades medianas puedes conseguirlo por 800–1.000 €.',
  },
  {
    pregunta: '¿Cuántos fallos se pueden tener en el examen teórico del carnet B?',
    respuesta: 'Solo 3 fallos. El examen tiene 30 preguntas y debes responder correctamente al menos 27. Cada error tiene un peso distinto según el tipo de pregunta.',
  },
  {
    pregunta: '¿Cuántas horas de prácticas necesito para el carnet de coche?',
    respuesta: 'La ley establece un mínimo de 3 horas, pero en la práctica la media está entre 20 y 35 horas. Depende de si tienes experiencia previa y de la frecuencia con la que practiques.',
  },
  {
    pregunta: '¿Se puede hacer el carnet de coche con 17 años?',
    respuesta: 'Sí, mediante el sistema PAM (Práctica Acompañada de Menores) en provincias donde está disponible. Puedes empezar las clases prácticas a partir de los 17 años con un adulto habilitado, aunque no podrás conducir solo hasta cumplir los 18.',
  },
  {
    pregunta: '¿El permiso B tiene periodo de prueba?',
    respuesta: 'Sí. Los primeros 2 años tras obtener el carnet se aplica el "permiso en prácticas": arrancas con 8 puntos en lugar de 12, y algunos límites son más restrictivos (p. ej. 0,0 g/l de alcohol para menores de 18 años).',
  },
  {
    pregunta: '¿Qué vehículos me permite conducir el carnet B?',
    respuesta: 'Turismos y furgonetas de hasta 3.500 kg de MMA y hasta 8 plazas (más el conductor). También puedes arrastrar remolques hasta 750 kg. Con formación adicional (código 96) puedes arrastrar remolques de hasta 3.500 kg.',
  },
]

export default function CarnetCochePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <Link href="/carnet-de-conducir" className="text-blue-200 text-sm hover:text-white mb-3 inline-flex items-center gap-1">
                ← Todos los tipos de carnet
              </Link>
              <div className="inline-flex items-center gap-2 bg-blue-500/40 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Car className="w-4 h-4" /> Permiso B — El más solicitado
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
                Carnet de Coche{' '}
                <span className="text-yellow-300 block">Permiso B</span>
              </h1>
              <p className="text-blue-100 text-lg mb-6 leading-relaxed">
                El carnet de conducir más popular en España. Te permite conducir turismos, SUVs y furgonetas ligeras. Guía completa con precios, requisitos y cómo aprobarlo a la primera.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-white/15 rounded-full px-4 py-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 3–6 meses</span>
                <span className="bg-white/15 rounded-full px-4 py-1.5 flex items-center gap-1.5"><Euro className="w-3.5 h-3.5" /> 800–1.800 €</span>
                <span className="bg-white/15 rounded-full px-4 py-1.5 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-300" /> +18 años</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-blue-700 px-6 py-4">
                <p className="text-white font-semibold text-center">Compara autoescuelas en tu ciudad</p>
                <p className="text-blue-200 text-xs text-center mt-0.5">Gratis · Sin compromiso · Hasta 3 presupuestos</p>
              </div>
              <div className="p-1">
                <LeadForm defaultCarnet="B" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requisitos */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Requisitos para el Permiso B</h2>
          <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
            {REQUISITOS.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exámenes */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Los exámenes DGT del carnet de coche</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {EXAMENES.map((e, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">{e.titulo}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{e.detalle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Precios */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 mb-2">¿Cuánto cuesta el carnet de coche en 2025?</h2>
          <p className="text-gray-500 mb-6 text-sm">Desglose de los costes habituales para un alumno estándar (25 h de prácticas).</p>
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Concepto</th>
                  <th className="text-right px-5 py-3 font-semibold">Rango de precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {PRECIOS.map((p, i) => (
                  <tr key={i} className={i === PRECIOS.length - 1 ? 'bg-blue-50 font-bold' : 'hover:bg-gray-50'}>
                    <td className="px-5 py-3 text-gray-800">{p.concepto}</td>
                    <td className="px-5 py-3 text-right text-gray-700">{p.rango}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl p-4 border border-amber-200">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>El mayor factor de variación es el número de horas de práctica. Cada hora de prácticas cuesta entre 30 y 45 €. Una buena autoescuela puede reducir las horas necesarias.</p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQSection faqs={FAQS} title="Preguntas frecuentes sobre el carnet de coche" />
        </div>
      </section>

      {/* CTA final */}
      <section className="py-12 bg-blue-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black mb-2">Empieza hoy — Compara autoescuelas gratis</h2>
          <p className="text-blue-100 mb-6">Rellena el formulario y recibe hasta 3 presupuestos personalizados de autoescuelas en tu ciudad.</p>
          <Link href="#" className="bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors inline-block">
            Comparar autoescuelas →
          </Link>
        </div>
      </section>
    </>
  )
}
