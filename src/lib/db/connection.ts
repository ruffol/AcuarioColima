import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { seed } from './seed'

const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/data/tlalchichi.db'
  : path.join(process.cwd(), '.data', 'tlalchichi.db')

export let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
    initTables()
    migrateOrderItemsSchema()
    migrateOldProducts()
    seed()
  }
  return _db
}

export function initDb(): Database.Database {
  if (!_db) {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
    initTables()
    migrateOrderItemsSchema()
    migrateOldProducts()
  }
  return _db
}

export function initializeDatabase() {
  getDb()
}

function initTables() {
  const db = _db!
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      nombre_es TEXT NOT NULL,
      nombre_en TEXT NOT NULL,
      descripcion_es TEXT,
      descripcion_en TEXT,
      historia_es TEXT,
      historia_en TEXT,
      categoria_es TEXT NOT NULL,
      categoria_en TEXT NOT NULL,
      precio_mxn REAL NOT NULL,
      precio_usd REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      imagenes TEXT,
      colores TEXT,
      destacado INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      nombre_es TEXT NOT NULL,
      nombre_en TEXT NOT NULL,
      descripcion_es TEXT,
      descripcion_en TEXT,
      historia_es TEXT,
      historia_en TEXT,
      imagenes TEXT DEFAULT '[]',
      destacado INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  try { db.exec('ALTER TABLE models ADD COLUMN categoria_es TEXT') } catch (e: any) {
    if (!e?.message?.includes('duplicate column')) console.warn('[db] Migrate categoria_es:', e?.message)
  }
  try { db.exec('ALTER TABLE models ADD COLUMN categoria_en TEXT') } catch (e: any) {
    if (!e?.message?.includes('duplicate column')) console.warn('[db] Migrate categoria_en:', e?.message)
  }
  try { db.exec('ALTER TABLE models ADD COLUMN precio_mxn REAL') } catch (e: any) {
    if (!e?.message?.includes('duplicate column')) console.warn('[db] Migrate precio_mxn:', e?.message)
  }
  try { db.exec('ALTER TABLE models ADD COLUMN precio_usd REAL') } catch (e: any) {
    if (!e?.message?.includes('duplicate column')) console.warn('[db] Migrate precio_usd:', e?.message)
  }
  try { db.exec('ALTER TABLE models ADD COLUMN stock INTEGER DEFAULT 0') } catch (e: any) {
    if (!e?.message?.includes('duplicate column')) console.warn('[db] Migrate stock:', e?.message)
  }
  try { db.exec('ALTER TABLE models ADD COLUMN colores TEXT') } catch (e: any) {
    if (!e?.message?.includes('duplicate column')) console.warn('[db] Migrate colores:', e?.message)
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS product_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      nombre_es TEXT NOT NULL,
      nombre_en TEXT NOT NULL,
      precio_mxn INTEGER NOT NULL,
      precio_usd REAL NOT NULL
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS colors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      nombre_es TEXT NOT NULL,
      nombre_en TEXT NOT NULL,
      hex_code TEXT NOT NULL
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS model_availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_id INTEGER NOT NULL REFERENCES models(id),
      product_type_id INTEGER NOT NULL REFERENCES product_types(id),
      stock INTEGER NOT NULL DEFAULT 0,
      UNIQUE(model_id, product_type_id)
    )
  `)

  // ── New aquarium catalog tables ──

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      nombre_es TEXT NOT NULL,
      nombre_en TEXT NOT NULL,
      icon TEXT DEFAULT '',
      parent_id INTEGER REFERENCES categories(id)
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS new_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      nombre_es TEXT NOT NULL,
      nombre_en TEXT NOT NULL,
      descripcion_es TEXT,
      descripcion_en TEXT,
      category_id INTEGER REFERENCES categories(id),
      brand TEXT DEFAULT '',
      sku TEXT DEFAULT '',
      barcode TEXT DEFAULT '',
      weight_kg REAL DEFAULT 0,
      supplier TEXT DEFAULT '',
      cost_price REAL DEFAULT 0,
      margin REAL DEFAULT 0,
      precio_mxn REAL NOT NULL DEFAULT 0,
      precio_usd REAL NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      images TEXT DEFAULT '[]',
      size_cm TEXT DEFAULT '',
      compatibility_ids TEXT DEFAULT '[]',
      tipo TEXT NOT NULL DEFAULT 'accesorio' CHECK(tipo IN ('accesorio', 'pez')),
      destacado INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS fish_specs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL UNIQUE REFERENCES new_products(id) ON DELETE CASCADE,
      scientific_name TEXT NOT NULL,
      temp_min REAL NOT NULL,
      temp_max REAL NOT NULL,
      ph_min REAL NOT NULL,
      ph_max REAL NOT NULL,
      adult_size_cm REAL NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK(difficulty IN ('beginner', 'intermediate', 'expert')),
      lifespan_years REAL NOT NULL,
      feeding TEXT NOT NULL DEFAULT 'omnivore' CHECK(feeding IN ('carnivore', 'herbivore', 'omnivore')),
      min_volume_liters REAL NOT NULL,
      water_type TEXT NOT NULL DEFAULT 'fresh' CHECK(water_type IN ('fresh', 'salt', 'brackish'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS compatibility (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES new_products(id) ON DELETE CASCADE,
      compatible_with_id INTEGER NOT NULL REFERENCES new_products(id) ON DELETE CASCADE,
      UNIQUE(product_id, compatible_with_id)
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title_es TEXT NOT NULL,
      title_en TEXT NOT NULL,
      content_es TEXT NOT NULL,
      content_en TEXT NOT NULL,
      excerpt_es TEXT NOT NULL,
      excerpt_en TEXT NOT NULL,
      image TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      author TEXT DEFAULT '',
      published INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS stock_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      product_id INTEGER NOT NULL REFERENCES new_products(id) ON DELETE CASCADE,
      notified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS kits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      nombre_es TEXT NOT NULL,
      nombre_en TEXT NOT NULL,
      descripcion_es TEXT,
      descripcion_en TEXT,
      discount_percent REAL NOT NULL DEFAULT 0,
      image TEXT DEFAULT '',
      activo INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS kit_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kit_id INTEGER NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES new_products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      UNIQUE(kit_id, product_id)
    )
  `)

  // ── Legacy tables ──

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      nombre TEXT,
      pais TEXT NOT NULL,
      direccion TEXT,
      moneda TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      costo_envio INTEGER NOT NULL,
      total INTEGER NOT NULL,
      payment_provider TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      stripe_session_id TEXT,
      paypal_order_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      model_id INTEGER,
      product_type_id INTEGER,
      color_id INTEGER,
      quantity INTEGER NOT NULL,
      precio_unitario INTEGER NOT NULL
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  const count = db.prepare('SELECT COUNT(*) as count FROM settings').get() as any
  if (count.count === 0) {
    const insert = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)')
    const defaults = [
      ['shipping_mx_mxn', '150'],
      ['shipping_us_usd', '2500'],
      ['shipping_ca_usd', '3000'],
      ['shipping_eu_usd', '4000'],
      ['whatsapp_number', '523121337694'],
      ['store_email', 'srtlalchichi@gmail.com'],
    ]
    for (const [key, value] of defaults) {
      insert.run(key, value)
    }
  }
}

