import { getTranslations } from 'next-intl/server'
import { Link, locales } from '@/i18n/routing'
import Button from '@/components/ui/Button'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'About' })
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tlalchichi.xyz'
  const currentUrl = `${baseUrl}/${locale}/nosotros`
  const desc = locale === 'es'
    ? 'Descubre el origen y significado de los Tlalchichis, los perros de tierra de Colima. Arte prehispánico hecho a mano con tradición milenaria.'
    : 'Discover the origin and meaning of Tlalchichis, the dogs of the earth from Colima. Pre-Hispanic art handmade with millenary tradition.'

  const alternateLanguages: Record<string, string> = {}
  for (const l of locales) {
    alternateLanguages[l] = `${baseUrl}/${l}/nosotros`
  }
  alternateLanguages['x-default'] = `${baseUrl}/es/nosotros`

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

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'About' })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-negro-suave mb-4 tracking-tight leading-[1.1]">
          {t('titulo')}
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          {t('subtitulo')}
        </p>
      </div>

      {/* Intro */}
      <div className="prose prose-stone mx-auto mb-16 space-y-6">
        <p className="text-lg text-muted leading-relaxed">
          {t('intro')}
        </p>
        <p className="text-lg text-muted leading-relaxed">
          {t('intro_2')}
        </p>
      </div>

      {/* Key Facts Grid */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-negro-suave mb-8 text-center tracking-tight">
          {t('datos_titulo')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: t('dato_nombre'), value: t('dato_nombre_valor') },
            { label: t('dato_traduccion'), value: t('dato_traduccion_valor') },
            { label: t('dato_region'), value: t('dato_region_valor') },
            { label: t('dato_periodo'), value: t('dato_periodo_valor') },
            { label: t('dato_cultura'), value: t('dato_cultura_valor') },
          ].map((dato) => (
            <div
              key={dato.label}
              className="bg-card border border-card rounded-xl p-5"
            >
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
                {dato.label}
              </p>
              <p className="text-lg font-semibold text-negro-suave">
                {dato.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Spiritual Meaning */}
      <section className="mb-16 bg-arena-light rounded-2xl p-8 md:p-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-negro-suave mb-6 tracking-tight">
            {t('espiritual_titulo')}
          </h2>
          <div className="space-y-4">
            <p className="text-lg text-muted leading-relaxed">
              {t('espiritual_texto')}
            </p>
            <p className="text-lg text-muted leading-relaxed">
              {t('espiritual_texto_2')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission + Process */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-card border border-card rounded-xl p-8">
          <h2 className="text-xl font-bold text-negro-suave mb-4 tracking-tight">
            {t('mision_titulo')}
          </h2>
          <p className="text-muted leading-relaxed">
            {t('mision_texto')}
          </p>
        </div>
        <div className="bg-card border border-card rounded-xl p-8">
          <h2 className="text-xl font-bold text-negro-suave mb-4 tracking-tight">
            {t('proceso_titulo')}
          </h2>
          <p className="text-muted leading-relaxed">
            {t('proceso_texto')}
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="text-center mb-16">
        <h2 className="text-2xl font-bold text-negro-suave mb-6 tracking-tight">
          {t('valores_titulo')}
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {(t.raw('valores_lista') as string[]).map((valor: string) => (
            <span
              key={valor}
              className="px-5 py-2.5 bg-badge text-muted rounded-full text-sm font-medium"
            >
              {valor}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link href="/productos">
          <Button size="lg">{t('cta')}</Button>
        </Link>
      </div>
    </div>
  )
}
