import { getTranslations } from 'next-intl/server'
import { getPosts } from '@/lib/repositories/blog'
import { locales } from '@/i18n/routing'
import dynamic from 'next/dynamic'
import BlogCard from './BlogCard'

const FACEBOOK_PAGE_URL = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL || ''

const FacebookFeed = dynamic(() => import('@/components/FacebookFeed'), {
  ssr: false,
  loading: () => (
    <div className="bg-card rounded-2xl border border-border p-6 animate-pulse space-y-5" role="status" aria-label="Cargando publicaciones de Facebook">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-surface-hover" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-1/3 rounded bg-surface-hover" />
          <div className="h-2.5 w-1/5 rounded bg-surface-hover" />
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="h-2.5 w-full rounded bg-surface-hover" />
        <div className="h-2.5 w-5/6 rounded bg-surface-hover" />
        <div className="h-2.5 w-2/3 rounded bg-surface-hover" />
      </div>
      <div className="h-48 w-full rounded-xl bg-surface-hover" />
      <div className="flex gap-2">
        <div className="h-8 w-16 rounded-lg bg-surface-hover" />
        <div className="h-8 w-16 rounded-lg bg-surface-hover" />
      </div>
    </div>
  ),
})

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Blog' })
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tlalchichi.xyz'
  const currentUrl = `${baseUrl}/${locale}/blog`

  const alternateLanguages: Record<string, string> = {}
  for (const l of locales) {
    alternateLanguages[l] = `${baseUrl}/${l}/blog`
  }
  alternateLanguages['x-default'] = `${baseUrl}/es/blog`

  return {
    title: t('titulo'),
    description: t('subtitulo'),
    alternates: { canonical: currentUrl, languages: alternateLanguages },
    openGraph: {
      title: t('titulo'),
      description: t('subtitulo'),
      url: currentUrl,
      siteName: 'AcuarioColima',
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
    },
  }
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Blog' })
  const posts = getPosts(true)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground font-[family-name:var(--font-heading)] tracking-tight mb-3">
          {t('titulo')}
        </h1>
        <p className="text-muted max-w-lg mx-auto">{t('subtitulo')}</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-muted">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p className="text-foreground font-medium">{t('sin_articulos')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      )}

      <section aria-labelledby="facebook-feed-heading" className="mt-20">
        <div className="flex items-center justify-between mb-6">
          <h2
            id="facebook-feed-heading"
            className="text-2xl font-bold text-foreground font-[family-name:var(--font-heading)] tracking-tight"
          >
            Últimas publicaciones
          </h2>
          {FACEBOOK_PAGE_URL && (
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline font-medium transition-colors flex items-center gap-1.5"
            >
              Ver todas las publicaciones
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          )}
        </div>
        <FacebookFeed />
      </section>
    </div>
  )
}
