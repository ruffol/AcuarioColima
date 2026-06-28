import type { MetadataRoute } from 'next'
import { locales } from '@/i18n/routing'
import { getModels } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tlalchichi.xyz'
  const today = '2026-06-24'

  const staticPages: { path: string; priority: number; freq: 'weekly' | 'monthly' }[] = [
    { path: '', priority: 1, freq: 'weekly' },
    { path: '/productos', priority: 0.9, freq: 'weekly' },
    { path: '/nosotros', priority: 0.7, freq: 'monthly' },
  ]

  const entries: MetadataRoute.Sitemap = []

  // Pages estáticas por idioma
  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: today,
        changeFrequency: page.freq,
        priority: page.priority,
      })
    }
  }

  // Productos desde la base de datos
  try {
    const products = getModels({ activo: true })
    for (const locale of locales) {
      for (const product of products) {
        entries.push({
          url: `${baseUrl}/${locale}/producto/${product.slug}`,
          lastModified: today,
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    }
  } catch {
    // Si la DB no existe (primer build), omitimos productos
  }

  return entries
}
