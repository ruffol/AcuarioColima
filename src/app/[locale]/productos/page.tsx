import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { getProductTypes } from '@/lib/db'
import { getCategories } from '@/lib/repositories/categories'
import { getProducts } from '@/lib/repositories/products'
import { locales } from '@/i18n/routing'
import CatalogClient from '@/components/product/CatalogClient'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ProductGrid' })
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tlalchichi.xyz'
  const currentUrl = `${baseUrl}/${locale}/productos`
  const desc = locale === 'es'
    ? 'Explora nuestra colección de figuras de Tlalchichis artesanales de Colima. Perros de la tierra hechos a mano con tradición milenaria.'
    : 'Explore our collection of handmade Tlalchichi figurines from Colima. Dogs of the earth crafted with millenary tradition.'

  const alternateLanguages: Record<string, string> = {}
  for (const l of locales) {
    alternateLanguages[l] = `${baseUrl}/${l}/productos`
  }
  alternateLanguages['x-default'] = `${baseUrl}/es/productos`

  return {
    title: t('titulo'),
    description: desc,
    alternates: {
      canonical: currentUrl,
      languages: alternateLanguages,
    },
    openGraph: {
      title: t('titulo'),
      description: desc,
      url: currentUrl,
      siteName: 'Tlalchichi Store',
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
      images: [{ url: `${baseUrl}/img/iconologotlalchichi.svg`, width: 800, height: 800 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('titulo'),
      description: desc,
      images: [`${baseUrl}/img/iconologotlalchichi.svg`],
    },
  }
}

export default async function ProductosPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ProductGrid' })

  const types = getProductTypes()
  const categories = getCategories()
  const newProducts = getProducts({ activo: true })

  const initialProducts = newProducts.map((p: any) => ({
    id: `new_${p.id}`,
    source: 'product' as const,
    slug: p.slug,
    nombre_es: p.nombre_es,
    nombre_en: p.nombre_en,
    descripcion_es: p.descripcion_es,
    descripcion_en: p.descripcion_en,
    precio_mxn: p.precio_mxn,
    precio_usd: p.precio_usd,
    stock: p.stock,
    image: Array.isArray(p.images) ? p.images[0] || null : null,
    tipo: p.tipo,
    category: null,
  }))

  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold text-negro-suave text-center pt-12">
        {t('titulo')}
      </h1>
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-arena rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[4/5] bg-arena" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-arena rounded w-3/4" />
                  <div className="h-3 bg-arena rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      }>
        <CatalogClient
          locale={locale}
          initialProducts={initialProducts}
          initialTypes={types.map((t: any) => ({ slug: t.slug, nombre_es: t.nombre_es, nombre_en: t.nombre_en }))}
          initialCategories={categories.map((c: any) => ({ slug: c.slug, nombre_es: c.nombre_es, nombre_en: c.nombre_en }))}
        />
      </Suspense>
    </>
  )
}
