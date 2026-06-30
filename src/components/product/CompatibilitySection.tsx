'use client'

interface CompatibleProduct {
  id: number
  nombre_es: string
  nombre_en: string
  images: string[]
  precio_mxn: number
}

interface Props {
  products: CompatibleProduct[]
  locale: string
}

export default function CompatibilitySection({ products, locale }: Props) {
  if (!products.length) return null

  return (
    <div className="bg-arena/50 rounded-2xl p-6">
      <h2 className="font-semibold text-negro-suave mb-4">Peces compatibles</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {products.map((p) => {
          const name = locale === 'es' ? p.nombre_es : p.nombre_en
          const img = Array.isArray(p.images) ? p.images[0] : (typeof p.images === 'string' ? JSON.parse(p.images)[0] : null)
          return (
            <a
              key={p.id}
              href={`/${locale}/producto/${p.nombre_en?.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-card border border-arena rounded-xl p-3 hover:border-terracota/30 transition-colors"
            >
              <div className="aspect-square bg-arena rounded-lg overflow-hidden mb-2">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-xs">🐟</div>
                )}
              </div>
              <p className="text-xs font-medium truncate">{name}</p>
              <p className="text-xs text-terracota">${p.precio_mxn} MXN</p>
            </a>
          )
        })}
      </div>
    </div>
  )
}
