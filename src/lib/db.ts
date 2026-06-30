import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import seedData from './seed.json'
const seedProducts: any[] = seedData

const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/data/tlalchichi.db'
  : path.join(process.cwd(), '.data', 'tlalchichi.db')

let _db: Database.Database | null = null

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
    seedColors()
    seedProductTypes()
    seedModels()
    seedCategories()
    seedNewProducts()
    seedCompatibility()
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
  const existing = db.prepare('SELECT COUNT(*) as count FROM colors').get() as { count: number }
  if (existing.count > 0) return
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
  const existing = db.prepare('SELECT COUNT(*) as count FROM product_types').get() as { count: number }
  if (existing.count > 0) return
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
  const existing = db.prepare('SELECT COUNT(*) as count FROM models').get() as { count: number }
  if (existing.count > 0) return
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

// ── New catalog seeds ──

const CATEGORIES = [
  { slug: 'peces-tropicales', nombre_es: 'Peces Tropicales', nombre_en: 'Tropical Fish', icon: '🐠', parent_id: null },
  { slug: 'peces-agua-fria', nombre_es: 'Peces de Agua Fría', nombre_en: 'Cold Water Fish', icon: '🐟', parent_id: null },
  { slug: 'plantas-acuaticas', nombre_es: 'Plantas Acuáticas', nombre_en: 'Aquatic Plants', icon: '🌿', parent_id: null },
  { slug: 'peceras', nombre_es: 'Peceras', nombre_en: 'Aquariums', icon: '🫙', parent_id: null },
  { slug: 'filtros', nombre_es: 'Filtros', nombre_en: 'Filters', icon: '⚙️', parent_id: null },
  { slug: 'bombas-aire', nombre_es: 'Bombas de Aire', nombre_en: 'Air Pumps', icon: '💨', parent_id: null },
  { slug: 'iluminacion', nombre_es: 'Iluminación', nombre_en: 'Lighting', icon: '💡', parent_id: null },
  { slug: 'alimentos', nombre_es: 'Alimentos', nombre_en: 'Food', icon: '🦐', parent_id: null },
  { slug: 'medicamentos', nombre_es: 'Medicamentos', nombre_en: 'Medications', icon: '💊', parent_id: null },
  { slug: 'decoracion', nombre_es: 'Decoración', nombre_en: 'Decoration', icon: '🏝️', parent_id: null },
  { slug: 'sustratos', nombre_es: 'Sustratos', nombre_en: 'Substrates', icon: '🪨', parent_id: null },
]

