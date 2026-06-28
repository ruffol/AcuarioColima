import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getModelBySlug } from '@/lib/db'
import { Link, locales } from '@/i18n/routing'
import ProductGallery from '@/components/product/ProductGallery'
import ClientWrapper from './ClientWrapper'
import Badge from '@/components/ui/Badge'
import Breadcrumb from '@/components/ui/Breadcrumb'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const model = getModelBySlug(slug)

  if (!model) return { title: 'Producto no encontrado' }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tlalchichi.xyz'
  const nombre = locale === 'es' ? model.nombre_es : model.nombre_en
  const seoTitle = nombre
  const seoDesc = locale === 'es' ? model.descripcion_es : model.descripcion_en
  const imagen = model.imagenes?.[0] || ''
  const currentUrl = `${baseUrl}/${locale}/producto/${model.slug}`

  const alternateLanguages: Record<string, string> = {}
  for (const l of locales) {
    alternateLanguages[l] = `${baseUrl}/${l}/producto/${model.slug}`
  }
  alternateLanguages['x-default'] = `${baseUrl}/es/producto/${model.slug}`

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: currentUrl,
      languages: alternateLanguages,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc || '',
      url: currentUrl,
      siteName: 'Tlalchichi Store',
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
      images: imagen ? [{ url: imagen, width: 800, height: 800 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc || '',
      images: imagen ? [imagen] : [],
    },
  }
}

export default async function ProductoDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'ProductDetail' })
  const model = getModelBySlug(slug)
  if (!model) notFound()

  const nombre = locale === 'es' ? model.nombre_es : model.nombre_en
  const descripcion = locale === 'es' ? model.descripcion_es : model.descripcion_en
  const historia = locale === 'es' ? model.historia_es : model.historia_en
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const altTexts = (Array.isArray(model.imagenes) ? model.imagenes : []).map((_: string) => nombre)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb items={[
        { label: t('inicio'), href: '/' },
        { label: t('productos'), href: '/productos' },
        { label: nombre },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mt-8">
        <ProductGallery
          images={Array.isArray(model.imagenes) ? model.imagenes : []}
          principal={model.imagenes?.[0] || null}
          nombre={nombre}
          altTexts={altTexts}
        />

        <div className="space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-negro-suave">
            {nombre}
          </h1>

          {descripcion && (
            <p className="text-lg text-muted leading-relaxed">
              {descripcion}
            </p>
          )}

          {historia && (
            <div className="bg-arena/50 rounded-2xl p-6">
              <h2 className="font-semibold text-negro-suave mb-2">
                {t('historia')}
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                {historia}
              </p>
            </div>
          )}

          <ClientWrapper
            model={model}
            locale={locale}
          />
        </div>
      </div>
    </div>
  )
}
