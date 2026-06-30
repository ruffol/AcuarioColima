import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getPostBySlug } from '@/lib/repositories/blog'
import { locales } from '@/i18n/routing'
import { Link } from '@/i18n/routing'
import Breadcrumb from '@/components/ui/Breadcrumb'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Artículo no encontrado' }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tlalchichi.xyz'
  const title = locale === 'es' ? post.title_es : post.title_en
  const desc = locale === 'es' ? post.excerpt_es : post.excerpt_en
  const currentUrl = `${baseUrl}/${locale}/blog/${post.slug}`

  const alternateLanguages: Record<string, string> = {}
  for (const l of locales) {
    alternateLanguages[l] = `${baseUrl}/${l}/blog/${post.slug}`
  }
  alternateLanguages['x-default'] = `${baseUrl}/es/blog/${post.slug}`

  return {
    title,
    description: desc || title,
    alternates: { canonical: currentUrl, languages: alternateLanguages },
    openGraph: {
      title,
      description: desc || '',
      url: currentUrl,
      siteName: 'Premium Nature',
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'article',
      publishedTime: post.created_at,
      images: post.image ? [{ url: post.image }] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'Blog' })
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const title = locale === 'es' ? post.title_es : post.title_en
  const content = locale === 'es' ? post.content_es : post.content_en
  const excerpt = locale === 'es' ? post.excerpt_es : post.excerpt_en
  const date = new Date(post.created_at).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Breadcrumb items={[
        { label: 'Inicio', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: title },
      ]} />

      <div className="mt-8 mb-12">
        <div className="flex items-center gap-3 text-sm text-muted mb-4">
          {post.author && (
            <span>{t('por')} {post.author}</span>
          )}
          <span>·</span>
          <span>{t('publicado')} {date}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-[family-name:var(--font-heading)] tracking-tight leading-tight mb-6">
          {title}
        </h1>

        {excerpt && (
          <p className="text-lg text-muted leading-relaxed">{excerpt}</p>
        )}
      </div>

      {post.image && (
        <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-12 bg-surface">
          <img src={post.image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none
        prose-headings:font-[family-name:var(--font-heading)] prose-headings:tracking-tight prose-headings:text-foreground
        prose-p:text-muted prose-p:leading-relaxed
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-foreground
        prose-code:text-primary prose-code:bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg
        prose-pre:bg-surface prose-pre:border prose-pre:border-border
        prose-img:rounded-2xl
        prose-blockquote:border-primary prose-blockquote:text-muted
        prose-li:text-muted
        leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-surface text-muted border border-border">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('volver')}
        </Link>
      </div>
    </article>
  )
}