const SEED_FISH = [
  {
    slug: 'betta-splendens', nombre_es: 'Betta Splendens', nombre_en: 'Betta Splendens',
    descripcion_es: 'El pez Betta, también conocido como luchador de Siam, es uno de los peces más populares para acuarios pequeños. Conocido por sus colores vibrantes y aletas espectaculares.',
    descripcion_en: 'The Betta fish, also known as Siamese fighting fish, is one of the most popular fish for small aquariums. Known for its vibrant colors and spectacular fins.',
    category_slug: 'peces-tropicales', brand: 'N/A', sku: 'FISH-BET-001',
    precio_mxn: 150, precio_usd: 8, stock: 25, images: [], size_cm: '5-7',
    tipo: 'pez', destacado: 1, activo: 1,
    fish_specs: { scientific_name: 'Betta splendens', temp_min: 24, temp_max: 28, ph_min: 6.5, ph_max: 7.5, adult_size_cm: 7, difficulty: 'beginner', lifespan_years: 3, feeding: 'carnivore', min_volume_liters: 20, water_type: 'fresh' },
    compatible_with: [],
  },
  {
    slug: 'guppy', nombre_es: 'Guppy', nombre_en: 'Guppy',
    descripcion_es: 'Peces pequeños y coloridos, ideales para principiantes. Se reproducen fácilmente y son muy pacíficos.',
    descripcion_en: 'Small and colorful fish, ideal for beginners. They breed easily and are very peaceful.',
    category_slug: 'peces-tropicales', brand: 'N/A', sku: 'FISH-GUP-001',
    precio_mxn: 35, precio_usd: 2, stock: 100, images: [], size_cm: '3-5',
    tipo: 'pez', destacado: 1, activo: 1,
    fish_specs: { scientific_name: 'Poecilia reticulata', temp_min: 22, temp_max: 28, ph_min: 7, ph_max: 8, adult_size_cm: 5, difficulty: 'beginner', lifespan_years: 2, feeding: 'omnivore', min_volume_liters: 40, water_type: 'fresh' },
    compatible_with: [],
  },
  {
    slug: 'tetra-neon', nombre_es: 'Tetra Neón', nombre_en: 'Neon Tetra',
    descripcion_es: 'Pequeño pez de cardumen con una característica línea azul iridiscente. Muy popular en acuarios comunitarios.',
    descripcion_en: 'Small schooling fish with a characteristic iridescent blue line. Very popular in community aquariums.',
    category_slug: 'peces-tropicales', brand: 'N/A', sku: 'FISH-NEO-001',
    precio_mxn: 25, precio_usd: 1.5, stock: 80, images: [], size_cm: '3-4',
    tipo: 'pez', destacado: 0, activo: 1,
    fish_specs: { scientific_name: 'Paracheirodon innesi', temp_min: 23, temp_max: 27, ph_min: 5.5, ph_max: 7, adult_size_cm: 4, difficulty: 'beginner', lifespan_years: 5, feeding: 'omnivore', min_volume_liters: 60, water_type: 'fresh' },
    compatible_with: [],
  },
  {
    slug: 'corydora-pygmaeus', nombre_es: 'Corydora Pigmea', nombre_en: 'Pygmy Corydora',
    descripcion_es: 'Bagre pequeño y pacífico que habita el fondo del acuario. Excelente para acuarios comunitarios.',
    descripcion_en: 'Small, peaceful catfish that inhabits the bottom of the aquarium. Excellent for community tanks.',
    category_slug: 'peces-tropicales', brand: 'N/A', sku: 'FISH-COR-001',
    precio_mxn: 45, precio_usd: 2.5, stock: 40, images: [], size_cm: '3',
    tipo: 'pez', destacado: 0, activo: 1,
    fish_specs: { scientific_name: 'Corydoras pygmaeus', temp_min: 22, temp_max: 26, ph_min: 6.5, ph_max: 7.5, adult_size_cm: 3, difficulty: 'beginner', lifespan_years: 4, feeding: 'omnivore', min_volume_liters: 40, water_type: 'fresh' },
    compatible_with: [],
  },
  {
    slug: 'pez-angel', nombre_es: 'Pez Ángel', nombre_en: 'Angelfish',
    descripcion_es: 'Pez elegante y majestuoso con aletas largas y forma triangular. Requiere un acuario alto.',
    descripcion_en: 'Elegant and majestic fish with long fins and triangular shape. Requires a tall aquarium.',
    category_slug: 'peces-tropicales', brand: 'N/A', sku: 'FISH-ANG-001',
    precio_mxn: 120, precio_usd: 7, stock: 15, images: [], size_cm: '15',
    tipo: 'pez', destacado: 1, activo: 1,
    fish_specs: { scientific_name: 'Pterophyllum scalare', temp_min: 24, temp_max: 30, ph_min: 6, ph_max: 7.5, adult_size_cm: 15, difficulty: 'intermediate', lifespan_years: 10, feeding: 'omnivore', min_volume_liters: 120, water_type: 'fresh' },
    compatible_with: [],
  },
  {
    slug: 'pez-dorado', nombre_es: 'Pez Dorado', nombre_en: 'Goldfish',
    descripcion_es: 'El clásico pez de agua fría. Resistente y fácil de cuidar, pero requiere espacio adecuado.',
    descripcion_en: 'The classic cold water fish. Hardy and easy to care for, but requires adequate space.',
    category_slug: 'peces-agua-fria', brand: 'N/A', sku: 'FISH-GOL-001',
    precio_mxn: 60, precio_usd: 3.5, stock: 20, images: [], size_cm: '15-25',
    tipo: 'pez', destacado: 1, activo: 1,
    fish_specs: { scientific_name: 'Carassius auratus', temp_min: 18, temp_max: 23, ph_min: 7, ph_max: 8, adult_size_cm: 25, difficulty: 'beginner', lifespan_years: 15, feeding: 'omnivore', min_volume_liters: 100, water_type: 'fresh' },
    compatible_with: [],
  },
]