function migrateOrderItemsSchema() {
  const db = _db!
  const tableInfo = db.prepare("PRAGMA table_info('order_items')").all() as any[]
  const hasModelId = tableInfo.some((c: any) => c.name === 'model_id')
  if (!hasModelId) {
    db.exec('ALTER TABLE order_items ADD COLUMN model_id INTEGER')
  }
  const hasProductTypeId = tableInfo.some((c: any) => c.name === 'product_type_id')
  if (!hasProductTypeId) {
    db.exec('ALTER TABLE order_items ADD COLUMN product_type_id INTEGER')
  }
  const hasColorId = tableInfo.some((c: any) => c.name === 'color_id')
  if (!hasColorId) {
    db.exec('ALTER TABLE order_items ADD COLUMN color_id INTEGER')
  }
}

function migrateOldProducts() {
  const db = _db!
  const existing = db.prepare('SELECT COUNT(*) as count FROM models').get() as any
  if (existing.count > 0) return

  const oldProducts = db.prepare('SELECT * FROM products').all() as any[]
  if (oldProducts.length === 0) return

  const insertModel = db.prepare(`
    INSERT OR IGNORE INTO models (slug, nombre_es, nombre_en, descripcion_es, descripcion_en, historia_es, historia_en, imagenes, destacado, activo)
    VALUES (@slug, @nombre_es, @nombre_en, @descripcion_es, @descripcion_en, @historia_es, @historia_en, @imagenes, @destacado, @activo)
  `)

  const typeSlugMap = new Map<string, { slug: string; id: number }>()
  const getTypeId = db.prepare('SELECT id FROM product_types WHERE slug = ?')

  const insertAvail = db.prepare(`
    INSERT OR IGNORE INTO model_availability (model_id, product_type_id, stock)
    VALUES (@model_id, @product_type_id, @stock)
  `)

  for (const p of oldProducts) {
    const catSlug = p.categoria_es
      .toLowerCase()
      .replace(/[^a-záéíóúñ]+/g, '-')
      .replace(/^-|-$/g, '')

    insertModel.run({
      slug: p.slug,
      nombre_es: p.nombre_es,
      nombre_en: p.nombre_en,
      descripcion_es: p.descripcion_es || null,
      descripcion_en: p.descripcion_en || null,
      historia_es: p.historia_es || null,
      historia_en: p.historia_en || null,
      imagenes: p.imagenes || '[]',
      destacado: p.destacado || 0,
      activo: p.activo ?? 1,
    })

    const modelRow = db.prepare('SELECT id FROM models WHERE slug = ?').get(p.slug) as any
    if (!modelRow) continue

    const typeRow = getTypeId.get(catSlug) as any
    if (typeRow) {
      insertAvail.run({
        model_id: modelRow.id,
        product_type_id: typeRow.id,
        stock: p.stock,
      })
    }
  }
}

