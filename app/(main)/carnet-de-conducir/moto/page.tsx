import { type Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import LeadForm from '@/components/forms/LeadForm'
import FAQSection from '@/components/seo/FAQSection'
import Link from 'next/link'
import { CheckCircle, Clock, Euro, Bike, AlertCircle } from 'lucide-react'

export const metadata: Metadata = buildMetadata({
  title: 'Carnet de Moto 2025 — AM, A1, A2 y A: Precios y Requisitos',
  description:
    'Guía completa de los carnets de moto en España (AM, A1, A2 y A): precios, edades mínimas, diferencias entre permisos y cómo obtenerlos más rápido.',
  canonical: '/carnet-de-conducir/moto',
})

const PERMISOS = [
  { permiso: 'AM', nombre: 'Ciclomotor', edad: '15 años', cc: 'Hasta 50 cc', velocidad: 'Hasta 45 km/h', precio: '150–350 €', href: '/carnet-de-conducir/ciclomotor' },
  { permiso: 'A1', nombre: 'Moto ligera', edad: '16 años', cc: 'Hasta 125 cc', velocidad: 'Sin límite', precio: '400–700 €', href: '#' },
  { permiso: 'A2', nombre: 'Moto mediana', edad: '18 años', cc: 'Hasta 35 kW (47 CV)', velocidad: 'Sin límite', precio: '600–900 €', href: '#' },
  { permiso: 'A',  nombre: 'Moto sin límite', edad: '24 años (20 con A2 2 años)', cc: 'Sin límite', velocidad: 'Sin límite', precio: '700–1.100 €', href: '#' },
]

const FAQS = [
  {
    pregunta: '¿Cuál es la diferencia entre el carnet A1, A2 y A?',
    respuesta: 'El A1 permite motos hasta 125 cc (desde los 16 años). El A2 amplía hasta 35 kW/47 CV (desde los 18 años). El A permite cualquier moto sin límite (desde los 24 años, o 20 si tienes el A2 desde hace 2 años). Cada uno habilita vehículos más potentes.',
  },
  {
    pregunta: '¿Puedo ir directamente al carnet A sin pasar por A1 o A2?',
    respuesta: 'Sí, puedes obtener el permiso A directamente desde los 24 años sin necesidad de haber tenido antes el A1 o A2. Si ya tienes el A2 con 2 años de antigüedad, puedes acceder al A con solo 20 años.',
  },
  {
    pregunta: '¿Con el carnet de coche (B) puedo conducir motos?',
    respuesta: 'Con el permiso B puedes conducir motos de hasta 125 cc, pero solo si llevas más de 3 años con el B y completas una formación específica de 7 horas (código A1 restringido). Para motos más potentes necesitas el carnet A correspondiente.',
  },
  {
    pregunta: '¿Cuánto cuesta el carnet de moto A2?',
    respuesta: 'El carnet A2 cuesta entre 600 € y 900 € de media en España. Incluye la matrícula, clases teóricas, maniobras en circuito cerrado, examen de circulación y tasas DGT. Si ya tienes el A1, el precio puede reducirse a 300–500 € por la formación diferencial.',
  },
  {
    pregunta: '¿Es difícil el examen práctico de moto?',
    respuesta: 'El examen práctico de moto tiene dos partes: maniobras en circuito cerrado (slalom, doble dirección, frenada de emergencia…) y circulación en vías abiertas. Las maniobras suelen ser la parte más difícil. Con buena preparación se aprueba sin problema.',
  },
]

export default function CarnetMotoPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-orange-600 to-orange-800 text-white py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <Link href="/carnet-de-conducir" className="text-orange-200 text-sm hover:text-white mb-3 inline-flex items-center gap-1">
                ← Todos los tipos de carnet
              </Link>
              <div className="inline-flex items-center gap-2 bg-orange-500/40 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Bike className="w-4 h-4" /> Permisos AM · A1 · A2 · A
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
                Carnet de Moto{' '}
                <span className="text-yellow-300 block">Todos los permisos</span>
              </h1>
              <p className="text-orange-100 text-lg mb-6 leading-relaxed">
                Desde el ciclomotor (AM) hasta la moto sin límites (A). Descubre qué permiso necesitas, a qué edad puedes obtenerlo y cuánto te costará en 2025.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-white/15 rounded-full px-4 py-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 1–3 meses</span>
                <span className="bg-white/15 rounded-full px-4 py-1.5 flex items-center gap-1.5"><Euro className="w-3.5 h-3.5" /> Desde 150 €</span>
                <span className="bg-white/15 rounded-full px-4 py-1.5 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-300" /> Desde 15 años</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-orange-600 px-6 py-4">
                <p className="text-white font-semibold text-center">Compara autoescuelas de moto</p>
                <p className="text-orange-200 text-xs text-center mt-0.5">Gratis · Sin compromiso · Hasta 3 presupuestos</p>
              </div>
              <div className="p-1">
                <LeadForm defaultCarnet="A" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabla de permisos */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Tipos de carnet de moto en España</h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-orange-600 text-white">
                <tr>
                  <th className="text-left px-5 py-3">Permiso</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">Vehículos</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Velocidad</th>
                  <th className="text-left px-5 py-3">Edad mín.</th>
                  <th className="text-right px-5 py-3">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {PERMISOS.map((p) => (
                  <tr key={p.permiso} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <span className="font-bold text-orange-600 mr-1">{p.permiso}</span>
                      <span className="text-gray-700">{p.nombre}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{p.cc}</td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{p.velocidad}</td>
                    <td className="px-5 py-3 text-gray-700">{p.edad}</td>
                    <td className="px-5 py-3 text-right font-semibold text-green-600">{p.precio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-start gap-2 text-sm text-blue-700 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Si ya tienes un permiso inferior, puedes acceder al siguiente con formación diferencial (menos horas y más barato). Por ejemplo: de A1 a A2 o de A2 a A.</p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQSection faqs={FAQS} title="Preguntas frecuentes sobre el carnet de moto" />
        </div>
      </section>
    </>
  )
}
