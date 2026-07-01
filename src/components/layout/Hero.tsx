'use client'

import { useState, useEffect } from 'react'
import { Link, useRouter } from '@/i18n/routing'

interface Props {
  locale?: string
}

const trendingSearches = ['Betta', 'Guppy', 'Filtro', 'Pecera', 'Planta']

export default function Hero({ locale = 'es' }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/productos?busqueda=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <section className="relative overflow-hidden bg-[#071221]" style={{ minHeight: 'clamp(600px, 90vh, 900px)' }}>
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1583494939058-8c56ec0aecfa?w=1920&q=80)`,
          filter: 'brightness(0.4) saturate(0.8)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071221]/95 via-[#071221]/80 to-[#071221]/60" />

      {/* Light spots */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[#4FC3F7]/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#10B981]/5 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-[#22D3EE]/4 blur-[80px]" />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[inherit] py-24 lg:py-0">

          {/* Left column — Text */}
          <div className={`space-y-8 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[#4FC3F7] text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4FC3F7] animate-pulse" />
              Tienda especializada
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight leading-none font-[family-name:var(--font-heading)]">
              Crea el acuario
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4FC3F7] via-[#22D3EE] to-[#10B981]">
                de tus sueños
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-blue-100/60 max-w-lg leading-relaxed">
              Peces tropicales, plantas, peceras y accesorios premium. Todo lo que necesitas para convertir cualquier espacio en un ecosistema vivo.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar peces, plantas, accesorios..."
                  className="w-full px-4 py-3 pl-11 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]/40 focus:border-[#4FC3F7]/40 text-sm"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
            </form>

            {/* Trending searches */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-blue-300/40 font-medium">
                {locale === 'es' ? '🔥 Más buscados:' : '🔥 Trending:'}
              </span>
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => router.push(`/productos?busqueda=${term}`)}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-blue-200/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-3 pt-2">
              <Link
                href="/productos"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#4FC3F7] to-[#22D3EE] text-white font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-[#4FC3F7]/25 active:scale-[0.98]"
              >
                Comprar ahora
              </Link>
              <Link
                href="/productos?tipo=pez"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl border border-white/20 text-white/80 font-medium text-sm hover:bg-white/5 hover:border-white/30 hover:text-white transition-all"
              >
                Explorar especies
              </Link>
            </div>

          </div>

          {/* Right column — Visual */}
          <div className={`hidden lg:flex justify-center items-center ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="relative w-full max-w-md">
              {/* Floating product card */}
              <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
                {/* Product image area */}
                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-[#0F4C81]/30 to-[#10B981]/20 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl">🐠</span>
                    <p className="text-white/40 text-xs mt-2">Acuario Plantado</p>
                  </div>
                </div>

                {/* Product info */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-blue-200/50 uppercase tracking-wider">Producto del mes</p>
                    <p className="text-lg font-semibold text-white">Pez Japonés</p>
                  </div>
                  <span className="text-lg font-bold text-[#4FC3F7]">$60</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#f59e0b" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.71 1.452 1.44.977L10 15.09l4.092 2.542c.73.475 1.634-.164 1.44-.977l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>

                {/* Badges */}
                <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-[#10B981]/20 text-[#34D399] font-medium">☆☆☆☆☆ Envío gratis</span>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-[#4FC3F7]/20 text-[#4FC3F7] font-medium">Nuevo</span>
                </div>
              </div>

              {/* Decorative glow behind card */}
              <div className="absolute -inset-4 bg-gradient-to-br from-[#4FC3F7]/20 via-transparent to-[#10B981]/20 rounded-[32px] blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