const SEED_ACCESSORIES = [
  {
    slug: 'pecera-20l', nombre_es: 'Pecera 20 Litros', nombre_en: '20 Liter Aquarium',
    descripcion_es: 'Pecera de vidrio de 20 litros ideal para bettas o camaroness. Incluye tapa y luz LED básica.',
    descripcion_en: '20 liter glass aquarium ideal for bettas or shrimp. Includes lid and basic LED light.',
    category_slug: 'peceras', brand: 'AcuaTech', sku: 'TNK-020-001',
    precio_mxn: 450, precio_usd: 25, stock: 30, images: [], size_cm: '40x20x25',
    tipo: 'accesorio', destacado: 1, activo: 1,
  },
  {
    slug: 'filtro-externo-500l', nombre_es: 'Filtro Externo 500 L/h', nombre_en: 'External Filter 500 L/h',
    descripcion_es: 'Filtro externo con bomba de 500 litros por hora. Ideal para acuarios de 60-100 litros. Incluye medios filtrantes.',
    descripcion_en: 'External filter with 500 liter per hour pump. Ideal for 60-100 liter aquariums. Includes filter media.',
    category_slug: 'filtros', brand: 'AquaClear', sku: 'FIL-EXT-500',
    precio_mxn: 890, precio_usd: 49, stock: 15, images: [], size_cm: '25x15x20',
    tipo: 'accesorio', destacado: 1, activo: 1,
  },
  {
    slug: 'calentador-100w', nombre_es: 'Calentador 100W', nombre_en: 'Heater 100W',
    descripcion_es: 'Calentador sumergible de 100W con control automático de temperatura. Adecuado para acuarios de 40-80 litros.',
    descripcion_en: '100W submersible heater with automatic temperature control. Suitable for 40-80 liter aquariums.',
    category_slug: 'peces-tropicales', brand: 'Eheim', sku: 'HTR-100-001',
    precio_mxn: 350, precio_usd: 19, stock: 25, images: [], size_cm: '25x3x3',
    tipo: 'accesorio', destacado: 0, activo: 1,
  },
  {
    slug: 'alimento-escamas', nombre_es: 'Alimento en Escamas', nombre_en: 'Flake Food',
    descripcion_es: 'Alimento balanceado en escamas para peces tropicales. Contiene vitaminas y minerales esenciales.',
    descripcion_en: 'Balanced flake food for tropical fish. Contains essential vitamins and minerals.',
    category_slug: 'alimentos', brand: 'Tetra', sku: 'FOOD-FLK-001',
    precio_mxn: 85, precio_usd: 5, stock: 60, images: [], size_cm: '10x5x5',
    tipo: 'accesorio', destacado: 0, activo: 1,
  },
  {
    slug: 'sustrato-arena-fina', nombre_es: 'Sustrato Arena Fina 5kg', nombre_en: 'Fine Sand Substrate 5kg',
    descripcion_es: 'Arena fina natural para acuarios. Ideal para peces de fondo y plantas acuáticas. 5 kilogramos.',
    descripcion_en: 'Natural fine sand for aquariums. Ideal for bottom fish and aquatic plants. 5 kilograms.',
    category_slug: 'sustratos', brand: 'NatureSoil', sku: 'SUB-SND-005',
    precio_mxn: 180, precio_usd: 10, stock: 40, images: [], size_cm: '30x20x5',
    tipo: 'accesorio', destacado: 0, activo: 1,
  },
  {
    slug: 'bomba-aire-simple', nombre_es: 'Bomba de Aire Simple', nombre_en: 'Single Air Pump',
    descripcion_es: 'Bomba de aire silenciosa para acuarios de hasta 60 litros. Incluye tubo y difusor de burbuja fina.',
    descripcion_en: 'Silent air pump for aquariums up to 60 liters. Includes tube and fine bubble diffuser.',
    category_slug: 'bombas-aire', brand: 'Marina', sku: 'AIR-PMP-001',
    precio_mxn: 220, precio_usd: 12, stock: 35, images: [], size_cm: '10x6x8',
    tipo: 'accesorio', destacado: 0, activo: 1,
  },
]

function seedCategories() {
  const db = _db!
  const existing = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }
  if (existing.count > 0) return
  const insert = db.prepare('INSERT INTO categories (slug, nombre_es, nombre_en, icon, parent_id) VALUES (@slug, @nombre_es, @nombre_en, @icon, @parent_id)')
  for (const c of CATEGORIES) insert.run(c)
  console.log('[seed] Categories seeded:', CATEGORIES.length)
}

