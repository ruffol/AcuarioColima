import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { getModels, getProductTypes, getModelsByType } from '@/lib/db'
import { Link, locales } from '@/i18n/routing'
import ProductGrid from '@/components/product/ProductGrid'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ tipo?: string }>
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

export default async function ProductosPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { tipo } = await searchParams
  const t = await getTranslations({ locale, namespace: 'ProductGrid' })

  const models = tipo
    ? getModelsByType(tipo)
    : getModels({ activo: true })
  const types = getProductTypes()

  // Encontrar el tipo seleccionado para obtener nombre e imágenes
  const selectedType = tipo ? types.find((type: any) => type.slug === tipo) : null
  const categoryName = selectedType
    ? (locale === 'es' ? selectedType.nombre_es : selectedType.nombre_en)
    : ''

  // Imágenes del carrusel de categoría (desde la carpeta de imágenes)
  const catImages: Record<string, string[]> = {
    llaveros: ['/img/productos/llaveros/Llavero-tlalchichi-sentado-colima.png', '/img/productos/llaveros/Llavero-tlalchichi-parado-colima.png', '/img/productos/llaveros/Llavero-tlalchichi-joven-viejo-colima.png', '/img/productos/llaveros/varios1.png', '/img/productos/llaveros/varios2.png'],
    portamacetas: ['/img/productos/portamacetas/tlalchichi-acostado-colima.png', '/img/productos/portamacetas/tlalchichi-acostado-mediano-colima.png', '/img/productos/portamacetas/tlalchichi-sentado-colima.png'],
    alcacias: ['/img/productos/alcacias/tlalchichi-sentado-colima.png', '/img/productos/alcacias/tlalchichi-viejo-sentado-colima.png', '/img/productos/alcacias/tlalchichi-mascara-colima.png'],
    cuencos: ['/img/productos/cuencos/tlalchichi-mazorca-colima.png', '/img/productos/cuencos/tlalchichi-viejo-sentado-color-colima.png'],
  }

  return (
    <>
      {selectedType && tipo && catImages[tipo] && catImages[tipo].length > 0 && (
        <section className="relative h-[40vh] overflow-hidden bg-arena">
          <img src={catImages[tipo][0]} alt={categoryName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">{categoryName}</h1>
          </div>
        </section>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-negro-suave mb-8">
        {t('titulo')}
      </h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href={`/productos`}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !tipo
              ? 'bg-terracota text-white'
              : 'bg-arena text-negro-suave hover:bg-arena/80'
          }`}
        >
          {t('filtro_todas')}
        </Link>
        {types.map((type: any) => (
          <Link
            key={type.slug}
            href={`/productos?tipo=${encodeURIComponent(type.slug)}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tipo === type.slug
                ? 'bg-terracota text-white'
                : 'bg-arena text-negro-suave hover:bg-arena/80'
            }`}
          >
            {locale === 'es' ? type.nombre_es : type.nombre_en}
          </Link>
        ))}
      </div>

      <Suspense fallback={<div className="text-center py-12 text-muted">Cargando...</div>}>
        <ProductGrid models={models} locale={locale} />
      </Suspense>
    </div>
    </>
  )
}
