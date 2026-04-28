import { type FAQItem } from '@/types'
import { ChevronDown } from 'lucide-react'
import { buildFAQSchema } from '@/lib/seo'

interface FAQSectionProps {
  faqs: FAQItem[]
  title?: string
}

export default function FAQSection({ faqs, title = 'Preguntas frecuentes' }: FAQSectionProps) {
  const schema = buildFAQSchema(faqs)

  return (
    <section className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{title}</h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none font-medium text-gray-900 hover:bg-gray-50 transition-colors">
              <span>{faq.pregunta}</span>
              <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
            </summary>
            <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
              {faq.respuesta}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
