'use client'

import { useState } from 'react'
import AddToCartButton from './AddToCartButton'
import type { CartItemVariant } from '@/types'

interface ColorOption {
  nombre_es: string
  nombre_en: string
  hex: string
  imagen: string
}

interface Props {
  model: any
  locale: string
  source?: 'model' | 'product'
}

export default function ClientWrapper({ model, locale, source = 'model' }: Props) {
  if (source === 'product') {
    const variant: CartItemVariant = {
      modelId: String(model.id),
      modelSlug: model.slug,
      nombre_es: model.nombre_es,
      nombre_en: model.nombre_en,
      typeId: String(model.category_id || ''),
      typeSlug: model.tipo || '',
      typeNombreEs: model.tipo === 'pez' ? 'Pez' : 'Accesorio',
      typeNombreEn: model.tipo === 'pez' ? 'Fish' : 'Accessory',
      colorId: '0',
      colorSlug: '',
      colorNombreEs: '',
      colorNombreEn: '',
      colorHex: '#ccc',
      image: Array.isArray(model.images) ? model.images[0] || '' : '',
      precio_mxn: model.precio_mxn,
      precio_usd: model.precio_usd,
      stock: model.stock,
    }

    return (
      <div className="space-y-6">
        <div>
          <p className="text-3xl font-semibold text-terracota">
            {locale === 'es'
              ? `$${model.precio_mxn} MXN`
              : `$${model.precio_usd?.toFixed(2) || '0.00'} USD`}
          </p>
        </div>
        {model.stock > 0 ? (
          <AddToCartButton variant={variant} />
        ) : (
          <p className="text-amber-600 font-medium text-center py-4">Sin stock disponible</p>
        )}
      </div>
    )
  }

  const colors: ColorOption[] = Array.isArray(model.colores) ? model.colores : []
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0)
  const selectedColor = colors[selectedColorIndex]

  const variant: CartItemVariant = {
    modelId: String(model.id),
    modelSlug: model.slug,
    nombre_es: model.nombre_es,
    nombre_en: model.nombre_en,
    typeId: '1',
    typeSlug: model.categoria_es?.toLowerCase() || '',
    typeNombreEs: model.categoria_es || '',
    typeNombreEn: model.categoria_es || '',
    colorId: String(selectedColorIndex),
    colorSlug: selectedColor?.nombre_es?.toLowerCase().replace(/\s/g, '-') || '',
    colorNombreEs: selectedColor?.nombre_es || '',
    colorNombreEn: selectedColor?.nombre_en || '',
    colorHex: selectedColor?.hex || '#ccc',
    image: selectedColor?.imagen || model.imagenes?.[0] || '',
    precio_mxn: model.precio_mxn,
    precio_usd: model.precio_usd,
    stock: model.stock,
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-3xl font-semibold text-terracota">
          {locale === 'es'
            ? `$${model.precio_mxn} MXN`
            : `$${model.precio_usd?.toFixed(2) || '0.00'} USD`}
        </p>
        <p className="text-sm text-muted mt-1">Stock: {model.stock}</p>
      </div>

      {colors.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            Color
          </p>
          <div className="flex gap-3 flex-wrap">
            {colors.map((color, i) => (
              <button
                key={i}
                onClick={() => setSelectedColorIndex(i)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  i === selectedColorIndex
                    ? 'border-terracota ring-2 ring-terracota/30 scale-110'
                    : 'border-arena hover:border-muted'
                }`}
                title={locale === 'es' ? color.nombre_es : color.nombre_en}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
          <p className="text-sm text-muted mt-2">
            {locale === 'es' ? colors[selectedColorIndex]?.nombre_es : colors[selectedColorIndex]?.nombre_en}
          </p>
        </div>
      )}

      {variant && model.stock > 0 && (
        <AddToCartButton variant={variant} />
      )}
      {model.stock <= 0 && (
        <p className="text-amber-600 font-medium text-center py-4">Sin stock disponible</p>
      )}
    </div>
  )
}
