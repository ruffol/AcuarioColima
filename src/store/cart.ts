'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, CartItemVariant, ShippingDestination } from '@/types'
import { SHIPPING_RATES } from '@/types'

function variantKey(v: CartItemVariant): string {
  if (!v) return ''
  return `${v.modelId ?? 0}-${v.typeId ?? 0}-${v.colorId ?? 0}`
}

interface CartState {
  items: CartItem[]
  pais: ShippingDestination
  isOpen: boolean
  addItem: (variant: CartItemVariant, quantity?: number) => void
  removeItem: (variant: CartItemVariant) => void
  updateQuantity: (variant: CartItemVariant, quantity: number) => void
  clearCart: () => void
  setPais: (pais: ShippingDestination) => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      pais: 'LOCAL' as ShippingDestination,
      isOpen: false,

      addItem: (variant, quantity = 1) =>
        set((state) => {
          // Limpiar items invalidos del carrito
          const validItems = state.items.filter(i => i?.variant && typeof i.variant === 'object')
          const key = variantKey(variant)
          const existing = validItems.find(
            (item) => variantKey(item.variant) === key
          )
          if (existing) {
            return {
              items: state.items.map((item) =>
                variantKey(item.variant) === key
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }
          return { items: [...state.items, { variant, quantity }] }
        }),

      removeItem: (variant) =>
        set((state) => {
          const key = variantKey(variant)
          return {
            items: state.items.filter((item) => variantKey(item.variant) !== key),
          }
        }),

      updateQuantity: (variant, quantity) =>
        set((state) => {
          const key = variantKey(variant)
          return {
            items:
              quantity <= 0
                ? state.items.filter((item) => variantKey(item.variant) !== key)
                : state.items.map((item) =>
                    variantKey(item.variant) === key ? { ...item, quantity } : item
                  ),
          }
        }),

      clearCart: () => set({ items: [] }),
      setPais: (pais) => set({ pais }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'acuariocolima-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        pais: state.pais,
      }),
    }
  )
)

export function getSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const precio = item.variant?.precio_mxn
    return total + (typeof precio === 'number' ? precio * item.quantity : 0)
  }, 0)
}

export function getShippingCost(pais: ShippingDestination): number {
  return SHIPPING_RATES[pais]?.MXN ?? 0
}

export function getTotal(items: CartItem[], pais: ShippingDestination): number {
  return getSubtotal(items) + getShippingCost(pais)
}

export function getItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0)
}
