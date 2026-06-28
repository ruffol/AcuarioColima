import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { getProductTypes } from '@/lib/db'
import HeroCarousel from '@/components/layout/HeroCarousel'
import CategoryCard from '@/components/product/CategoryCard'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HomePage' })
  const types = getProductTypes()

  const catImages: Record<string, string[]> = {
    llaveros: ['/img/productos/llaveros/Llavero-tlalchichi-sentado-colima.png', '/img/productos/llaveros/Llavero-tlalchichi-parado-colima.png', '/img/productos/llaveros/Llavero-tlalchichi-joven-viejo-colima.png', '/img/productos/llaveros/varios1.png', '/img/productos/llaveros/varios2.png'],
    portamacetas: ['/img/productos/portamacetas/tlalchichi-acostado-colima.png', '/img/productos/portamacetas/tlalchichi-acostado-mediano-colima.png', '/img/productos/portamacetas/tlalchichi-sentado-colima.png'],
    alcacias: ['/img/productos/alcacias/tlalchichi-sentado-colima.png', '/img/productos/alcacias/tlalchichi-viejo-sentado-colima.png', '/img/productos/alcacias/tlalchichi-mascara-colima.png'],
    cuencos: ['/img/productos/cuencos/tlalchichi-mazorca-colima.png', '/img/productos/cuencos/tlalchichi-viejo-sentado-color-colima.png'],
  }

  return (
    <>
      <HeroCarousel />

      {types.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12 tracking-tight">
            Categorías
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {types.map((type: any) => (
              <CategoryCard
                key={type.slug}
                slug={type.slug}
                nombre={locale === 'es' ? type.nombre_es : type.nombre_en}
                imagenes={catImages[type.slug] || []}
              />
            ))}
          </div>
        </section>
      )}

      <section className="py-24" style={{ background: 'var(--bg-arena-light)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 tracking-tight">
              {t('historia_titulo')}
            </h2>
            <p className="text-lg text-muted leading-relaxed">
              {t('historia_texto')}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
