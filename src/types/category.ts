export interface Category {
  id: number
  slug: string
  nombre_es: string
  nombre_en: string
  icon: string
  parent_id: number | null
}

export interface CategoryFormData {
  slug: string
  nombre_es: string
  nombre_en: string
  icon: string
  parent_id: number | null
}
