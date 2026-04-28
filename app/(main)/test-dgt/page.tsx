'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, XCircle, ChevronRight, RefreshCw, Trophy } from 'lucide-react'

// Muestra de 20 preguntas representativas del test DGT
const PREGUNTAS = [
  {
    id: 1,
    pregunta: '¿A qué velocidad máxima puede circular un turismo en autopista?',
    opciones: ['100 km/h', '110 km/h', '120 km/h', '130 km/h'],
    correcta: 3,
    explicacion: 'La velocidad máxima en autopista y autovía para turismos es de 120 km/h, salvo señal en contrario.',
  },
  {
    id: 2,
    pregunta: 'En una intersección sin señalizar, ¿quién tiene prioridad de paso?',
    opciones: [
      'El vehículo que lleva más velocidad',
      'El vehículo que viene por la derecha',
      'El vehículo que viene por la izquierda',
      'El vehículo más largo',
    ],
    correcta: 1,
    explicacion: 'En intersecciones sin señalizar tiene prioridad el vehículo que se aproxima por la derecha.',
  },
  {
    id: 3,
    pregunta: '¿Cuál es la tasa de alcoholemia máxima para conductores con menos de 2 años de carnet?',
    opciones: ['0,5 g/l en sangre', '0,3 g/l en sangre', '0,2 g/l en sangre', '0,1 g/l en sangre'],
    correcta: 1,
    explicacion: 'Para conductores noveles (menos de 2 años de permiso) la tasa máxima es 0,3 g/l en sangre (0,15 mg/l en aire espirado).',
  },
  {
    id: 4,
    pregunta: '¿Qué significa una señal circular con fondo blanco y borde rojo?',
    opciones: ['Indicación', 'Obligación', 'Prohibición o restricción', 'Advertencia de peligro'],
    correcta: 2,
    explicacion: 'Las señales circulares con borde rojo son de prohibición o restricción.',
  },
  {
    id: 5,
    pregunta: '¿Con qué antelación mínima debes indicar un cambio de dirección?',
    opciones: ['5 metros', '10 metros', '50 metros', 'No hay obligación'],
    correcta: 1,
    explicacion: 'La señal de cambio de dirección debe activarse con antelación suficiente, generalmente unos 50 metros en vía urbana y más en carretera, aunque el reglamento no fija un número exacto. Los 50 m son la respuesta orientativa del examen DGT.',
  },
  {
    id: 6,
    pregunta: 'En caso de niebla densa, ¿qué luces debes usar?',
    opciones: ['Luces de posición', 'Luces largas', 'Luces antiniebla delanteras y traseras', 'Solo luces cortas'],
    correcta: 2,
    explicacion: 'Con niebla densa se deben usar las luces antiniebla delanteras y traseras, además de las luces de cruce.',
  },
  {
    id: 7,
    pregunta: '¿A qué distancia mínima de una señal de STOP debes detenerte?',
    opciones: ['1 metro', '2 metros', '5 metros', 'No importa, solo detenerse'],
    correcta: 0,
    explicacion: 'Debes detenerte antes de la línea de STOP o, si no hay línea, antes de la calzada que vas a cruzar.',
  },
  {
    id: 8,
    pregunta: '¿Cuántos puntos tiene el carnet de conducir para un conductor novel?',
    opciones: ['8 puntos', '10 puntos', '12 puntos', '15 puntos'],
    correcta: 0,
    explicacion: 'Los conductores noveles comienzan con 8 puntos. Tras 3 años sin sanciones, alcanzan los 12 puntos del carnet ordinario.',
  },
  {
    id: 9,
    pregunta: 'En una rotonda, ¿quién tiene prioridad?',
    opciones: [
      'Los que entran en la rotonda',
      'Los que ya circulan dentro de la rotonda',
      'El vehículo de mayor tamaño',
      'El que lleve más velocidad',
    ],
    correcta: 1,
    explicacion: 'Los vehículos que ya circulan dentro de la rotonda tienen prioridad sobre los que van a entrar.',
  },
  {
    id: 10,
    pregunta: '¿Cuál es la distancia de seguridad mínima en autopista a 120 km/h?',
    opciones: ['50 metros', '72 metros', '100 metros', '120 metros'],
    correcta: 1,
    explicacion: 'A 120 km/h la distancia mínima es de 72 metros (regla orientativa: el tiempo de seguridad es de al menos 2 segundos).',
  },
  {
    id: 11,
    pregunta: '¿Puedes usar el teléfono móvil mientras conduces con manos libres?',
    opciones: [
      'Sí, sin restricciones',
      'Sí, pero solo en retenciones',
      'No, está totalmente prohibido',
      'Sí, si el vehículo está insonorizado',
    ],
    correcta: 0,
    explicacion: 'El uso de manos libres (auricular o altavoz integrado) está permitido, aunque no recomendado. Lo que está prohibido es sostener el teléfono con la mano.',
  },
  {
    id: 12,
    pregunta: '¿Qué es el punto ciego?',
    opciones: [
      'El ángulo muerto que no cubre ningún espejo',
      'El área iluminada por los faros',
      'La zona de visión del retrovisor interior',
      'El alcance del limpiaparabrisas',
    ],
    correcta: 0,
    explicacion: 'El punto ciego es la zona que no queda cubierta por ningún espejo y donde no puedes ver otros vehículos. Hay que comprobarlo girando la cabeza antes de cambiar de carril.',
  },
  {
    id: 13,
    pregunta: '¿En qué situación NO es obligatorio usar el cinturón de seguridad?',
    opciones: [
      'En marcha atrás dentro de un aparcamiento privado',
      'Circulando por vía urbana a menos de 30 km/h',
      'Con el vehículo parado en semáforo',
      'El cinturón es siempre obligatorio',
    ],
    correcta: 0,
    explicacion: 'La normativa exime del cinturón en ciertos supuestos excepcionales, como circulación en marcha atrás o en zonas privadas no abiertas al tráfico.',
  },
  {
    id: 14,
    pregunta: '¿Qué señal indica que la calzada se estrecha por la derecha?',
    opciones: [
      'Señal triangular con flecha apuntando a la izquierda',
      'Señal triangular con dos líneas convergentes',
      'Señal circular con borde rojo',
      'Señal cuadrada con flecha hacia la derecha',
    ],
    correcta: 1,
    explicacion: 'La señal de estrechamiento de calzada es triangular (peligro) y muestra dos líneas o bordes que se estrechan, indicando por qué lado.',
  },
  {
    id: 15,
    pregunta: '¿Cuál es el límite de velocidad en zona urbana por defecto?',
    opciones: ['30 km/h', '50 km/h', '40 km/h', '60 km/h'],
    correcta: 0,
    explicacion: 'Desde mayo de 2021, el límite genérico en vías urbanas con un carril por sentido es de 30 km/h. En vías con dos o más carriles por sentido sigue siendo 50 km/h.',
  },
  {
    id: 16,
    pregunta: '¿Cuándo es obligatorio el uso de chaleco reflectante?',
    opciones: [
      'Solo de noche',
      'Al salir del vehículo en la calzada o arcén en cualquier circunstancia',
      'Solo en autopista',
      'Solo si hay baja visibilidad',
    ],
    correcta: 1,
    explicacion: 'Es obligatorio ponerse el chaleco reflectante antes de salir del vehículo si se encuentra en la calzada o el arcén, independientemente del horario o visibilidad.',
  },
  {
    id: 17,
    pregunta: 'Si el semáforo está en ámbar, ¿qué debes hacer?',
    opciones: [
      'Acelerar para pasar antes de que se ponga en rojo',
      'Detenerte si puedes hacerlo con seguridad',
      'Continuar siempre la marcha',
      'Pitar para avisar a los peatones',
    ],
    correcta: 1,
    explicacion: 'El ámbar indica que la circulación va a detenerse. Debes detenerte si puedes hacerlo con seguridad; si ya estás demasiado cerca del cruce, puedes cruzar.',
  },
  {
    id: 18,
    pregunta: '¿Qué indica una línea continua en el centro de la calzada?',
    opciones: [
      'Que puedes adelantar con precaución',
      'Prohibición de cruzarla o circular sobre ella',
      'Que la vía tiene doble sentido',
      'Que hay un peatón cruzando',
    ],
    correcta: 1,
    explicacion: 'Una línea continua en el eje de la calzada prohíbe cruzarla. Significa que no puedes adelantar ni invadir el carril contrario.',
  },
  {
    id: 19,
    pregunta: '¿Cuál es la multa por no llevar ITV en vigor?',
    opciones: ['100€', '200€', '500€', '1.000€'],
    correcta: 2,
    explicacion: 'Circular con la ITV caducada es una infracción grave que conlleva una multa de 200€ a 500€ según la antigüedad del vencimiento.',
  },
  {
    id: 20,
    pregunta: 'En una vía de dos carriles, ¿por qué carril debes circular normalmente?',
    opciones: ['Por el izquierdo', 'Por el derecho', 'Por cualquiera', 'Por el que esté más libre'],
    correcta: 1,
    explicacion: 'Siempre debes circular por el carril derecho, usando el izquierdo únicamente para adelantar o cuando el carril derecho esté ocupado.',
  },
]

