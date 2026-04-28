import { type Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import LeadForm from '@/components/forms/LeadForm'

export const metadata: Metadata = buildMetadata({
  title: 'Comparar autoescuelas — Recibe presupuestos gratis',
  description: 'Compara autoescuelas en tu ciudad y recibe hasta 3 presupuestos personalizados gratis. Sin compromiso.',
  canonical: '/comparar',
})

export default function CompararPage() {
  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="container-main max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-3">
            Compara autoescuelas gratis
          </h1>
          <p className="text-gray-600">
            Rellena el formulario y recibe hasta 3 presupuestos personalizados de autoescuelas de tu ciudad.
          </p>
        </div>
        <LeadForm />
      </div>
    </section>
  )
}
