'use client'

import { Link } from '@/i18n/routing'
import type { Model } from '@/types'

interface Props {
  model: Model
  locale: string
}

export default function ProductCard({ model, locale }: Props) {
  const nombre = locale === 'es' ? model.nombre_es : model.nombre_en
  const imagen = model.imagenes?.[0] || ''

  return (
    <Link
      href={`/producto/${model.slug}`}
      className="group bg-card border border-card hover:border-arena/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
    >
      <div className="aspect-[4/5] bg-arena overflow-hidden">
        {imagen ? (
          <img
            src={imagen}
            alt={nombre}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4 space-y-1.5">
        <h3 className="font-medium text-negro-suave group-hover:text-terracota transition-colors line-clamp-2">
          {nombre}
        </h3>
      </div>
    </Link>
  )
}