export default function TestDGTPage() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({})
  const [enviado, setEnviado] = useState(false)
  const [preguntaActual, setPreguntaActual] = useState(0)

  const total = PREGUNTAS.length
  const respondidas = Object.keys(respuestas).length
  const correctas = PREGUNTAS.filter((p) => respuestas[p.id] === p.correcta).length
  const porcentaje = enviado ? Math.round((correctas / total) * 100) : 0
  const aprobado = correctas >= total - 3

  function seleccionar(preguntaId: number, opcionIdx: number) {
    if (enviado) return
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionIdx }))
    if (preguntaActual < total - 1) {
      setTimeout(() => setPreguntaActual((p) => p + 1), 400)
    }
  }

  function reiniciar() {
    setRespuestas({})
    setEnviado(false)
    setPreguntaActual(0)
  }

  const pregunta = PREGUNTAS[preguntaActual]

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-600 text-white py-12">
        <div className="container-main text-center">
          <h1 className="text-4xl font-black mb-3">Test DGT online gratuito</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            20 preguntas tipo examen oficial. Practica antes de presentarte.
            Se aprueba con un máximo de 3 fallos.
          </p>
        </div>
      </section>

      <div className="container-main max-w-3xl py-10">
        {!enviado ? (
          <>
            {/* Barra de progreso */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Pregunta {preguntaActual + 1} de {total}</span>
                <span>{respondidas} respondidas · {total - respondidas} restantes</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${(respondidas / total) * 100}%` }}
                />
              </div>
            </div>

            {/* Pregunta */}
            <div className="card p-6 mb-4">
              <p className="font-bold text-gray-900 text-lg mb-5">
                {preguntaActual + 1}. {pregunta.pregunta}
              </p>
              <div className="space-y-3">
                {pregunta.opciones.map((opcion, idx) => {
                  const seleccionada = respuestas[pregunta.id] === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => seleccionar(pregunta.id, idx)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all text-sm font-medium ${
                        seleccionada
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="mr-2 font-bold text-gray-400">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {opcion}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navegación */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {preguntaActual > 0 && (
                  <button
                    onClick={() => setPreguntaActual((p) => p - 1)}
                    className="btn-secondary text-sm"
                  >
                    ← Anterior
                  </button>
                )}
                {preguntaActual < total - 1 && (
                  <button
                    onClick={() => setPreguntaActual((p) => p + 1)}
                    className="btn-secondary text-sm"
                  >
                    Siguiente →
                  </button>
                )}
              </div>
              {respondidas >= 15 && (
                <button
                  onClick={() => setEnviado(true)}
                  className="btn-primary text-sm"
                >
                  Corregir test ({respondidas}/{total})
                </button>
              )}
            </div>

            {/* Mini mapa de preguntas */}
            <div className="mt-6 grid grid-cols-10 gap-1.5">
              {PREGUNTAS.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setPreguntaActual(i)}
                  className={`h-7 rounded text-xs font-bold transition-colors ${
                    i === preguntaActual
                      ? 'bg-brand-500 text-white'
                      : respuestas[p.id] !== undefined
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        ) : (
          // Resultados
          <>
            <div className={`card p-8 text-center mb-8 ${aprobado ? 'border-2 border-green-400' : 'border-2 border-red-300'}`}>
              <div className="text-6xl mb-3">{aprobado ? '🎉' : '😓'}</div>
              <h2 className={`text-3xl font-black mb-1 ${aprobado ? 'text-green-600' : 'text-red-500'}`}>
                {aprobado ? '¡Aprobado!' : 'Suspenso'}
              </h2>
              <p className="text-gray-500 text-lg mb-4">
                {correctas} correctas · {total - correctas} fallos · {porcentaje}%
              </p>
              {aprobado ? (
                <p className="text-green-700 font-medium">
                  Has pasado el umbral de aprobado (máximo 3 fallos). ¡Buen trabajo!
                </p>
              ) : (
                <p className="text-red-600 font-medium">
                  Necesitas repasar. El examen admite máximo 3 fallos de {total} preguntas.
                </p>
              )}
              <button onClick={reiniciar} className="btn-primary mt-5 gap-2">
                <RefreshCw className="w-4 h-4" />
                Repetir test
              </button>
            </div>

            {/* Respuestas corregidas */}
            <h3 className="text-xl font-bold text-gray-900 mb-4">Corrección detallada</h3>
            <div className="space-y-4">
              {PREGUNTAS.map((p, i) => {
                const respuesta = respuestas[p.id]
                const correcto = respuesta === p.correcta
                return (
                  <div
                    key={p.id}
                    className={`card p-5 border-l-4 ${correcto ? 'border-l-green-400' : 'border-l-red-400'}`}
                  >
                    <div className="flex items-start gap-3">
                      {correcto
                        ? <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                        : <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />}
                      <div>
                        <p className="font-medium text-gray-900 mb-2">{i + 1}. {p.pregunta}</p>
                        {!correcto && respuesta !== undefined && (
                          <p className="text-sm text-red-600 mb-1">
                            Tu respuesta: {p.opciones[respuesta]}
                          </p>
                        )}
                        <p className="text-sm text-green-700 font-medium mb-2">
                          ✓ Correcta: {p.opciones[p.correcta]}
                        </p>
                        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">{p.explicacion}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 card p-6 bg-brand-50 border border-brand-200 text-center">
              <Trophy className="w-8 h-8 text-brand-500 mx-auto mb-2" />
              <h3 className="font-bold text-gray-900 mb-1">¿Listo para el examen real?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Compara autoescuelas en tu ciudad y empieza cuanto antes.
              </p>
              <Link href="/comparar" className="btn-primary">
                Comparar autoescuelas
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}
