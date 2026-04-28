import Link from 'next/link'
import { type Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import LeadForm from '@/components/forms/LeadForm'
import FAQSection from '@/components/seo/FAQSection'
import {
  Car, Bike, Truck, Bus, Zap, ChevronRight,
  CheckCircle, Clock, Euro, BookOpen, FileText, Shield,
} from 'lucide-react'

export const metadata: Metadata = buildMetadata({
  title: 'Carnet de Conducir en España 2025 — Tipos, Precios y Requisitos',
  description:
    'Guía completa del carnet de conducir en España: tipos (B, A, C, D, AM), precios actualizados, requisitos y cómo sacarlo rápido. Compara autoescuelas y ahorra hasta un 30%.',
  canonical: '/carnet-de-conducir',
})

const TIPOS = [
  {
    href: '/carnet-de-conducir/coche',
    icon: Car,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    badge: 'El más solicitado',
    badgeColor: 'bg-blue-100 text-blue-700',
    permiso: 'Permiso B',
    nombre: 'Carnet de Coche',
    desc: 'Para vehículos de hasta 3.500 kg y 8 plazas. El carnet más común en España.',
    precio: 'Desde 800 €',
    edad: '18 años',
  },
  {
    href: '/carnet-de-conducir/moto',
    icon: Bike,
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    badge: 'Incluye A1 y A2',
    badgeColor: 'bg-orange-100 text-orange-700',
    permiso: 'Permiso A',
    nombre: 'Carnet de Moto',
    desc: 'Permisos AM, A1, A2 y A para cualquier tipo de motocicleta.',
    precio: 'Desde 400 €',
    edad: '14–24 años',
  },
  {
    href: '/carnet-de-conducir/camion',
    icon: Truck,
    color: 'bg-green-50 text-green-600 border-green-100',
    badge: 'Salidas laborales',
    badgeColor: 'bg-green-100 text-green-700',
    permiso: 'Permiso C',
    nombre: 'Carnet de Camión',
    desc: 'Para vehículos de más de 3.500 kg. Imprescindible para el sector logístico.',
    precio: 'Desde 1.500 €',
    edad: '21 años',
  },
  {
    href: '/carnet-de-conducir/autobus',
    icon: Bus,
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    badge: 'Alta demanda',
    badgeColor: 'bg-purple-100 text-purple-700',
    permiso: 'Permiso D',
    nombre: 'Carnet de Autobús',
    desc: 'Para autobuses de más de 8 plazas. Necesario para conducción profesional.',
    precio: 'Desde 2.000 €',
    edad: '24 años',
  },
  {
    href: '/carnet-de-conducir/ciclomotor',
    icon: Zap,
    color: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    badge: 'Sin examen práctico',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    permiso: 'Permiso AM',
    nombre: 'Carnet de Ciclomotor',
    desc: 'Para ciclomotores y quads ligeros de hasta 50 cc. El más fácil de obtener.',
    precio: 'Desde 150 €',
    edad: '15 años',
  },
]

const PASOS = [
  { icon: BookOpen, title: 'Estudia el temario', desc: 'Aprende el Código de Circulación con test oficiales de la DGT. Necesitas al menos 30 clases teóricas.' },
  { icon: FileText, title: 'Supera el examen teórico', desc: 'Test de 30 preguntas en los exámenes DGT. Máximo 3 fallos. Puedes repetirlo si suspendes.' },
  { icon: Car, title: 'Clases prácticas', desc: 'Mínimo 3 horas en autoescuela homologada. La media en España es de 25–30 horas de prácticas.' },
  { icon: CheckCircle, title: 'Examen práctico DGT', desc: 'Circuito con exameniador oficial. Si apruebas, obtienes el permiso provisional en el momento.' },
]

const FAQS = [
  {
    pregunta: '¿Cuánto tarda en total sacarse el carnet de conducir?',
    respuesta: 'De media entre 3 y 6 meses. Depende de la frecuencia de clases y de cuántos intentos necesites en los exámenes. Yendo a full gas (clases 3 veces por semana) puedes lograrlo en menos de 3 meses.',
  },
  {
    pregunta: '¿Cuál es el precio medio del carnet de conducir en España?',
    respuesta: 'El carnet de coche (permiso B) cuesta entre 800 € y 1.800 € en 2025 dependiendo de la ciudad y la autoescuela. La mayor diferencia está en el precio por hora de prácticas (entre 25 € y 45 €/hora) y en cuántas clases necesites.',
  },
  {
    pregunta: '¿Qué documentos necesito para matricularme en una autoescuela?',
    respuesta: 'DNI o NIE en vigor, 1 foto de carné reciente, informe de aptitud médica (lo tramita la propia autoescuela o clínicas autorizadas) y el pago de la matrícula. En algunos casos también el permiso paterno si eres menor de edad.',
  },
  {
    pregunta: '¿Puedo empezar a conducir mientras tramito el carnet?',
    respuesta: 'No puedes conducir solo, pero sí puedes hacer prácticas acompañado (PAM) con una persona habilitada. Esto está disponible en algunas provincias y permite coger experiencia antes del examen práctico.',
  },
  {
    pregunta: '¿Cuántas veces puedo repetir el examen teórico?',
    respuesta: 'Las veces que necesites. No hay límite legal de intentos. Cada intento tiene un coste de unos 10 € (tasas DGT). Lo más habitual es aprobar al segundo o tercer intento si no se estudia suficiente.',
  },
  {
    pregunta: '¿Con el carnet B puedo conducir una furgoneta o una autocaravana?',
    respuesta: 'Sí, el permiso B te permite conducir vehículos de hasta 3.500 kg de MMA con hasta 8 plazas + conductor. Las furgonetas de reparto estándar y autocaravanas ligeras entran en esta categoría.',
  },
]

export default function CarnetConducirPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <CheckCircle className="w-4 h-4 text-green-300" />
                Guía actualizada 2025
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
                Carnet de Conducir<br />
                <span className="text-yellow-300">en España</span>
              </h1>
              <p className="text-blue-100 text-lg mb-6 leading-relaxed">
                Tipos, precios actualizados, requisitos y cómo obtenerlo paso a paso. Compara autoescuelas y consigue el mejor precio sin moverte del sofá.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-white/15 rounded-full px-4 py-1.5">⏱ Media: 3–6 meses</span>
                <span className="bg-white/15 rounded-full px-4 py-1.5">💰 Desde 800 €</span>
                <span className="bg-white/15 rounded-full px-4 py-1.5">📋 5 tipos de permiso</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-blue-700 px-6 py-4">
                <p className="text-white font-semibold text-center">Recibe presupuestos gratis de autoescuelas</p>
              </div>
              <div className="p-1">
                <LeadForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tipos de carnet ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Tipos de carnet de conducir en España</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Elige el permiso que necesitas y descubre todos los requisitos, precios y cómo prepararte para aprobar a la primera.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TIPOS.map((t) => {
              const Icon = t.icon
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`relative group rounded-2xl border-2 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${t.color}`}
                >
                  <span className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full ${t.badgeColor}`}>
                    {t.badge}
                  </span>
                  <Icon className="w-10 h-10 mb-4 opacity-80" />
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">{t.permiso}</p>
                  <h3 className="text-xl font-black text-gray-900 mb-2">{t.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{t.desc}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-bold text-gray-900">{t.precio}</span>
                      <span className="text-gray-400 ml-2">· +{t.edad}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Pasos ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Cómo sacarse el carnet paso a paso</h2>
            <p className="text-gray-500">El proceso es el mismo para casi todos los permisos</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PASOS.map((p, i) => {
              const Icon = p.icon
              return (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Paso {i + 1}</span>
                  <h3 className="font-bold text-gray-900 mt-1 mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Tabla comparativa de precios ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-gray-900 mb-3 text-center">Precios del carnet de conducir en 2025</h2>
          <p className="text-center text-gray-500 mb-8">Precios orientativos. El coste exacto varía según la autoescuela y las horas de práctica necesarias.</p>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Permiso</th>
                  <th className="text-left px-6 py-4 font-semibold">Precio mín.</th>
                  <th className="text-left px-6 py-4 font-semibold">Precio máx.</th>
                  <th className="text-left px-6 py-4 font-semibold hidden sm:table-cell">Edad mín.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { p: 'AM — Ciclomotor', min: '150 €', max: '350 €', edad: '15 años', href: '/carnet-de-conducir/ciclomotor' },
                  { p: 'A1 — Moto pequeña', min: '400 €', max: '700 €', edad: '16 años', href: '/carnet-de-conducir/moto' },
                  { p: 'A2 — Moto mediana', min: '600 €', max: '900 €', edad: '18 años', href: '/carnet-de-conducir/moto' },
                  { p: 'A — Moto grande', min: '700 €', max: '1.100 €', edad: '20 años', href: '/carnet-de-conducir/moto' },
                  { p: 'B — Coche (el más común)', min: '800 €', max: '1.800 €', edad: '18 años', href: '/carnet-de-conducir/coche' },
                  { p: 'C — Camión', min: '1.500 €', max: '3.000 €', edad: '21 años', href: '/carnet-de-conducir/camion' },
                  { p: 'D — Autobús', min: '2.000 €', max: '3.500 €', edad: '24 años', href: '/carnet-de-conducir/autobus' },
                ].map((row) => (
                  <tr key={row.p} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      <Link href={row.href} className="hover:text-blue-600 hover:underline">{row.p}</Link>
                    </td>
                    <td className="px-6 py-3 text-green-600 font-semibold">{row.min}</td>
                    <td className="px-6 py-3 text-gray-500">{row.max}</td>
                    <td className="px-6 py-3 text-gray-500 hidden sm:table-cell">{row.edad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-center text-gray-400 mt-3">
            * Precios medios de autoescuelas en España (2025). Incluyen matrícula, clases teóricas, prácticas y tasas DGT para un alumno sin experiencia previa.
          </p>
        </div>
      </section>

      {/* ── CTA medio ── */}
      <section className="py-12 bg-blue-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Ahorra hasta un 30% eligiendo bien la autoescuela
          </h2>
          <p className="text-blue-100 mb-6">Compara precios y opiniones de autoescuelas en tu ciudad. Gratis y sin compromiso.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {['Madrid', 'Barcelona', 'Valencia', 'Sevilla'].map((c) => (
              <Link
                key={c}
                href={`/autoescuelas/${c.toLowerCase()}`}
                className="bg-white text-blue-700 font-bold px-5 py-2.5 rounded-full hover:bg-yellow-300 transition-colors text-sm"
              >
                Autoescuelas en {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQSection faqs={FAQS} title="Preguntas frecuentes sobre el carnet de conducir" />
        </div>
      </section>

      {/* ── Artículos relacionados ── */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Más guías de CarnetYa</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { href: '/cuanto-cuesta-carnet-conducir', title: '¿Cuánto cuesta el carnet de conducir?', desc: 'Desglose completo de precios por ciudad y autoescuela.' },
              { href: '/cuanto-tarda-sacarse-carnet', title: '¿Cuánto tarda sacarse el carnet?', desc: 'Plazos reales según tu dedicación y disponibilidad.' },
              { href: '/requisitos-carnet-conducir', title: 'Requisitos para el carnet de conducir', desc: 'Documentación, edades mínimas y condiciones médicas.' },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600">{a.title}</h3>
                <p className="text-sm text-gray-500">{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
