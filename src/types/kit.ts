export interface Kit {
  id: number
  slug: string
  nombre_es: string
  nombre_en: string
  descripcion_es: string
  descripcion_en: string
  discount_percent: number
  image: string
  activo: boolean
  created_at: string
}

export interface KitItem {
  id: number
  kit_id: number
  product_id: number
  quantity: number
}

export interface KitFormData {
  slug: string
  nombre_es: string
  nombre_en: string
  descripcion_es: string
  descripcion_en: string
  discount_percent: number
  image: string
  activo: boolean
}
