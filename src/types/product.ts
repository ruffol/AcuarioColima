export interface Product {
  id: number
  slug: string
  nombre_es: string
  nombre_en: string
  descripcion_es: string | null
  descripcion_en: string | null
  category_id: number | null
  brand: string
  sku: string
  barcode: string
  weight_kg: number
  supplier: string
  cost_price: number
  margin: number
  precio_mxn: number
  precio_usd: number
  stock: number
  images: string[]
  size_cm: string
  compatibility_ids: number[]
  tipo: 'accesorio' | 'pez'
  destacado: boolean
  activo: boolean
  created_at: string
}

export interface ProductFormData {
  slug: string
  nombre_es: string
  nombre_en: string
  descripcion_es: string
  descripcion_en: string
  category_id: number | null
  brand: string
  sku: string
  barcode: string
  weight_kg: number
  supplier: string
  cost_price: number
  margin: number
  precio_mxn: number
  precio_usd: number
  stock: number
  images: string[]
  size_cm: string
  compatibility_ids: number[]
  tipo: 'accesorio' | 'pez'
  destacado: boolean
  activo: boolean
}

// Legacy backward compat
export type {
  Model,
  ModelFormData,
  ProductType,
  Color,
  ModelAvailability,
  CartItemVariant,
} from './model'
