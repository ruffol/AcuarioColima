'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { useCartStore, getItemCount } from '@/store/cart'
import { useState, useRef, useEffect } from 'react'
import LanguageToggle from './LanguageToggle'
import ThemeToggle from './ThemeToggle'
import MobileMenu from './MobileMenu'

export default function Header() {
  const t = useTranslations('Navbar')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const items = useCartStore((s) => s.items)
  const openCart = useCartStore((s) => s.openCart)
  const count = getItemCount(items)
  const router = useRouter()
  const pathname = usePathname()
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/productos?busqueda=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-40" style={{ background: 'rgba(10,15,30,0.55)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4FC3F7] to-[#10B981] flex items-center justify-center shadow-lg shadow-[#4FC3F7]/20 group-hover:shadow-[#4FC3F7]/40 transition-shadow">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
              </svg>
            </div>
            <span className="text-lg font-bold font-[family-name:var(--font-heading)] text-white tracking-tight hidden sm:block">
              Premium Nature
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/' ? 'text-white bg-white/10' : 'text-blue-200/60 hover:text-white hover:bg-white/5'}`}>
              {t('inicio')}
            </Link>
            <Link href="/productos" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/productos' || pathname.startsWith('/producto/') ? 'text-white bg-white/10' : 'text-blue-200/60 hover:text-white hover:bg-white/5'}`}>
              {t('productos')}
            </Link>
            <Link href="/productos?tipo=pez" className="px-3 py-2 rounded-lg text-sm font-medium text-blue-200/60 hover:text-white hover:bg-white/5 transition-colors">
              Peces
            </Link>
            <Link href="/productos?tipo=accesorio" className="px-3 py-2 rounded-lg text-sm font-medium text-blue-200/60 hover:text-white hover:bg-white/5 transition-colors">
              Accesorios
            </Link>
            <Link href="/blog" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/blog' || pathname.startsWith('/blog/') ? 'text-white bg-white/10' : 'text-blue-200/60 hover:text-white hover:bg-white/5'}`}>
              {t('blog')}
            </Link>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-1">
            {/* Desktop search */}
            <div className="hidden lg:block relative">
              <form onSubmit={handleSearch}>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('buscar') || 'Buscar...'}
                  className="w-48 xl:w-64 px-3 py-2 pl-9 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-blue-300/30 focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]/30 focus:border-[#4FC3F7]/40 transition-all"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/30 pointer-events-none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </form>
            </div>

            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="lg:hidden p-2 text-blue-200/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              aria-label="Buscar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            <ThemeToggle />
            <LanguageToggle />

            {/* Favorites */}
            <Link href="/favoritos" className="hidden sm:flex p-2 text-blue-200/60 hover:text-white transition-colors rounded-lg hover:bg-white/5" aria-label="Favoritos">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-blue-200/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              aria-label={t('carrito')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#4FC3F7] to-[#22D3EE] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-[0_0_0_2px_rgba(10,15,30,0.55)]">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-blue-200/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              aria-label="Menú"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search bar (below header) */}
        {searchOpen && (
          <div className="lg:hidden pb-3 animate-fade-in">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('buscar') || 'Buscar productos...'}
                  className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-blue-300/30 focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]/30"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/30">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
            </form>
          </div>
        )}
      </div>
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  )
}
