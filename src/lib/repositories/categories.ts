import type { Category, CategoryFormData } from '@/types'
import { useDb } from './base'

export function getCategories(): Category[] {
  const db = useDb()
  return db.prepare('SELECT * FROM categories ORDER BY id ASC').all() as Category[]
}

export function getCategoryBySlug(slug: string): Category | null {
  const db = useDb()
  return (db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug) as Category) || null
}

export function getCategoryById(id: number): Category | null {
  const db = useDb()
  return (db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category) || null
}

export function upsertCategory(data: CategoryFormData & { id?: number }): Category {
  const db = useDb()
  if (data.id) {
    db.prepare(`
      UPDATE categories SET slug=@slug, nombre_es=@nombre_es, nombre_en=@nombre_en, icon=@icon, parent_id=@parent_id
      WHERE id = @id
    `).run(data)
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(data.id) as Category
  }
  const result = db.prepare(`
    INSERT INTO categories (slug, nombre_es, nombre_en, icon, parent_id)
    VALUES (@slug, @nombre_es, @nombre_en, @icon, @parent_id)
  `).run(data)
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid) as Category
}

export function deleteCategory(id: number) {
  useDb().prepare('DELETE FROM categories WHERE id = ?').run(id)
}
