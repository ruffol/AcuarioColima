export interface BlogPost {
  id: number
  slug: string
  title_es: string
  title_en: string
  content_es: string
  content_en: string
  excerpt_es: string
  excerpt_en: string
  image: string
  tags: string[]
  author: string
  published: boolean
  created_at: string
  updated_at: string
}

export interface BlogPostFormData {
  slug: string
  title_es: string
  title_en: string
  content_es: string
  content_en: string
  excerpt_es: string
  excerpt_en: string
  image: string
  tags: string[]
  author: string
  published: boolean
}
