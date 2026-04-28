import { type Metadata } from 'next'
import Link from 'next/link'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'
import FAQSection from '@/components/seo/FAQSection'
import LeadForm from '@/components/forms/LeadForm'

export const metadata: Metadata = buildMetadata({
  title: `¿Cuánto tarda en sacarse el carnet de conducir? Guía 2025`,
  description: `Tiempos reales para sacarse el carnet de conducir en España: desde 2 meses si apruebas a la primera hasta 12+ meses. Depende de ti. Descubre cómo acelerar el proceso.`,
  canonical: '/cuanto-tarda-sacarse-carnet',
})

const ETAPAS = [
  {
    nombre: 'Matrícula y documentación',
    duracion: '1–3 días',
    descripcion: 'Alta en autoescuela, entrega de documentación (DNI, foto, historial médico) y pago de matrícula.',
    icon: '📝',
  },
  {
    nombre: 'Clases teóricas',
    duracion: '4–8 semanas',
    descripcion: 'Asistencia a clases y/o estudio con app + libro oficial. Los más rápidos lo logran en 3 semanas con dedicación diaria.',
    icon: '📚',
  },
  {
    nombre: 'Examen teórico (DGT)',
    duracion: '1–3 intentos',
    descripcion: '30 preguntas, máximo 3 fallos. El 60% aprueba a la primera. Si suspendes, espera mínimo 10 días entre intentos.',
    icon: '📄',
  },
  {
    nombre: 'Clases prácticas',
    duracion: '2–4 semanas',
    descripcion: 'Mínimo 10 horas para solicitar el examen, pero la media real es 20–25 horas. Depende del instructor y tu ritmo.',
    icon: '🚗',
  },
  {
    nombre: 'Examen práctico (DGT)',
    duracion: '1–3 intentos',
    descripcion: '35 minutos. El 45% aprueba a la primera. Espera de 20–30 días entre intentos por disponibilidad de circuitos.',
    icon: '🏁',
  },
  {
    nombre: 'Carnet en mano',
    duracion: '1–2 semanas tras aprobar',
    descripcion: 'La DGT envía el permiso provisional (válido 3 meses). El carnet definitivo llega por correo en 7–15 días.',
    icon: '🎉',
  },
]

const SCENARIOS = [
  {
    perfil: 'El más rápido posible',
    tiempo: '2–3 meses',
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
    condiciones: 'Todo a la primera, clases intensivas, sin esperas en DGT',
  },
  {
    perfil: 'Ritmo normal',
    tiempo: '4–6 meses',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    condiciones: 'Algún segundo intento, 2–3 clases prácticas por semana',
  },
  {
    perfil: 'Con algún contratiempo',
    tiempo: '6–12 meses',
    color: 'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
    condiciones: 'Varios intentos en teoría o práctica, pausas por trabajo/estudios',
  },
  {
    perfil: 'Caso difícil',
    tiempo: '+12 meses',
    color: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
    condiciones: 'Múltiples suspensos, cambio de autoescuela, periodos de inactividad',
  },
]

