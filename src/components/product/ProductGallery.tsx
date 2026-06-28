'use client'

import { useState } from 'react'

interface Props {
  images: string[]
  principal: string | null
  nombre: string
  altTexts?: string[]
}

export default function ProductGallery({ images, principal, nombre, altTexts }: Props) {
  const allImages = [principal, ...images].filter(Boolean) as string[]
  const [selected, setSelected] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (allImages.length === 0) {
    return (
      <div className="aspect-square bg-arena rounded-3xl flex items-center justify-center text-negro-suave/20">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setLightbox(selected)}
        className="aspect-square bg-arena rounded-3xl overflow-hidden w-full cursor-zoom-in"
      >
        <img
          src={allImages[selected]}
          alt={altTexts?.[selected] || nombre}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </button>
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${
                i === selected ? 'border-terracota' : 'border-transparent hover:border-arena'
              }`}
            >
              <img src={img} alt={altTexts?.[i] || `${nombre} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={allImages[lightbox]}
            alt={altTexts?.[lightbox] || nombre}
            className="max-h-full max-w-full object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightbox(i) }}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === lightbox ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
