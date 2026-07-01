'use client'

import dynamic from 'next/dynamic'

const FacebookFeedInner = dynamic(() => import('./FacebookFeedInner'), {
  ssr: false,
  loading: () => (
    <div
      className="bg-card rounded-2xl border border-border p-6 animate-pulse space-y-5"
      role="status"
      aria-label="Cargando publicaciones de Facebook"
    >
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

export default function FacebookFeed() {
  return <FacebookFeedInner />
}
