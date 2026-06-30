import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getModelBySlug } from '@/lib/db'
import { getProductBySlug, getRelatedProducts } from '@/lib/repositories/products'
import { getFishSpecs, getCompatibleProductIds } from '@/lib/repositories/fish'
import { locales } from '@/i18n/routing'
import ProductGallery from '@/components/product/ProductGallery'
import ClientWrapper from './ClientWrapper'
import FishSpecsTable from '@/components/product/FishSpecsTable'
import CompatibilitySection from '@/components/product/CompatibilitySection'
import WhatsAppShareButton from '@/components/product/WhatsAppShareButton'
import Breadcrumb from '@/components/ui/Breadcrumb'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

async function findProduct(slug: string) {
  const model = getModelBySlug(slug)
  if (model) return { source: 'model' as const, data: model }
  const product = getProductBySlug(slug)
  if (product) return { source: 'product' as const, data: product }
  return null
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const found = await findProduct(slug)
  if (!found) return { title: 'Producto no encontrado' }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tlalchichi.xyz'
  const nombre = locale === 'es'
    ? (found.data.nombre_es || found.data.nombre_es)
    : (found.data.nombre_en || found.data.nombre_en)
  const seoDesc = locale === 'es'
    ? (found.data.descripcion_es || found.data.descripcion_es)
    : (found.data.descripcion_en || found.data.descripcion_en)

  const images = found.source === 'model'
    ? (Array.isArray(found.data.imagenes) ? found.data.imagenes : [])
    : (Array.isArray(found.data.images) ? found.data.images : [])
  const imagen = images[0] || ''
  const currentUrl = `${baseUrl}/${locale}/producto/${found.data.slug}`

  const alternateLanguages: Record<string, string> = {}
  for (const l of locales) {
    alternateLanguages[l] = `${baseUrl}/${l}/producto/${found.data.slug}`
  }
  alternateLanguages['x-default'] = `${baseUrl}/es/producto/${found.data.slug}`

  return {
    title: nombre,
    description: seoDesc,
    alternates: {
      canonical: currentUrl,
      languages: alternateLanguages,
    },
    openGraph: {
      title: nombre,
      description: seoDesc || '',
      url: currentUrl,
      siteName: 'AcuarioColima',
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
      images: imagen ? [{ url: imagen, width: 800, height: 800 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: nombre,
      description: seoDesc || '',
      images: imagen ? [imagen] : [],
    },
  }
}

export default async function ProductoDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'ProductDetail' })
  const found = await findProduct(slug)
  if (!found) notFound()

  const { data, source } = found
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tlalchichi.xyz'
  const currentUrl = `${baseUrl}/${locale}/producto/${data.slug}`

  const nombre = locale === 'es'
    ? (data.nombre_es || data.nombre_es)
    : (data.nombre_en || data.nombre_en)
  const descripcion = locale === 'es'
    ? (data.descripcion_es || data.descripcion_es)
    : (data.descripcion_en || data.descripcion_en)

  // Gather images
  const images = source === 'model'
    ? (Array.isArray(data.imagenes) ? data.imagenes : [])
    : (Array.isArray(data.images) ? data.images : [])
  const altTexts = images.map(() => nombre)

  // New product fields
  const tipo = (data as any).tipo
  const isFish = tipo === 'pez'

  // Fish specs
  let fishSpecs = null
  let compatibleProducts: any[] = []
  let relatedProducts: any[] = []

  if (source === 'product' && isFish) {
    const specs = getFishSpecs(data.id)
    if (specs) fishSpecs = specs

    const compatIds = getCompatibleProductIds(data.id)
    if (compatIds.length > 0) {
      const { getProductById } = await import('@/lib/repositories/products')
      compatibleProducts = compatIds
        .map((id: number) => getProductById(id))
        .filter(Boolean) as any[]
    }
  }

  if (source === 'product') {
    relatedProducts = getRelatedProducts(data.id)
  }

  // JSON-LD structured data
  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': isFish ? 'IndividualProduct' : 'Product',
    name: nombre,
    description: descripcion || '',
    url: currentUrl,
    image: images[0] || '',
    sku: (data as any).sku || '',
    brand: (data as any).brand ? { '@type': 'Brand', name: (data as any).brand } : undefined,
    offers: {
      '@type': 'Offer',
      price: data.precio_mxn,
      priceCurrency: 'MXN',
      availability: data.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    },
  }

  if (isFish && fishSpecs) {
    jsonLd.additionalProperty = [
      { '@type': 'PropertyValue', name: 'Temperatura', value: `${fishSpecs.temp_min}-${fishSpecs.temp_max}°C` },
      { '@type': 'PropertyValue', name: 'pH', value: `${fishSpecs.ph_min}-${fishSpecs.ph_max}` },
      { '@type': 'PropertyValue', name: 'Tamaño adulto', value: `${fishSpecs.adult_size_cm} cm` },
      { '@type': 'PropertyValue', name: 'Dificultad', value: fishSpecs.difficulty },
      { '@type': 'PropertyValue', name: 'Volumen mínimo', value: `${fishSpecs.min_volume_liters} L` },
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumb items={[
          { label: t('inicio'), href: '/' },
          { label: t('productos'), href: '/productos' },
          { label: nombre },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mt-8">
          <div className="space-y-8">
            <ProductGallery
              images={images}
              principal={images[0] || null}
              nombre={nombre}
              altTexts={altTexts}
            />

            {descripcion && (
              <div className="lg:hidden">
                <p className="text-lg text-muted leading-relaxed">{descripcion}</p>
              </div>
            )}

            {source === 'product' && isFish && fishSpecs && (
              <FishSpecsTable specs={fishSpecs} />
            )}

            {source === 'product' && compatibleProducts.length > 0 && (
              <CompatibilitySection products={compatibleProducts} locale={locale} />
            )}
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-negro-suave">
              {nombre}
            </h1>

            {descripcion && (
              <p className="text-lg text-muted leading-relaxed hidden lg:block">
                {descripcion}
              </p>
            )}

            {source === 'model' && (data as any).historia_es && (
              <div className="bg-arena/50 rounded-2xl p-6">
                <h2 className="font-semibold text-negro-suave mb-2">
                  {t('historia')}
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  {locale === 'es' ? (data as any).historia_es : (data as any).historia_en}
                </p>
              </div>
            )}

            <ClientWrapper
              model={data}
              locale={locale}
              source={source}
            />

            {source === 'product' && (
              <div className="space-y-3 pt-4 border-t border-arena">
                <p className="text-xs text-muted">SKU: {(data as any).sku || '-'}</p>
                {(data as any).brand && (
                  <p className="text-xs text-muted">Marca: {(data as any).brand}</p>
                )}
                {(data as any).weight_kg > 0 && (
                  <p className="text-xs text-muted">Peso: {((data as any).weight_kg * 1000).toFixed(0)} g ({(data as any).weight_kg.toFixed(2)} kg)</p>
                )}
                <p className="text-xs text-muted">
                  Stock: {data.stock > 0 ? data.stock : 'Agotado'}
                </p>
              </div>
            )}

            <WhatsAppShareButton
              productName={nombre}
              productUrl={currentUrl}
              locale={locale}
            />

            {source === 'model' && (data as any).colores && Array.isArray((data as any).colores) && (data as any).colores.length > 0 && (
              <div className="bg-arena/50 rounded-2xl p-6">
                <h2 className="font-semibold text-negro-suave mb-3">Especificaciones</h2>
                <ul className="space-y-2 text-sm text-muted">
                  <li className="flex justify-between">
                    <span>Material</span>
                    <span className="font-medium text-negro-suave">Plástico PET</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Altura</span>
                    <span className="font-medium text-negro-suave">4.2 cm</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Colores disponibles</span>
                    <span className="font-medium text-negro-suave">{(data as any).colores.length}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {source === 'product' && relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-arena">
            <h2 className="text-2xl font-bold text-negro-suave mb-8">
              {t('relacionados')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedProducts.map((p: any) => {
                const name = locale === 'es' ? p.nombre_es : p.nombre_en
                const imgs = Array.isArray(p.images) ? p.images : []
                return (
                  <a key={p.id} href={`/${locale}/producto/${p.slug}`} className="bg-card border border-arena rounded-xl overflow-hidden hover:border-terracota/30 transition-colors group">
                    <div className="aspect-square bg-arena overflow-hidden">
                      {imgs[0] ? (

                        <img src={imgs[0]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-xs">Sin img</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-foreground truncate">{name}</p>
                      <p className="text-xs text-terracota">${p.precio_mxn} MXN</p>
                    </div>
                  </a>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
