import { type Metadata } from 'next'
import { type FAQItem } from '@/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carnetya.es'
const SITE_NAME = 'CarnetYa'

export function buildMetadata({
  title,
  description,
  canonical,
  ogImage = `${SITE_URL}/og-default.png`,
  noIndex = false,
}: {
  title: string
  description: string
  canonical: string
  ogImage?: string
  noIndex?: boolean
}): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`
  const url = canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'es_ES',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  }
}

// Schema.org LocalBusiness
export function buildAutoescuelaSchema(ae: {
  nombre: string
  descripcion?: string
  direccion?: string
  ciudad: string
  telefono?: string
  email?: string
  web?: string
  rating: number
  totalReviews: number
  imagen?: string
  slug: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: ae.nombre,
    description: ae.descripcion,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ae.direccion,
      addressLocality: ae.ciudad,
      addressCountry: 'ES',
    },
    telephone: ae.telefono,
    email: ae.email,
    url: ae.web ?? `${SITE_URL}/autoescuelas/${ae.slug}`,
    image: ae.imagen,
    aggregateRating:
      ae.totalReviews > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: ae.rating,
            reviewCount: ae.totalReviews,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  }
}

// Schema.org FAQPage
export function buildFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.pregunta,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.respuesta,
      },
    })),
  }
}

// Schema.org BreadcrumbList
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}
