import type { CartItemVariant } from './model'

export interface CartItem {
  variant: CartItemVariant
  quantity: number
}

export type ShippingDestination = 'LOCAL' | 'NACIONAL'

export const SHIPPING_RATES: Record<
  ShippingDestination,
  { MXN: number; label: string }
> = {
  LOCAL: { MXN: 100, label: 'Local (Colima)' },
  NACIONAL: { MXN: 200, label: 'Resto de la República' },
}
