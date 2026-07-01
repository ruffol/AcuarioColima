'use client'

import { useEffect, useRef, useState } from 'react'

const FB_SDK_URL = 'https://connect.facebook.net/es_ES/sdk.js#xfbml=1&version=v22.0'
const SCRIPT_ID = 'facebook-jssdk'
const MAX_RETRIES = 30
const RETRY_INTERVAL = 300

export default function FacebookFeed() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const cancelledRef = useRef(false)
  const url = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL || ''

  useEffect(() => {
    if (!url) return

    cancelledRef.current = false
    let retryCount = 0

    const ensureSDK = (): Promise<void> =>
      new Promise((resolve, reject) => {
        if (typeof FB !== 'undefined' && FB.XFBML) {
          resolve()
          return
        }

        if (document.getElementById(SCRIPT_ID)) {
          const check = setInterval(() => {
            if (cancelledRef.current) {
              clearInterval(check)
              reject(new Error('cancelled'))
              return
            }
            if (typeof FB !== 'undefined' && FB.XFBML) {
              clearInterval(check)
              resolve()
            }
            if (++retryCount > MAX_RETRIES) {
              clearInterval(check)
              reject(new Error('timeout'))
            }
          }, RETRY_INTERVAL)
          return
        }

        if (!document.getElementById('fb-root')) {
          const root = document.createElement('div')
          root.id = 'fb-root'
          document.body.prepend(root)
        }

        const script = document.createElement('script')
        script.id = SCRIPT_ID
        script.src = FB_SDK_URL
        script.async = true
        script.defer = true
        script.crossOrigin = 'anonymous'
        script.onload = () => {
          const check = setInterval(() => {
            if (cancelledRef.current) {
              clearInterval(check)
              reject(new Error('cancelled'))
              return
            }
            if (typeof FB !== 'undefined' && FB.XFBML) {
              clearInterval(check)
              resolve()
            }
            if (++retryCount > MAX_RETRIES) {
              clearInterval(check)
              reject(new Error('timeout'))
            }
          }, RETRY_INTERVAL)
        }
        script.onerror = () => reject(new Error('load-failed'))
        document.body.appendChild(script)
      })

    const init = async () => {
      try {
        await ensureSDK()
        if (cancelledRef.current || !containerRef.current) return

        FB.XFBML.parse(containerRef.current, () => {
          if (!cancelledRef.current) setStatus('ready')
        })
      } catch {
        if (!cancelledRef.current) setStatus('error')
      }
    }

    init()

    return () => {
      cancelledRef.current = true
    }
  }, [url])

  if (!url) return null

  return (
    <section
      aria-label="Últimas publicaciones de Facebook"
      className="relative min-h-[400px]"
    >
      <div
        ref={containerRef}
        className="fb-page w-full"
        data-href={url}
        data-tabs="timeline"
        data-width=""
        data-height="800"
        data-small-header="false"
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="false"
        data-lazy="true"
      >
        <blockquote cite={url} className="fb-xfbml-parse-ignore">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            AcuarioColima
          </a>
        </blockquote>
      </div>

      {status === 'loading' && (
        <div
          className="absolute inset-0 bg-card rounded-2xl border border-border overflow-hidden"
          role="status"
          aria-label="Cargando publicaciones de Facebook"
        >
          <div className="animate-pulse p-6 space-y-5">
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
        </div>
      )}

      {status === 'error' && (
        <div
          className="bg-card rounded-2xl border border-border p-8 text-center"
          role="alert"
        >
          <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center mx-auto mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-muted"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <p className="text-muted text-sm">
            No se pudieron cargar las publicaciones de Facebook.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            Intentar de nuevo
          </button>
        </div>
      )}
    </section>
  )
}
