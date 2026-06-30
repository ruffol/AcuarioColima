'use client'

import { Link } from '@/i18n/routing'
import type { BlogPost } from '@/types'

interface Props {
  post: BlogPost
  locale: string
}

export default function BlogCard({ post, locale }: Props) {
  const title = locale === 'es' ? post.title_es : post.title_en
  const excerpt = locale === 'es' ? post.excerpt_es : post.excerpt_en
  const date = new Date(post.created_at).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-elevated transition-all duration-300"
    >
      <div className="aspect-[16/9] bg-surface overflow-hidden">
        {post.image ? (
          <img
            src={post.image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-5 space-y-2">
        <p className="text-xs text-muted">{date}</p>
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 font-[family-name:var(--font-heading)]">
          {title}
        </h3>
        {excerpt && (
          <p className="text-sm text-muted line-clamp-2 leading-relaxed">{excerpt}</p>
        )}
        <div className="flex items-center gap-2 pt-2">
          {post.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-muted border border-border">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
