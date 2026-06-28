import Database from 'better-sqlite3'
import path from 'path'
import seedData from './seed.json'
const seedProducts: any[] = seedData

const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/data/tlalchichi.db'
  : path.join(process.cwd(), '.data', 'tlalchichi.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    const fs = require('fs')
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
    seedColors()
    seedProductTypes()
    seedModels()
  }
  return _db
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

  // Add columns for flat product model if missing (for seed.json compat)
  try { db.exec('ALTER TABLE models ADD COLUMN categoria_es TEXT') } catch {}
  try { db.exec('ALTER TABLE models ADD COLUMN categoria_en TEXT') } catch {}
  try { db.exec('ALTER TABLE models ADD COLUMN precio_mxn REAL') } catch {}
  try { db.exec('ALTER TABLE models ADD COLUMN precio_usd REAL') } catch {}
  try { db.exec('ALTER TABLE models ADD COLUMN stock INTEGER DEFAULT 0') } catch {}
  try { db.exec('ALTER TABLE models ADD COLUMN colores TEXT') } catch {}

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
  // Add new variant columns to existing order_items table if missing
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

function seedColors() {
  const db = _db!
  // Siempre resiembra colores para que coincidan con seed.json
  db.exec('DELETE FROM colors')
  const colors = [
    { slug: 'blanco', nombre_es: 'Blanco', nombre_en: 'White', hex_code: '#F5F5F5' },
    { slug: 'negro', nombre_es: 'Negro', nombre_en: 'Black', hex_code: '#2D2D2D' },
    { slug: 'traslucido', nombre_es: 'Traslúcido', nombre_en: 'Translucent', hex_code: '#D4D4D4' },
    { slug: 'naranja', nombre_es: 'Naranja', nombre_en: 'Orange', hex_code: '#E87A3E' },
  ]

  const insert = db.prepare('INSERT INTO colors (slug, nombre_es, nombre_en, hex_code) VALUES (@slug, @nombre_es, @nombre_en, @hex_code)')
  for (const c of colors) insert.run(c)
  console.log('[seed] Colors seeded:', colors.length)
}

function seedProductTypes() {
  const db = _db!
  db.exec('DELETE FROM product_types')
  const types = [
    { slug: 'llaveros', nombre_es: 'Llaveros', nombre_en: 'Keychains', precio_mxn: 35, precio_usd: 2 },
    { slug: 'portamacetas', nombre_es: 'Portamacetas', nombre_en: 'Planters', precio_mxn: 210, precio_usd: 11 },
    { slug: 'alcacias', nombre_es: 'Alcancías', nombre_en: 'Piggy Banks', precio_mxn: 160, precio_usd: 9 },
    { slug: 'cuencos', nombre_es: 'Cuencos', nombre_en: 'Bowls', precio_mxn: 210, precio_usd: 11 },
  ]

  const insert = db.prepare('INSERT INTO product_types (slug, nombre_es, nombre_en, precio_mxn, precio_usd) VALUES (@slug, @nombre_es, @nombre_en, @precio_mxn, @precio_usd)')
  for (const t of types) insert.run(t)
  console.log('[seed] Product types seeded:', types.length)
}

function seedModels() {
  const db = _db!
  if (seedProducts.length === 0) return
  db.exec('DELETE FROM models')
  const insert = db.prepare(`
    INSERT INTO models (slug, nombre_es, nombre_en, descripcion_es, descripcion_en, historia_es, historia_en, categoria_es, categoria_en, precio_mxn, precio_usd, stock, imagenes, colores, destacado, activo)
    VALUES (@slug, @nombre_es, @nombre_en, @descripcion_es, @descripcion_en, @historia_es, @historia_en, @categoria_es, @categoria_en, @precio_mxn, @precio_usd, @stock, @imagenes, @colores, @destacado, @activo)
  `)
  let count = 0
  for (const p of seedProducts) {
    insert.run({
      ...p,
      imagenes: JSON.stringify(p.imagenes || []),
      colores: JSON.stringify(p.colores || []),
      destacado: p.destacado ? 1 : 0,
      activo: p.activo !== undefined ? (p.activo ? 1 : 0) : 1,
    })
    count++
  }
  console.log('[seed] Models seeded:', count)
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

  // Filtrar por slug de categoria (llaveros, portamacetas, etc.)
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
  db.prepare('UPDATE model_availability SET stock = MAX(0, stock - ?) WHERE model_id = ? AND product_type_id = ? AND stock >= ?').run(quantity, modelId, productTypeId, quantity)
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

// ── Order queries ──

export function createOrder(data: {
  email: string
  nombre?: string
  pais: string
  direccion?: string
  moneda: string
  subtotal: number
  costo_envio: number
  total: number
  payment_provider: string
  payment_status: string
  stripe_session_id?: string
  paypal_order_id?: string
}): any {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO orders (email, nombre, pais, direccion, moneda, subtotal, costo_envio, total, payment_provider, payment_status, stripe_session_id, paypal_order_id)
    VALUES (@email, @nombre, @pais, @direccion, @moneda, @subtotal, @costo_envio, @total, @payment_provider, @payment_status, @stripe_session_id, @paypal_order_id)
  `)
  const result = stmt.run({
    email: data.email,
    nombre: data.nombre || null,
    pais: data.pais,
    direccion: data.direccion || null,
    moneda: data.moneda,
    subtotal: data.subtotal,
    costo_envio: data.costo_envio,
    total: data.total,
    payment_provider: data.payment_provider,
    payment_status: data.payment_status,
    stripe_session_id: data.stripe_session_id || null,
    paypal_order_id: data.paypal_order_id || null,
  })
  return db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid)
}

export function createOrderItems(items: { order_id: number; model_id: number; product_type_id: number; color_id: number; quantity: number; precio_unitario: number }[]) {
  const db = getDb()
  const stmt = db.prepare('INSERT INTO order_items (order_id, model_id, product_type_id, color_id, quantity, precio_unitario) VALUES (@order_id, @model_id, @product_type_id, @color_id, @quantity, @precio_unitario)')
  for (const item of items) {
    stmt.run(item)
  }
}

export function getOrders(): any[] {
  const db = getDb()
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[]
  return orders.map((o) => ({
    ...o,
    direccion: o.direccion ? JSON.parse(o.direccion) : null,
  }))
}

export function getOrderItems(orderId: number): any[] {
  const db = getDb()
  return db.prepare(`
    SELECT oi.*, m.nombre_es, m.nombre_en, m.slug as model_slug, pt.nombre_es as type_nombre_es, c.nombre_es as color_nombre_es, c.hex_code
    FROM order_items oi
    LEFT JOIN models m ON m.id = oi.model_id
    LEFT JOIN product_types pt ON pt.id = oi.product_type_id
    LEFT JOIN colors c ON c.id = oi.color_id
    WHERE oi.order_id = ?
  `).all(orderId)
}

export function getSetting(key: string): string | null {
  const db = getDb()
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any
  return row?.value || null
}

export function setSetting(key: string, value: string) {
  const db = getDb()
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)
}
