'use client'

import { useTranslations } from 'next-intl'
import { useCartStore } from '@/store/cart'
import type { CartItemVariant } from '@/types'
import Button from '@/components/ui/Button'
import { useState } from 'react'

interface Props {
  variant: CartItemVariant
}

export default function AddToCartButton({ variant }: Props) {
  const t = useTranslations('ProductDetail')
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const [added, setAdded] = useState(false)

  const handleClick = () => {
    addItem(variant)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
    openCart()
  }

  return (
    <Button
      onClick={handleClick}
      disabled={variant.stock <= 0}
      size="lg"
      className="flex-1"
    >
      {variant.stock <= 0
        ? t('sin_stock')
        : added
        ? t('agregado')
        : t('agregar')}
    </Button>
  )
}
