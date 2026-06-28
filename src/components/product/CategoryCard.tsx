'use client'

import { useState, useEffect, useCallback } from 'react'
import { Link } from '@/i18n/routing'

interface Props {
  slug: string
  nombre: string
  imagenes: string[]
}

export default function CategoryCard({ slug, nombre, imagenes }: Props) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % (imagenes.length || 1))
  }, [imagenes.length])

  useEffect(() => {
    if (imagenes.length <= 1) return
    const timer = setInterval(next, 3500)
    return () => clearInterval(timer)
  }, [next, imagenes.length])

  if (!imagenes.length) {
    return (
      <Link
        href={`/productos?tipo=${slug}`}
        className="flex flex-col items-center justify-center gap-3 p-10 bg-card border border-arena rounded-2xl hover:border-terracota/50 hover:shadow-lg transition-all duration-300 min-h-[280px]"
      >
        <span className="text-lg font-semibold text-foreground">{nombre}</span>
        <span className="text-sm text-muted">Ver productos →</span>
      </Link>
    )
  }

  return (
    <Link
      href={`/productos?tipo=${slug}`}
      className="group block bg-card border border-arena rounded-2xl overflow-hidden hover:border-terracota/50 hover:shadow-lg transition-all duration-300"
    >
      {/* Mini carrusel */}
      <div className="relative aspect-[4/3] overflow-hidden bg-arena">
        {imagenes.map((img, i) => (
          <img
            key={img}
            src={img}
            alt={`${nombre} ${i + 1}`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
              i === current ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            }`}
          />
        ))}
        {/* Gradiente inferior */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      {/* Info */}
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-terracota transition-colors">
          {nombre}
        </h3>
        <p className="text-sm text-muted mt-1">Ver productos →</p>
      </div>
    </Link>
  )
}