function seedNewProducts() {
  const db = _db!
  const existing = db.prepare('SELECT COUNT(*) as count FROM new_products').get() as { count: number }
  if (existing.count > 0) return

  const insertProduct = db.prepare(`
    INSERT INTO new_products (slug, nombre_es, nombre_en, descripcion_es, descripcion_en, category_id, brand, sku, precio_mxn, precio_usd, stock, images, size_cm, tipo, destacado, activo)
    VALUES (@slug, @nombre_es, @nombre_en, @descripcion_es, @descripcion_en, @category_id, @brand, @sku, @precio_mxn, @precio_usd, @stock, @imagenes, @size_cm, @tipo, @destacado, @activo)
  `)
  const insertFish = db.prepare(`
    INSERT INTO fish_specs (product_id, scientific_name, temp_min, temp_max, ph_min, ph_max, adult_size_cm, difficulty, lifespan_years, feeding, min_volume_liters, water_type)
    VALUES (@product_id, @scientific_name, @temp_min, @temp_max, @ph_min, @ph_max, @adult_size_cm, @difficulty, @lifespan_years, @feeding, @min_volume_liters, @water_type)
  `)

  const catMap: Record<string, number> = {}
  const cats = db.prepare('SELECT id, slug FROM categories').all() as any[]
  for (const c of cats) catMap[c.slug] = c.id

  let count = 0
  for (const p of SEED_FISH) {
    const result = insertProduct.run({
      slug: p.slug, nombre_es: p.nombre_es, nombre_en: p.nombre_en,
      descripcion_es: p.descripcion_es, descripcion_en: p.descripcion_en,
      category_id: catMap[p.category_slug] || null,
      brand: p.brand, sku: p.sku,
      precio_mxn: p.precio_mxn, precio_usd: p.precio_usd,
      stock: p.stock, imagenes: JSON.stringify(p.images),
      size_cm: p.size_cm, tipo: p.tipo,
      destacado: p.destacado, activo: p.activo,
    })
    insertFish.run({
      product_id: result.lastInsertRowid,
      ...p.fish_specs,
    })
    count++
  }
  for (const p of SEED_ACCESSORIES) {
    insertProduct.run({
      slug: p.slug, nombre_es: p.nombre_es, nombre_en: p.nombre_en,
      descripcion_es: p.descripcion_es, descripcion_en: p.descripcion_en,
      category_id: catMap[p.category_slug] || null,
      brand: p.brand, sku: p.sku,
      precio_mxn: p.precio_mxn, precio_usd: p.precio_usd,
      stock: p.stock, imagenes: JSON.stringify(p.images),
      size_cm: p.size_cm, tipo: p.tipo,
      destacado: p.destacado, activo: p.activo,
    })
    count++
  }
  console.log('[seed] New products seeded:', count)
}

function seedCompatibility() {
  const db = _db!
  const existing = db.prepare('SELECT COUNT(*) as count FROM compatibility').get() as { count: number }
  if (existing.count > 0) return
  const insert = db.prepare('INSERT INTO compatibility (product_id, compatible_with_id) VALUES (?, ?)')
  // Guppies <-> Corydoras, Guppies <-> Neon Tetras, Neon Tetras <-> Corydoras
  const fish = db.prepare("SELECT id, slug FROM new_products WHERE tipo = 'pez'").all() as any[]
  const bySlug: Record<string, number> = {}
  for (const f of fish) bySlug[f.slug] = f.id

  const pairs: [string, string][] = [
    ['guppy', 'tetra-neon'], ['guppy', 'corydora-pygmaeus'], ['tetra-neon', 'corydora-pygmaeus'],
    ['betta-splendens', 'corydora-pygmaeus'],
    ['pez-angel', 'guppy'], ['pez-angel', 'tetra-neon'], ['pez-angel', 'corydora-pygmaeus'],
  ]
  let count = 0
  for (const [a, b] of pairs) {
    if (bySlug[a] && bySlug[b]) {
      insert.run(bySlug[a], bySlug[b])
      insert.run(bySlug[b], bySlug[a])
      count += 2
    }
  }
  console.log('[seed] Compatibility seeded:', count)
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
  db.prepare('UPDATE model_availability SET stock = stock - ? WHERE model_id = ? AND product_type_id = ? AND stock >= ?').run(quantity, modelId, productTypeId, quantity)
}

export function createFullOrder(data: {
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
  items?: { modelId: number; productTypeId: number; colorId: number; quantity: number; precio: number }[]
}): any {
  const db = getDb()
  const txn = db.transaction(() => {
    const order = createOrder(data)
    if (data.items && data.items.length > 0) {
      const orderItems = data.items.map((item) => ({
        order_id: order.id,
        model_id: item.modelId || 0,
        product_type_id: item.productTypeId || 0,
        color_id: item.colorId || 0,
        quantity: item.quantity || 1,
        precio_unitario: Math.round((item.precio || 0) * (data.moneda === 'MXN' ? 100 : 100)),
      }))
      createOrderItems(orderItems)
      for (const item of data.items) {
        if (item.modelId && item.productTypeId) {
          decrementStock(item.modelId, item.productTypeId, item.quantity || 1)
        }
      }
    }
    return order
  })
  return txn()
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
