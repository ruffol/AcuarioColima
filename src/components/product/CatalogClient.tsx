'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import ProductCard from './ProductCard'
import type { Model } from '@/types'

interface UnifiedProduct {
  id: string
  source: 'model' | 'product'
  slug: string
  nombre_es: string
  nombre_en: string
  descripcion_es: string | null
  descripcion_en: string | null
  precio_mxn: number
  precio_usd: number
  stock: number
  image: string | null
  tipo: string
  category: string | null
  water_type?: string
  difficulty?: string
}

interface Props {
  locale: string
  initialProducts?: UnifiedProduct[]
  initialTypes?: { slug: string; nombre_es: string; nombre_en: string }[]
  initialCategories?: { slug: string; nombre_es: string; nombre_en: string }[]
}

export default function CatalogClient({ locale, initialProducts, initialTypes, initialCategories }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [products, setProducts] = useState<UnifiedProduct[]>(initialProducts || [])
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState(searchParams.get('busqueda') || '')
  const [showFilters, setShowFilters] = useState(false)

  const activeTipo = searchParams.get('tipo') || ''
  const activeAgua = searchParams.get('agua') || ''
  const activeDiff = searchParams.get('dificultad') || ''
  const activeBusqueda = searchParams.get('busqueda') || ''
  const activePrecioMin = searchParams.get('precio_min') || ''
  const activePrecioMax = searchParams.get('precio_max') || ''

  const fetchProducts = useCallback(async (params: Record<string, string>) => {
    setLoading(true)
    const qs = new URLSearchParams(params).toString()
    const res = await fetch(`/api/products/search?${qs}`)
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }, [])

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, val] of Object.entries(updates)) {
      if (val) params.set(key, val)
      else params.delete(key)
    }
    fetchProducts(Object.fromEntries(params.entries()))
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, pathname, router, fetchProducts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ busqueda: searchInput, tipo: activeTipo, agua: activeAgua, dificultad: activeDiff, precio_min: activePrecioMin, precio_max: activePrecioMax })
  }

  const clearFilters = () => {
    setSearchInput('')
    setProducts(initialProducts || [])
    router.push(pathname, { scroll: false })
  }

  const types = [
    { slug: '', nombre_es: 'Todos', nombre_en: 'All' },
    ...(initialTypes || []).map((t) => ({ slug: t.slug, nombre_es: t.nombre_es, nombre_en: t.nombre_en })),
    { slug: 'pez', nombre_es: 'Peces', nombre_en: 'Fish' },
    { slug: 'accesorio', nombre_es: 'Accesorios', nombre_en: 'Accessories' },
  ]

  const hasActiveFilters = activeTipo || activeAgua || activeDiff || activeBusqueda || activePrecioMin || activePrecioMax

  const title = activeTipo
    ? types.find((t) => t.slug === activeTipo)?.[locale === 'es' ? 'nombre_es' : 'nombre_en'] || 'Productos'
    : (locale === 'es' ? 'Productos' : 'Products')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={locale === 'es' ? 'Buscar productos...' : 'Search products...'}
            className="flex-1 px-4 py-3 rounded-xl border border-arena bg-card text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracota/50"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-terracota text-white font-medium text-sm hover:bg-terracota/90 transition-colors"
          >
            {locale === 'es' ? 'Buscar' : 'Search'}
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-terracota text-white border-terracota'
                : 'border-arena text-muted hover:bg-arena'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-card border border-arena rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category filter */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                {locale === 'es' ? 'Categoría' : 'Category'}
              </label>
              <select
                value={activeTipo}
                onChange={(e) => updateParams({ tipo: e.target.value, agua: activeAgua, dificultad: activeDiff, busqueda: activeBusqueda, precio_min: activePrecioMin, precio_max: activePrecioMax })}
                className="w-full px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm"
              >
                {types.filter((t) => t.slug).map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {locale === 'es' ? t.nombre_es : t.nombre_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Water type filter (only for fish) */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                {locale === 'es' ? 'Tipo de agua' : 'Water type'}
              </label>
              <select
                value={activeAgua}
                onChange={(e) => updateParams({ agua: e.target.value, tipo: activeTipo || 'pez', dificultad: activeDiff, busqueda: activeBusqueda, precio_min: activePrecioMin, precio_max: activePrecioMax })}
                className="w-full px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm"
              >
                <option value="">{locale === 'es' ? 'Todas' : 'All'}</option>
                <option value="dulce">{locale === 'es' ? 'Dulce' : 'Fresh'}</option>
                <option value="salada">{locale === 'es' ? 'Salada' : 'Salt'}</option>
                <option value="salobre">{locale === 'es' ? 'Salobre' : 'Brackish'}</option>
              </select>
            </div>

            {/* Difficulty filter */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                {locale === 'es' ? 'Dificultad' : 'Difficulty'}
              </label>
              <select
                value={activeDiff}
                onChange={(e) => updateParams({ dificultad: e.target.value, tipo: activeTipo || 'pez', agua: activeAgua, busqueda: activeBusqueda, precio_min: activePrecioMin, precio_max: activePrecioMax })}
                className="w-full px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm"
              >
                <option value="">{locale === 'es' ? 'Todas' : 'All'}</option>
                <option value="fácil">{locale === 'es' ? 'Fácil' : 'Easy'}</option>
                <option value="media">{locale === 'es' ? 'Media' : 'Medium'}</option>
                <option value="difícil">{locale === 'es' ? 'Difícil' : 'Hard'}</option>
                <option value="experto">{locale === 'es' ? 'Experto' : 'Expert'}</option>
              </select>
            </div>

            {/* Price range */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                {locale === 'es' ? 'Precio (MXN)' : 'Price (MXN)'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={activePrecioMin}
                  onChange={(e) => {
                    const val = e.target.value
                    setTimeout(() => updateParams({ precio_min: val, precio_max: activePrecioMax, tipo: activeTipo, agua: activeAgua, dificultad: activeDiff, busqueda: activeBusqueda }), 300)
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm placeholder:text-muted"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={activePrecioMax}
                  onChange={(e) => {
                    const val = e.target.value
                    setTimeout(() => updateParams({ precio_max: val, precio_min: activePrecioMin, tipo: activeTipo, agua: activeAgua, dificultad: activeDiff, busqueda: activeBusqueda }), 300)
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm placeholder:text-muted"
                />
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-arena">
              <p className="text-sm text-muted">
                {locale === 'es'
                  ? `${products.length} resultado${products.length !== 1 ? 's' : ''}`
                  : `${products.length} result${products.length !== 1 ? 's' : ''}`}
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-terracota hover:text-terracota/80 transition-colors"
              >
                {locale === 'es' ? 'Limpiar filtros' : 'Clear filters'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-arena rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-arena" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-arena rounded w-3/4" />
                <div className="h-3 bg-arena rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-muted mb-2">
            {locale === 'es' ? 'Sin resultados' : 'No results'}
          </p>
          <p className="text-sm text-muted">
            {locale === 'es'
              ? 'Intenta con otros filtros o términos de búsqueda'
              : 'Try different filters or search terms'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-4 text-sm text-terracota hover:text-terracota/80">
              {locale === 'es' ? 'Limpiar filtros' : 'Clear filters'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              model={p as unknown as Model}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  )
}
