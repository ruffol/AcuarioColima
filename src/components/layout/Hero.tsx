'use client'

import { useState } from 'react'
import { Link, useRouter } from '@/i18n/routing'

interface Props {
  locale?: string
}

export default function Hero({ locale = 'es' }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/productos?busqueda=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1220] via-[#0F1B2E] to-[#0F4C81]">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-[url('/img/acuario-hero-bg.jpg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/60 to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            {locale === 'es' ? 'Tienda especializada' : 'Specialized Store'}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-6 font-[family-name:var(--font-heading)]">
            {locale === 'es' ? (
              <>
                Todo para tu acuario,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-success">
                  en un solo lugar
                </span>
              </>
            ) : (
              <>
                Everything for your aquarium,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-success">
                  in one place
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-blue-100/70 max-w-xl mx-auto mb-8 leading-relaxed">
            {locale === 'es'
              ? 'Peces tropicales, plantas, peceras, accesorios y todo lo que necesitas para crear el acuario de tus sueños.'
              : 'Tropical fish, plants, tanks, accessories, and everything you need to create your dream aquarium.'}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === 'es' ? 'Busca peces, plantas, accesorios...' : 'Search fish, plants, accessories...'}
                className="w-full px-5 py-3.5 pl-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50 text-sm"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200/50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors"
              >
                {locale === 'es' ? 'Buscar' : 'Search'}
              </button>
            </div>
          </form>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/productos"
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-secondary text-white font-medium text-sm hover:bg-secondary/90 transition-all hover:shadow-lg hover:shadow-secondary/25 active:scale-[0.98]"
            >
              {locale === 'es' ? 'Comprar ahora' : 'Shop now'}
            </Link>
            <Link
              href="/productos?tipo=pez"
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-all active:scale-[0.98]"
            >
              {locale === 'es' ? 'Explorar especies' : 'Explore species'}
            </Link>
          </div>

          {/* Quick category links */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
            {[
              { label: locale === 'es' ? '🐠 Peces tropicales' : '🐠 Tropical fish', href: '/productos?tipo=pez' },
              { label: locale === 'es' ? '🪴 Plantas' : '🪴 Plants', href: '/productos?busqueda=plantas' },
              { label: locale === 'es' ? '🏠 Peceras' : '🏠 Tanks', href: '/productos?busqueda=pecera' },
              { label: locale === 'es' ? '💧 Filtros' : '💧 Filters', href: '/productos?busqueda=filtro' },
              { label: locale === 'es' ? '🍤 Alimentos' : '🍤 Food', href: '/productos?busqueda=alimento' },
              { label: locale === 'es' ? '🪨 Decoración' : '🪨 Décor', href: '/productos?busqueda=decoracion' },
            ].map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-blue-100/70 text-xs hover:bg-white/10 hover:text-white transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
