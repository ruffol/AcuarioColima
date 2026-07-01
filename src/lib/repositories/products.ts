import type { Product, ProductFormData, ProductVariant } from '@/types'
import { useDb, parseJson, boolToInt, intToBool } from './base'

function rowToProduct(row: any): Product {
  return {
    ...row,
    images: parseJson<string[]>(row.images, []),
    compatibility_ids: parseJson<number[]>(row.compatibility_ids, []),
    variants: parseJson<ProductVariant[]>(row.variants, []),
    destacado: intToBool(row.destacado),
    activo: intToBool(row.activo),
  }
}

export interface ProductFilters {
  category_slug?: string
  tipo?: string
  precio_min?: number
  precio_max?: number
  agua?: string
  dificultad?: string
  brand?: string
  busqueda?: string
  activo?: boolean
  destacado?: boolean
  limit?: number
  offset?: number
}

export function getProducts(filters?: ProductFilters): Product[] {
  const db = useDb()
  let sql = 'SELECT p.*, c.nombre_es as category_name FROM new_products p '
  const params: any[] = []
  const joins: string[] = ['LEFT JOIN categories c ON c.id = p.category_id']
  const wheres: string[] = []

  if (filters?.category_slug) {
    wheres.push('c.slug = ?')
    params.push(filters.category_slug)
  }
  if (filters?.tipo) {
    wheres.push('p.tipo = ?')
    params.push(filters.tipo)
  }
  if (filters?.precio_min !== undefined) {
    wheres.push('p.precio_mxn >= ?')
    params.push(filters.precio_min)
  }
  if (filters?.precio_max !== undefined) {
    wheres.push('p.precio_mxn <= ?')
    params.push(filters.precio_max)
  }
  if (filters?.agua && filters.tipo === 'pez') {
    joins.push('JOIN fish_specs fs ON fs.product_id = p.id')
    wheres.push('fs.water_type = ?')
    params.push(filters.agua)
  }
  if (filters?.dificultad && filters.tipo === 'pez') {
    joins.push('JOIN fish_specs fs2 ON fs2.product_id = p.id')
    wheres.push('fs2.difficulty = ?')
    params.push(filters.dificultad)
  }
  if (filters?.brand) {
    wheres.push('p.brand = ?')
    params.push(filters.brand)
  }
  if (filters?.busqueda) {
    const q = `%${filters.busqueda}%`
    wheres.push('(p.nombre_es LIKE ? OR p.nombre_en LIKE ? OR p.slug LIKE ? OR p.sku LIKE ?)')
    params.push(q, q, q, q)
  }
  if (filters?.activo !== undefined) {
    wheres.push('p.activo = ?')
    params.push(filters.activo ? 1 : 0)
  }
  if (filters?.destacado !== undefined) {
    wheres.push('p.destacado = ?')
    params.push(filters.destacado ? 1 : 0)
  }

  sql += joins.join(' ')
  if (wheres.length > 0) sql += ' WHERE ' + wheres.join(' AND ')
  sql += ' ORDER BY p.destacado DESC, p.nombre_es ASC'

  if (filters?.limit) sql += ' LIMIT ?'
  if (filters?.limit) params.push(filters.limit)
  if (filters?.offset) sql += ' OFFSET ?'
  if (filters?.offset) params.push(filters.offset)

  try {
    return (db.prepare(sql).all(...params) as any[]).map(rowToProduct)
  } catch (e: any) {
    const err = new Error(`SQL: ${sql} — ${e?.message}`)
    err.stack = e?.stack
    console.error('[DB] SQL Error:', e?.message, 'SQL:', sql)
    throw err
  }
}

export function getProductBySlug(slug: string): Product | null {
  const db = useDb()
  const row = db.prepare('SELECT * FROM new_products WHERE slug = ?').get(slug) as any
  return row ? rowToProduct(row) : null
}

export function getProductById(id: number): Product | null {
  const db = useDb()
  const row = db.prepare('SELECT * FROM new_products WHERE id = ?').get(id) as any
  return row ? rowToProduct(row) : null
}

export function upsertProduct(data: ProductFormData & { id?: number }): Product {
  const db = useDb()
  const row = {
    ...data,
    images: JSON.stringify(data.images || []),
    compatibility_ids: JSON.stringify(data.compatibility_ids || []),
    variants: JSON.stringify(data.variants || []),
    destacado: boolToInt(data.destacado),
    activo: boolToInt(data.activo),
    category_id: data.category_id || null,
  }
  if (data.id) {
    db.prepare(`
      UPDATE new_products SET slug=@slug, nombre_es=@nombre_es, nombre_en=@nombre_en,
        descripcion_es=@descripcion_es, descripcion_en=@descripcion_en,
        category_id=@category_id, brand=@brand, sku=@sku, barcode=@barcode,
        weight_kg=@weight_kg, supplier=@supplier, cost_price=@cost_price, margin=@margin,
        precio_mxn=@precio_mxn, precio_usd=@precio_usd, stock=@stock,
        images=@images, size_cm=@size_cm, compatibility_ids=@compatibility_ids,
        variants=@variants, tipo=@tipo, destacado=@destacado, activo=@activo
      WHERE id = @id
    `).run(row)
    return getProductById(data.id)!
  }
  const result = db.prepare(`
    INSERT INTO new_products (slug, nombre_es, nombre_en, descripcion_es, descripcion_en,
      category_id, brand, sku, barcode, weight_kg, supplier, cost_price, margin,
      precio_mxn, precio_usd, stock, images, size_cm, compatibility_ids, variants, tipo, destacado, activo)
    VALUES (@slug, @nombre_es, @nombre_en, @descripcion_es, @descripcion_en,
      @category_id, @brand, @sku, @barcode, @weight_kg, @supplier, @cost_price, @margin,
      @precio_mxn, @precio_usd, @stock, @images, @size_cm, @compatibility_ids, @variants, @tipo, @destacado, @activo)
  `).run(row)
  return getProductById(Number(result.lastInsertRowid))!
}

export function deleteProduct(id: number) {
  useDb().prepare('DELETE FROM new_products WHERE id = ?').run(id)
}

export function getRelatedProducts(productId: number, limit = 6): Product[] {
  const db = useDb()
  const product = getProductById(productId)
  if (!product) return []

  const rows = db.prepare(`
    SELECT * FROM new_products
    WHERE id != ? AND activo = 1 AND category_id = ?
    ORDER BY destacado DESC, RANDOM()
    LIMIT ?
  `).all(productId, product.category_id, limit) as any[]

  return rows.map(rowToProduct)
}

export function getBrands(): string[] {
  const db = useDb()
  const rows = db.prepare("SELECT DISTINCT brand FROM new_products WHERE brand != '' AND brand IS NOT NULL AND activo = 1 ORDER BY brand ASC").all() as any[]
  return rows.map((r: any) => r.brand)
}
