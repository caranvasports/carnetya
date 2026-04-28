import { type MetadataRoute } from 'next'
import { CIUDADES } from '@/data/cities'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carnetya.es'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Páginas estáticas principales
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/carnet-de-conducir`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/carnet-de-conducir/coche`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${SITE_URL}/carnet-de-conducir/moto`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${SITE_URL}/carnet-de-conducir/camion`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/carnet-de-conducir/autobus`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/carnet-de-conducir/ciclomotor`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/comparar`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/cuanto-cuesta-carnet-conducir`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/cuanto-tarda-sacarse-carnet`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/requisitos-carnet-conducir`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/test-dgt`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ]

  // Páginas de ciudad (programmatic SEO — 4 variantes por ciudad)
  const ciudadPages: MetadataRoute.Sitemap = CIUDADES.flatMap((ciudad) => [
    {
      url: `${SITE_URL}/autoescuelas/${ciudad.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/autoescuelas/${ciudad.slug}/baratas`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/autoescuelas/${ciudad.slug}/mejores`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/precio-carnet-conducir/${ciudad.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
  ])

  return [...staticPages, ...ciudadPages]
}
