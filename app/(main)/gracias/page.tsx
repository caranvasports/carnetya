import { type Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'
import LeadForm from '@/components/forms/LeadForm'

export const metadata: Metadata = buildMetadata({
  title: `Página de gracias — Tu solicitud ha sido recibida`,
  description: 'Hemos recibido tu solicitud. En breve recibirás presupuestos de autoescuelas de tu ciudad.',
  canonical: '/gracias',
  noIndex: true,
})

export default function GraciasPage() {
  return (
    <section className="py-20">
      <div className="container-main max-w-xl text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">
          ¡Solicitud recibida!
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Hemos recibido tus datos. Las autoescuelas de tu ciudad se pondrán en contacto contigo en las próximas <strong>24 horas</strong>.
        </p>

        <div className="bg-blue-50 rounded-2xl p-6 mb-8 text-left space-y-3">
          <h2 className="font-bold text-gray-900">¿Qué pasa ahora?</h2>
          {[
            'Enviamos tu solicitud a autoescuelas verificadas de tu ciudad',
            'Recibirás hasta 3 presupuestos personalizados',
            'Compara y elige sin compromiso',
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </div>
              <span className="text-sm text-gray-700">{step}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/cuanto-cuesta-carnet-conducir" className="btn-secondary">
            Guía de precios
          </Link>
          <Link href="/test-dgt" className="btn-primary">
            Practicar test DGT
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
