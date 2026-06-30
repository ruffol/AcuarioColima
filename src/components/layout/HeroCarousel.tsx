'use client'

import { useState, useEffect, useCallback } from 'react'
import { Link } from '@/i18n/routing'

const images = [
  '/img/carrucel/tlalchichi-parado-colima.png',
  '/img/carrucel/tlalchichi-sentado-colima.png',
  '/img/carrucel/tlalchichi-viejo-sentado-colima.png',
  '/img/carrucel/tlalchichi-acostado-colima.png',
  '/img/carrucel/tlalchichi-mazorca-colima.png',
  '/img/carrucel/tlalchichi-mascara-colima.png',
  '/img/carrucel/tlalchichi-joven-viejo-colima.png',
  '/img/carrucel/tlalchichi-acostado-mediano-colima.png',
  '/img/carrucel/tlalchichi-mascara-danza-colima.png',
  '/img/carrucel/tlalchichi-mazorca-abundancia-colima.png',
  '/img/carrucel/tlalchichi-parado-guardian-colima.png',
  '/img/carrucel/tlalchichi-sentado-miniatura-colima.png',
  '/img/carrucel/tlalchichi-viejo-sentado-color-colima.png',
]

const alts = [
  'Tlalchichi parado artesanal de Colima',
  'Tlalchichi sentado artesanal de Colima',
  'Tlalchichi viejo sentado artesanal de Colima',
  'Tlalchichi acostado artesanal de Colima',
  'Tlalchichi con mazorca artesanal de Colima',
  'Tlalchichi con máscara artesanal de Colima',
  'Tlalchichi joven-viejo artesanal de Colima',
  'Tlalchichi acostado mediano artesanal de Colima',
  'Tlalchichi con máscara de danza artesanal de Colima',
  'Tlalchichi con mazorca de abundancia artesanal de Colima',
  'Tlalchichi parado guardián artesanal de Colima',
  'Tlalchichi sentado miniatura artesanal de Colima',
  'Tlalchichi viejo sentado color artesanal de Colima',
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrent(index)
    setTimeout(() => setIsTransitioning(false), 700)
  }, [isTransitioning])

  const next = useCallback(() => {
    goTo((current + 1) % images.length)
  }, [current, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + images.length) % images.length)
  }, [current, goTo])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* Contenedor del carrusel */}
      <div className="relative h-[50vh] sm:h-[65vh] md:h-[75vh] lg:h-[85vh]">
        {images.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              i === current
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
          >
            {/* Imagen de fondo */}
            <img
              src={src}
              alt={alts[i]}
              className="w-full h-full object-contain"
              loading={i === 0 ? 'eager' : 'lazy'}
            />

            {/* Gradiente inferior */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
          </div>
        ))}

        {/* Texto superpuesto */}
        <div className="absolute bottom-12 sm:bottom-20 left-0 right-0 z-10 text-center px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-4 tracking-tight leading-[1.1] drop-shadow-sm">
              Tlalchichi Store
            </h1>
            <p className="text-base sm:text-lg text-muted mb-8 max-w-xl mx-auto">
              Figuras de Tlalchichis — Hecho en Colima con amor y tradición
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/productos"
                className="inline-flex items-center px-6 py-3 bg-terracota text-white font-medium rounded-xl hover:bg-terracota-dark transition-colors shadow-lg shadow-terracota/25"
              >
                Ver productos
              </Link>
              <Link
                href="/nosotros"
                className="inline-flex items-center px-6 py-3 bg-card border border-arena text-foreground font-medium rounded-xl hover:bg-arena transition-colors"
              >
                Nuestra Historia
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Controles: anterior / siguiente */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm border border-arena flex items-center justify-center text-foreground hover:bg-card transition-colors"
        aria-label="Anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm border border-arena flex items-center justify-center text-foreground hover:bg-card transition-colors"
        aria-label="Siguiente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === current
                ? 'bg-terracota w-6'
                : 'bg-muted/40 hover:bg-muted/60'
            }`}
            aria-label={`Ir a imagen ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
