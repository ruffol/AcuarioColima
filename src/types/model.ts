export interface Model {
  id: number
  slug: string
  nombre_es: string
  nombre_en: string
  descripcion_es: string | null
  descripcion_en: string | null
  historia_es: string | null
  historia_en: string | null
  imagenes: string[]
  categoria_es: string
  categoria_en: string
  precio_mxn: number
  precio_usd: number
  stock: number
  destacado: boolean
  activo: boolean
  colores: ColorOption[]
  created_at: string
}

export interface ColorOption {
  nombre_es: string
  nombre_en: string
  hex: string
  imagen: string
}

export type ModelFormData = {
  slug: string
  nombre_es: string
  nombre_en: string
  descripcion_es: string
  descripcion_en: string
  historia_es: string
  historia_en: string
  imagenes: string[]
  categoria_es: string
  categoria_en: string
  precio_mxn: number
  precio_usd: number
  stock: number
  colores: ColorOption[]
}

export interface ProductType {
  id: number
  slug: string
  nombre_es: string
  nombre_en: string
  precio_mxn: number
  precio_usd: number
}

export interface Color {
  id: number
  slug: string
  nombre_es: string
  nombre_en: string
  hex_code: string
}

export interface ModelAvailability {
  id: number
  model_id: number
  product_type_id: number
  stock: number
}

export interface CartItemVariant {
  modelId: string
  modelSlug: string
  nombre_es: string
  nombre_en: string
  typeId: string
  typeSlug: string
  typeNombreEs: string
  typeNombreEn: string
  colorId: string
  colorSlug: string
  colorNombreEs: string
  colorNombreEn: string
  colorHex: string
  image: string
  precio_mxn: number
  precio_usd: number
  stock: number
  weight_kg: number
}
