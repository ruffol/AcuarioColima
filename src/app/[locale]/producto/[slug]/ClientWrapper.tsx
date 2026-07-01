'use client'

import { useState } from 'react'
import AddToCartButton from './AddToCartButton'
import type { CartItemVariant, ProductVariant } from '@/types'

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
    const variants: ProductVariant[] = Array.isArray(model.variants) ? model.variants : []
    const [selectedVariant, setSelectedVariant] = useState<number>(0)
    const activeVariant = variants[selectedVariant]
    const hasVariants = variants.length > 0

    const currentPrice = hasVariants ? (activeVariant?.price ?? model.precio_mxn) : model.precio_mxn
    const currentStock = hasVariants ? (activeVariant?.stock ?? model.stock) : model.stock
    const currentSku = hasVariants ? (activeVariant?.sku ?? model.sku) : model.sku

    const variant: CartItemVariant = {
      modelId: String(model.id),
      modelSlug: model.slug,
      nombre_es: model.nombre_es,
      nombre_en: model.nombre_en,
      typeId: hasVariants ? String(selectedVariant) : String(model.category_id || ''),
      typeSlug: hasVariants ? (activeVariant?.name || '') : (model.tipo || ''),
      typeNombreEs: hasVariants ? (activeVariant?.name || '') : (model.tipo === 'pez' ? 'Pez' : 'Accesorio'),
      typeNombreEn: hasVariants ? (activeVariant?.name || '') : (model.tipo === 'pez' ? 'Fish' : 'Accessory'),
      colorId: '0',
      colorSlug: '',
      colorNombreEs: '',
      colorNombreEn: '',
      colorHex: '#ccc',
      image: Array.isArray(model.images) ? model.images[0] || '' : '',
      precio_mxn: currentPrice,
      precio_usd: currentPrice > 0 ? currentPrice / 18 : 0,
      stock: currentStock,
      weight_kg: model.weight_kg || 0,
    }

    return (
      <div className="space-y-6">
        <div>
          <p className="text-3xl font-semibold text-terracota">
            ${currentPrice.toLocaleString('es-MX')} MXN
          </p>
          {currentStock > 0 && (
            <p className="text-sm text-muted mt-1">Stock: {currentStock}</p>
          )}
        </div>

        {hasVariants && (
          <div>
            <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
              Tamaño
            </p>
            <div className="flex gap-2 flex-wrap">
              {variants.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedVariant(i)}
                  disabled={v.stock <= 0}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    i === selectedVariant
                      ? 'border-terracota bg-terracota/10 text-terracota'
                      : v.stock <= 0
                        ? 'border-arena bg-arena/30 text-muted/50 cursor-not-allowed line-through'
                        : 'border-arena hover:border-terracota/50 text-foreground'
                  }`}
                >
                  {v.name}
                  <span className="block text-xs font-normal mt-0.5">
                    ${v.price.toLocaleString('es-MX')} MXN
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStock > 0 ? (
          <AddToCartButton variant={variant} />
        ) : (
          <p className="text-amber-600 font-medium text-center py-4">
            {hasVariants ? 'Selecciona un tamaño disponible' : 'Sin stock disponible'}
          </p>
        )}

        {currentSku && (
          <p className="text-xs text-muted">SKU: {currentSku}</p>
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
    weight_kg: model.peso_kg || 0,
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