export default function CuantoTardaPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-700 to-brand-600 text-white py-16">
        <div className="container-main text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
            <Clock className="w-5 h-5" />
            <span>Guía actualizada {new Date().getFullYear()}</span>
          </div>
          <h1 className="text-5xl font-black mb-4">
            ¿Cuánto tiempo se tarda en sacar el carnet?
          </h1>
          <p className="text-blue-100 text-xl max-w-2xl mx-auto">
            La respuesta honesta: entre <strong className="text-white">2 meses</strong> (el más optimista) y
            más de <strong className="text-white">1 año</strong>. Depende de ti y de tu autoescuela.
          </p>
        </div>
      </section>

      {/* Timeline de etapas */}
      <section className="py-14">
        <div className="container-main max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Las 6 etapas del proceso
          </h2>
          <div className="space-y-4">
            {ETAPAS.map((etapa, i) => (
              <div key={i} className="card p-5 flex gap-4 items-start">
                <div className="text-3xl mt-0.5 shrink-0">{etapa.icon}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400">PASO {i + 1}</span>
                    <h3 className="font-bold text-gray-900">{etapa.nombre}</h3>
                    <span className="badge">{etapa.duracion}</span>
                  </div>
                  <p className="text-sm text-gray-600">{etapa.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Escenarios */}
      <section className="py-10 bg-gray-50">
        <div className="container-main max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Tiempo real según tu perfil
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Estimaciones basadas en datos reales de alumnos de autoescuelas españolas
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {SCENARIOS.map((s) => (
              <div key={s.perfil} className={`rounded-2xl border-2 p-5 ${s.color}`}>
                <div className={`inline-block text-xs font-bold rounded-full px-3 py-1 mb-2 ${s.badge}`}>
                  {s.perfil}
                </div>
                <p className="text-3xl font-black text-gray-900 mb-1">{s.tiempo}</p>
                <p className="text-sm text-gray-600">{s.condiciones}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consejos para ir más rápido */}
      <section className="py-14">
        <div className="container-main max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Cómo acortar el proceso al máximo
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '📱', tip: 'Estudia con la app de la DGT o Test-DGT.es. Mínimo 30 preguntas al día durante 3 semanas.' },
              { icon: '🗓️', tip: 'Reserva el examen teórico con antelación. Las plazas se llenan rápido.' },
              { icon: '🚗', tip: 'Haz 2–3 clases prácticas por semana mínimo. No dejes pasar más de 3 días entre clases.' },
              { icon: '🗺️', tip: 'Practica los circuitos de examen con tu instructor. El 80% del examen ocurre en las mismas calles.' },
              { icon: '😴', tip: 'Duerme bien la noche antes del examen. El cansancio es el mayor enemigo de los nervios.' },
              { icon: '🏫', tip: 'Elige una autoescuela con alta tasa de aprobados. Compara antes de matricularte.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-sm text-gray-700">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Lead */}
      <section className="py-10 bg-brand-700">
        <div className="container-main max-w-2xl text-center text-white">
          <h2 className="text-2xl font-bold mb-2">¿Quieres ir lo más rápido posible?</h2>
          <p className="text-blue-200 mb-6">Compara autoescuelas en tu ciudad y elige la que tiene mejor tasa de aprobados.</p>
          <LeadForm />
        </div>
      </section>

      <section className="py-4 bg-gray-50">
        <div className="container-main max-w-4xl">
          <FAQSection
            title="Preguntas frecuentes sobre el tiempo para sacar el carnet"
            faqs={[
              {
                pregunta: '¿Cuánto se tarda mínimo en sacar el carnet de conducir?',
                respuesta: 'El mínimo teórico con todo a la primera y sin esperas es de unas 6–8 semanas. Sin embargo, en la práctica es muy difícil conseguirlo antes de 2 meses por las listas de espera de la DGT para los exámenes prácticos.',
              },
              {
                pregunta: '¿Cuántas clases prácticas son necesarias de media?',
                respuesta: 'No hay un mínimo legal, pero la autoescuela debe declarar que el alumno está preparado. La media en España es de 20–25 clases de 45 minutos. Algunos alumnos aprueban con 12–15 y otros necesitan 35 o más.',
              },
              {
                pregunta: '¿Cuánto tiempo hay que esperar entre intentos del examen práctico?',
                respuesta: 'No existe un plazo mínimo legal entre intentos prácticos, pero en la práctica la disponibilidad del circuito DGT marca los tiempos. Suele ser entre 2 y 4 semanas la espera para una nueva cita.',
              },
              {
                pregunta: '¿El permiso provisional vale igual que el carnet definitivo?',
                respuesta: 'Sí, el documento provisional que entrega la autoescuela tras aprobar tiene la misma validez legal que el carnet definitivo. Puedes conducir desde el mismo día que apruebas. El carnet plástico llega por correo en unos 7–15 días.',
              },
            ]}
          />
        </div>
      </section>
    </>
  )
}
