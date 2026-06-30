import type { Kit, KitItem, KitFormData } from '@/types'
import { useDb, boolToInt, intToBool } from './base'

function rowToKit(row: any): Kit {
  return { ...row, activo: intToBool(row.activo) }
}

export function getKits(activeOnly = false): Kit[] {
  const db = useDb()
  let sql = 'SELECT * FROM kits'
  if (activeOnly) sql += ' WHERE activo = 1'
  sql += ' ORDER BY id ASC'
  return (db.prepare(sql).all() as any[]).map(rowToKit)
}

export function getKitBySlug(slug: string): Kit | null {
  const db = useDb()
  const row = db.prepare('SELECT * FROM kits WHERE slug = ?').get(slug) as any
  return row ? rowToKit(row) : null
}

export function upsertKit(data: KitFormData & { id?: number }): Kit {
  const db = useDb()
  const row = { ...data, activo: boolToInt(data.activo) }
  if (data.id) {
    db.prepare(`
      UPDATE kits SET slug=@slug, nombre_es=@nombre_es, nombre_en=@nombre_en,
        descripcion_es=@descripcion_es, descripcion_en=@descripcion_en,
        discount_percent=@discount_percent, image=@image, activo=@activo
      WHERE id = @id
    `).run(row)
    return db.prepare('SELECT * FROM kits WHERE id = ?').get(data.id) as Kit
  }
  const result = db.prepare(`
    INSERT INTO kits (slug, nombre_es, nombre_en, descripcion_es, descripcion_en,
      discount_percent, image, activo)
    VALUES (@slug, @nombre_es, @nombre_en, @descripcion_es, @descripcion_en,
      @discount_percent, @image, @activo)
  `).run(row)
  return db.prepare('SELECT * FROM kits WHERE id = ?').get(result.lastInsertRowid) as Kit
}

export function deleteKit(id: number) {
  useDb().prepare('DELETE FROM kits WHERE id = ?').run(id)
}

export function getKitItems(kitId: number): KitItem[] {
  const db = useDb()
  return db.prepare('SELECT * FROM kit_items WHERE kit_id = ?').all(kitId) as KitItem[]
}

export function setKitItems(kitId: number, items: { product_id: number; quantity: number }[]) {
  const db = useDb()
  db.prepare('DELETE FROM kit_items WHERE kit_id = ?').run(kitId)
  const insert = db.prepare('INSERT INTO kit_items (kit_id, product_id, quantity) VALUES (?, ?, ?)')
  for (const item of items) insert.run(kitId, item.product_id, item.quantity)
}
