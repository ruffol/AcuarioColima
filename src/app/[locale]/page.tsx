import { getTranslations } from 'next-intl/server'
import { getProductTypes } from '@/lib/db'
import { getCategories } from '@/lib/repositories/categories'
import { getProducts } from '@/lib/repositories/products'
import { CATEGORY_IMAGES } from '@/lib/constants'
import Hero from '@/components/layout/Hero'
import CategoryCard from '@/components/product/CategoryCard'
import ProductCard from '@/components/product/ProductCard'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HomePage' })
  const types = getProductTypes()
  const categories = getCategories()
  const featuredProducts = getProducts({ destacado: true, activo: true, limit: 6 })

  return (
    <>
      <Hero locale={locale} />

      {/* Category cards */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-heading)] tracking-tight">
              {locale === 'es' ? 'Categorías' : 'Categories'}
            </h2>
            <p className="text-muted max-w-md mx-auto text-sm">
              {locale === 'es'
                ? 'Explora nuestras categorías y encuentra todo para tu acuario'
                : 'Explore our categories and find everything for your aquarium'}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {categories.map((cat: any) => (
              <CategoryCard
                key={cat.id}
                slug={cat.slug}
                nombre={locale === 'es' ? cat.nombre_es : cat.nombre_en}
                imagenes={[]}
                icon={cat.icon}
              />
            ))}
            {types.map((type: any) => (
              <CategoryCard
                key={type.slug}
                slug={type.slug}
                nombre={locale === 'es' ? type.nombre_es : type.nombre_en}
                imagenes={CATEGORY_IMAGES[type.slug] || []}
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <section className="bg-surface py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-heading)] tracking-tight">
                {locale === 'es' ? 'Productos destacados' : 'Featured Products'}
              </h2>
              <p className="text-muted max-w-md mx-auto text-sm">
                {locale === 'es'
                  ? 'Los favoritos de nuestra comunidad'
                  : 'Our community favorites'}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
              {featuredProducts.map((p: any) => (
                <ProductCard key={p.id} model={p} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter / About section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 font-[family-name:var(--font-heading)] tracking-tight">
            {t('historia_titulo')}
          </h2>
          <p className="text-muted leading-relaxed text-sm">
            {t('historia_texto')}
          </p>
        </div>
      </section>
    </>
  )
}
