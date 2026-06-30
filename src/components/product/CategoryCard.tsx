'use client'

import { useState, useEffect, useCallback } from 'react'
import { Link } from '@/i18n/routing'

interface Props {
  slug: string
  nombre: string
  imagenes: string[]
  icon?: string | null
  productCount?: number
}

const GRADIENTS = [
  'from-[#0F4C81]/40 via-[#0F4C81]/10 to-transparent',
  'from-[#10B981]/40 via-[#10B981]/10 to-transparent',
  'from-[#4FC3F7]/40 via-[#4FC3F7]/10 to-transparent',
  'from-[#22D3EE]/40 via-[#22D3EE]/10 to-transparent',
  'from-[#8B5CF6]/40 via-[#8B5CF6]/10 to-transparent',
  'from-[#F59E0B]/40 via-[#F59E0B]/10 to-transparent',
  'from-[#EF4444]/40 via-[#EF4444]/10 to-transparent',
  'from-[#EC4899]/40 via-[#EC4899]/10 to-transparent',
  'from-[#0F4C81]/40 via-[#10B981]/10 to-transparent',
  'from-[#4FC3F7]/40 via-[#22D3EE]/10 to-transparent',
]

const CATEGORY_IMAGES: Record<string, string> = {
  peces: 'https://images.unsplash.com/photo-1583494939058-8c56ec0aecfa?w=600&q=80',
  peceras: 'https://images.unsplash.com/photo-1597263481160-5af1e8e7b30f?w=600&q=80',
  plantas: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db1?w=600&q=80',
  filtros: 'https://images.unsplash.com/photo-1583485088034-697b5bc54cc3?w=600&q=80',
  alimentos: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80',
  decoracion: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',
  iluminacion: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&q=80',
  medicamentos: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
}

export default function CategoryCard({ slug, nombre, imagenes, icon, productCount }: Props) {
  const [current, setCurrent] = useState(0)
  const [gradientIdx] = useState(() => Math.floor(Math.random() * GRADIENTS.length))

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % (imagenes.length || 1))
  }, [imagenes.length])

  useEffect(() => {
    if (imagenes.length <= 1) return
    const timer = setInterval(next, 3500)
    return () => clearInterval(timer)
  }, [next, imagenes.length])

  const bgImage = imagenes[0] || CATEGORY_IMAGES[slug]
  const hasImage = !!bgImage

  return (
    <Link
      href={`/productos?category_slug=${slug}`}
      className="group relative block rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[#38BDF8]/40 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_25px_60px_rgba(0,0,0,0.35)] bg-[#0E172A]"
    >
      {/* Image or gradient */}
      <div className="aspect-[4/3] overflow-hidden relative">
        {hasImage ? (
          <>
            <img
              src={bgImage}
              alt={nombre}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071221]/90 via-[#071221]/30 to-transparent" />
          </>
        ) : (
          <>
            <div className={`w-full h-full bg-gradient-to-br ${GRADIENTS[gradientIdx]} group-hover:scale-105 transition-transform duration-700`} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071221]/60 to-transparent" />
          </>
        )}

        {/* Glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-[#38BDF8]/10 via-transparent to-transparent" />

        {/* Badge */}
        {productCount && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/70 font-medium">
              {productCount} {productCount === 1 ? 'producto' : 'productos'}
            </span>
          </div>
        )}

        {/* Hover indicator */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-white group-hover:text-[#38BDF8] transition-colors font-[family-name:var(--font-heading)]">
          {nombre}
        </h3>
      </div>
    </Link>
  )
}
