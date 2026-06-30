import type { FishSpecs, FishSpecsFormData } from '@/types'
import { useDb } from './base'

export function getFishSpecs(productId: number): FishSpecs | null {
  const db = useDb()
  return (db.prepare('SELECT * FROM fish_specs WHERE product_id = ?').get(productId) as FishSpecs) || null
}

export function getFishSpecsWithProduct(slug: string): (FishSpecs & { product_name_es: string; product_name_en: string }) | null {
  const db = useDb()
  const row = db.prepare(`
    SELECT fs.*, p.nombre_es as product_name_es, p.nombre_en as product_name_en
    FROM fish_specs fs
    JOIN new_products p ON p.id = fs.product_id
    WHERE p.slug = ?
  `).get(slug) as any
  return row || null
}

export function upsertFishSpecs(productId: number, data: FishSpecsFormData): FishSpecs {
  const db = useDb()
  const existing = db.prepare('SELECT id FROM fish_specs WHERE product_id = ?').get(productId) as any
  if (existing) {
    db.prepare(`
      UPDATE fish_specs SET scientific_name=@scientific_name, temp_min=@temp_min, temp_max=@temp_max,
        ph_min=@ph_min, ph_max=@ph_max, adult_size_cm=@adult_size_cm, difficulty=@difficulty,
        lifespan_years=@lifespan_years, feeding=@feeding, min_volume_liters=@min_volume_liters,
        water_type=@water_type
      WHERE product_id = @product_id
    `).run({ ...data, product_id: productId })
    return db.prepare('SELECT * FROM fish_specs WHERE product_id = ?').get(productId) as FishSpecs
  }
  const result = db.prepare(`
    INSERT INTO fish_specs (product_id, scientific_name, temp_min, temp_max, ph_min, ph_max,
      adult_size_cm, difficulty, lifespan_years, feeding, min_volume_liters, water_type)
    VALUES (@product_id, @scientific_name, @temp_min, @temp_max, @ph_min, @ph_max,
      @adult_size_cm, @difficulty, @lifespan_years, @feeding, @min_volume_liters, @water_type)
  `).run({ ...data, product_id: productId })
  return db.prepare('SELECT * FROM fish_specs WHERE id = ?').get(result.lastInsertRowid) as FishSpecs
}

export function deleteFishSpecs(productId: number) {
  useDb().prepare('DELETE FROM fish_specs WHERE product_id = ?').run(productId)
}

export function getCompatibleProductIds(productId: number): number[] {
  const db = useDb()
  const rows = db.prepare('SELECT compatible_with_id FROM compatibility WHERE product_id = ?').all(productId) as any[]
  return rows.map((r: any) => r.compatible_with_id)
}

export function setCompatibility(productId: number, compatibleIds: number[]) {
  const db = useDb()
  db.prepare('DELETE FROM compatibility WHERE product_id = ?').run(productId)
  const insert = db.prepare('INSERT INTO compatibility (product_id, compatible_with_id) VALUES (?, ?)')
  for (const id of compatibleIds) {
    insert.run(productId, id)
  }
}