// ── Model queries ──

function normalizeModel(row: any): any {
  return {
    ...row,
    imagenes: typeof row.imagenes === 'string' ? JSON.parse(row.imagenes) : row.imagenes || [],
    colores: typeof row.colores === 'string' ? JSON.parse(row.colores) : row.colores || [],
    destacado: !!row.destacado,
    activo: !!row.activo,
  }
}

export function getModels(opts?: { destacado?: boolean; slug?: string; activo?: boolean }): any[] {
  const db = getDb()
  let sql = 'SELECT * FROM models WHERE 1=1'
  const params: any[] = []

  if (opts?.slug) {
    sql += ' AND slug = ?'
    params.push(opts.slug)
  }
  if (opts?.activo !== undefined) {
    sql += ' AND activo = ?'
    params.push(opts.activo ? 1 : 0)
  }
  if (opts?.destacado !== undefined) {
    sql += ' AND destacado = ?'
    params.push(opts.destacado ? 1 : 0)
  }

  sql += ' ORDER BY id ASC'
  const rows = db.prepare(sql).all(...params) as any[]
  return rows.map(normalizeModel)
}

export function getModelsByType(typeSlug: string): any[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT * FROM models
    WHERE categoria_es IS NOT NULL AND activo = 1
    ORDER BY id ASC
  `).all() as any[]

  const slugToCat: Record<string, string> = {
    llaveros: 'Llaveros',
    portamacetas: 'Portamacetas',
    alcacias: 'Alcancías',
    cuencos: 'Cuencos',
  }
  const catName = slugToCat[typeSlug]
  if (!catName) return []

  return rows.filter((m: any) => m.categoria_es === catName).map(normalizeModel)
}

export function getModelBySlug(slug: string): any | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM models WHERE slug = ? AND activo = 1').get(slug) as any
  return row ? normalizeModel(row) : null
}

export function getModelById(id: number): any | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM models WHERE id = ?').get(id) as any
  return row ? normalizeModel(row) : null
}

export function upsertModel(data: any): any {
  const db = getDb()
  const exists = db.prepare('SELECT id FROM models WHERE slug = ?').get(data.slug) as any
  if (exists) {
    db.prepare(`
      UPDATE models SET nombre_es=@nombre_es, nombre_en=@nombre_en, descripcion_es=@descripcion_es, descripcion_en=@descripcion_en, historia_es=@historia_es, historia_en=@historia_en, imagenes=@imagenes, destacado=@destacado, activo=@activo
      WHERE id = @id
    `).run(data)
    return db.prepare('SELECT * FROM models WHERE id = ?').get(exists.id)
  } else {
    const result = db.prepare(`
      INSERT INTO models (slug, nombre_es, nombre_en, descripcion_es, descripcion_en, historia_es, historia_en, imagenes, destacado, activo)
      VALUES (@slug, @nombre_es, @nombre_en, @descripcion_es, @descripcion_en, @historia_es, @historia_en, @imagenes, @destacado, @activo)
    `).run(data)
    return db.prepare('SELECT * FROM models WHERE id = ?').get(result.lastInsertRowid)
  }
}

export function deleteModel(id: number) {
  const db = getDb()
  db.prepare('DELETE FROM models WHERE id = ?').run(id)
}

// ── Product type queries ──

export function getProductTypes(): any[] {
  const db = getDb()
  return db.prepare('SELECT * FROM product_types ORDER BY id ASC').all() as any[]
}

export function getProductTypeBySlug(slug: string): any | null {
  const db = getDb()
  return db.prepare('SELECT * FROM product_types WHERE slug = ?').get(slug) as any || null
}

export function upsertProductType(data: any): any {
  const db = getDb()
  const exists = db.prepare('SELECT id FROM product_types WHERE slug = ?').get(data.slug) as any
  if (exists) {
    db.prepare(`
      UPDATE product_types SET nombre_es=@nombre_es, nombre_en=@nombre_en, precio_mxn=@precio_mxn, precio_usd=@precio_usd
      WHERE id = @id
    `).run(data)
    return db.prepare('SELECT * FROM product_types WHERE id = ?').get(exists.id)
  } else {
    const result = db.prepare(`
      INSERT INTO product_types (slug, nombre_es, nombre_en, precio_mxn, precio_usd)
      VALUES (@slug, @nombre_es, @nombre_en, @precio_mxn, @precio_usd)
    `).run(data)
    return db.prepare('SELECT * FROM product_types WHERE id = ?').get(result.lastInsertRowid)
  }
}

export function deleteProductType(id: number) {
  const db = getDb()
  db.prepare('DELETE FROM product_types WHERE id = ?').run(id)
}

// ── Color queries ──

export function getColors(): any[] {
  const db = getDb()
  return db.prepare('SELECT * FROM colors ORDER BY id ASC').all() as any[]
}

export function upsertColor(data: any): any {
  const db = getDb()
  const exists = db.prepare('SELECT id FROM colors WHERE slug = ?').get(data.slug) as any
  if (exists) {
    db.prepare(`UPDATE colors SET nombre_es=@nombre_es, nombre_en=@nombre_en, hex_code=@hex_code WHERE id = @id`).run(data)
    return db.prepare('SELECT * FROM colors WHERE id = ?').get(exists.id)
  } else {
    const result = db.prepare(`INSERT INTO colors (slug, nombre_es, nombre_en, hex_code) VALUES (@slug, @nombre_es, @nombre_en, @hex_code)`).run(data)
    return db.prepare('SELECT * FROM colors WHERE id = ?').get(result.lastInsertRowid)
  }
}

export function deleteColor(id: number) {
  const db = getDb()
  db.prepare('DELETE FROM colors WHERE id = ?').run(id)
}

// ── Model availability queries ──

export function getAvailability(modelId?: number, productTypeId?: number): any[] {
  const db = getDb()
  let sql = 'SELECT ma.*, pt.nombre_es as type_nombre_es, pt.nombre_en as type_nombre_en FROM model_availability ma JOIN product_types pt ON pt.id = ma.product_type_id WHERE 1=1'
  const params: any[] = []
  if (modelId) { sql += ' AND ma.model_id = ?'; params.push(modelId) }
  if (productTypeId) { sql += ' AND ma.product_type_id = ?'; params.push(productTypeId) }
  return db.prepare(sql).all(...params) as any[]
}

export function getModelTypes(modelId: number): any[] {
  const db = getDb()
  return db.prepare(`
    SELECT pt.*, ma.stock, ma.id as availability_id
    FROM model_availability ma
    JOIN product_types pt ON pt.id = ma.product_type_id
    WHERE ma.model_id = ? AND ma.stock > 0
    ORDER BY pt.id ASC
  `).all(modelId) as any[]
}

export function upsertAvailability(data: any): any {
  const db = getDb()
  const exists = db.prepare('SELECT id FROM model_availability WHERE model_id = ? AND product_type_id = ?').get(data.model_id, data.product_type_id) as any
  if (exists) {
    db.prepare(`UPDATE model_availability SET stock=@stock WHERE id = @id`).run({ ...data, id: exists.id })
    return db.prepare('SELECT * FROM model_availability WHERE id = ?').get(exists.id)
  } else {
    const result = db.prepare(`INSERT INTO model_availability (model_id, product_type_id, stock) VALUES (@model_id, @product_type_id, @stock)`).run(data)
    return db.prepare('SELECT * FROM model_availability WHERE id = ?').get(result.lastInsertRowid)
  }
}

export function deleteAvailability(id: number) {
  const db = getDb()
  db.prepare('DELETE FROM model_availability WHERE id = ?').run(id)
}

export function decrementStock(modelId: number, productTypeId: number, quantity: number) {
  const db = getDb()
  db.prepare('UPDATE model_availability SET stock = stock - ? WHERE model_id = ? AND product_type_id = ? AND stock >= ?').run(quantity, modelId, productTypeId, quantity)
}

// ── Legacy product queries (for backward compat) ──

export function getProducts(opts?: { destacado?: boolean; categoria?: string; slug?: string; activo?: boolean }): any[] {
  const db = getDb()
  let sql = 'SELECT * FROM products WHERE 1=1'
  const params: any[] = []
  if (opts?.slug) { sql += ' AND slug = ?'; params.push(opts.slug) }
  if (opts?.activo !== undefined) { sql += ' AND activo = ?'; params.push(opts.activo ? 1 : 0) }
  if (opts?.destacado !== undefined) { sql += ' AND destacado = ?'; params.push(opts.destacado ? 1 : 0) }
  if (opts?.categoria) { sql += ' AND (categoria_es = ? OR categoria_en = ?)'; params.push(opts.categoria, opts.categoria) }
  sql += ' ORDER BY id ASC'
  const rows = db.prepare(sql).all(...params) as any[]
  return rows.map(normalizeProduct)
}

export function getProductBySlug(slug: string): any | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM products WHERE slug = ? AND activo = 1').get(slug) as any
  return row ? normalizeProduct(row) : null
}

export function getCategories(locale: string): string[] {
  const db = getDb()
  const col = locale === 'es' ? 'categoria_es' : 'categoria_en'
  const rows = db.prepare(`SELECT DISTINCT ${col} as cat FROM products WHERE activo = 1 ORDER BY ${col}`).all() as any[]
  return rows.map((r: any) => r.cat).filter(Boolean)
}

function normalizeProduct(row: any): any {
  return {
    ...row,
    imagenes: typeof row.imagenes === 'string' ? JSON.parse(row.imagenes) : row.imagenes || [],
    colores: typeof row.colores === 'string' ? JSON.parse(row.colores) : row.colores || [],
    destacado: !!row.destacado,
    activo: !!row.activo,
  }
}

export function upsertProduct(data: any): any {
  const db = getDb()
  const exists = db.prepare('SELECT id FROM products WHERE slug = ?').get(data.slug) as any
  if (exists) {
    db.prepare(`
      UPDATE products SET nombre_es=@nombre_es, nombre_en=@nombre_en, descripcion_es=@descripcion_es, descripcion_en=@descripcion_en, historia_es=@historia_es, historia_en=@historia_en, categoria_es=@categoria_es, categoria_en=@categoria_en, precio_mxn=@precio_mxn, precio_usd=@precio_usd, stock=@stock, imagenes=@imagenes, destacado=@destacado, activo=@activo
      WHERE id = @id
    `).run(data)
    return db.prepare('SELECT * FROM products WHERE id = ?').get(exists.id)
  } else {
    const result = db.prepare(`
      INSERT INTO products (slug, nombre_es, nombre_en, descripcion_es, descripcion_en, historia_es, historia_en, categoria_es, categoria_en, precio_mxn, precio_usd, stock, imagenes, colores, destacado, activo)
      VALUES (@slug, @nombre_es, @nombre_en, @descripcion_es, @descripcion_en, @historia_es, @historia_en, @categoria_es, @categoria_en, @precio_mxn, @precio_usd, @stock, @imagenes, @colores, @destacado, @activo)
    `).run(data)
    return db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)
  }
}

export function deleteProduct(id: number) {
  const db = getDb()
  db.prepare('DELETE FROM products WHERE id = ?').run(id)
}
