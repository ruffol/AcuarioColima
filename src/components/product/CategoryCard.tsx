'use client'

import { useState, useEffect, useCallback } from 'react'
import { Link } from '@/i18n/routing'

interface Props {
  slug: string
  nombre: string
  imagenes: string[]
  icon?: string | null
}

const GRADIENTS = [
  'from-primary/20 to-secondary/10',
  'from-success/20 to-primary/10',
  'from-secondary/20 to-success/10',
  'from-primary/30 to-surface',
]

export default function CategoryCard({ slug, nombre, imagenes, icon }: Props) {
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

  // Icon-based card (new Premium Nature style)
  if (icon && !imagenes.length) {
    return (
      <Link
        href={`/productos?category_slug=${slug}`}
        className="group relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl bg-gradient-to-br border border-border hover:border-primary/30 transition-all duration-300 min-h-[200px] overflow-hidden"
        style={{ backgroundImage: `var(--bg-gradient-${gradientIdx})` }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[gradientIdx]} opacity-50 group-hover:opacity-80 transition-opacity duration-300`} />
        <span className="relative text-3xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
        <span className="relative text-base font-semibold text-foreground font-[family-name:var(--font-heading)]">{nombre}</span>
        <span className="relative text-xs text-muted group-hover:text-primary transition-colors">Explorar →</span>
      </Link>
    )
  }

  // No images fallback
  if (!imagenes.length) {
    return (
      <Link
        href={`/productos?tipo=${slug}`}
        className="flex flex-col items-center justify-center gap-3 p-10 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-elevated transition-all duration-300 min-h-[280px]"
      >
        <span className="text-lg font-semibold text-foreground font-[family-name:var(--font-heading)]">{nombre}</span>
        <span className="text-sm text-muted">Ver productos →</span>
      </Link>
    )
  }

  // Image carousel card
  return (
    <Link
      href={`/productos?tipo=${slug}`}
      className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-elevated transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
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
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors font-[family-name:var(--font-heading)]">
          {nombre}
        </h3>
        <p className="text-sm text-muted mt-1">Ver productos →</p>
      </div>
    </Link>
  )
}
