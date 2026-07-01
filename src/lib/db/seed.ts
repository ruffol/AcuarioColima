import { getDb, _db } from './connection'
import seedData from '../seed.json'
const seedProducts: any[] = seedData

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
    precio_mxn: 150, precio_usd: 8, stock: 25, images: ['/img/productos/betta.png'], size_cm: '5-7',
    tipo: 'pez', destacado: 1, activo: 1,
    fish_specs: { scientific_name: 'Betta splendens', temp_min: 24, temp_max: 28, ph_min: 6.5, ph_max: 7.5, adult_size_cm: 7, difficulty: 'beginner', lifespan_years: 3, feeding: 'carnivore', min_volume_liters: 20, water_type: 'fresh' },
    compatible_with: [],
  },
  {
    slug: 'guppy', nombre_es: 'Guppy', nombre_en: 'Guppy',
    descripcion_es: 'Peces pequeños y coloridos, ideales para principiantes. Se reproducen fácilmente y son muy pacíficos.',
    descripcion_en: 'Small and colorful fish, ideal for beginners. They breed easily and are very peaceful.',
    category_slug: 'peces-tropicales', brand: 'N/A', sku: 'FISH-GUP-001',
    precio_mxn: 35, precio_usd: 2, stock: 100, images: ['/img/productos/guppy.png'], size_cm: '3-5',
    tipo: 'pez', destacado: 1, activo: 1,
    fish_specs: { scientific_name: 'Poecilia reticulata', temp_min: 22, temp_max: 28, ph_min: 7, ph_max: 8, adult_size_cm: 5, difficulty: 'beginner', lifespan_years: 2, feeding: 'omnivore', min_volume_liters: 40, water_type: 'fresh' },
    compatible_with: [],
  },
  {
    slug: 'tetra-neon', nombre_es: 'Tetra Neón', nombre_en: 'Neon Tetra',
    descripcion_es: 'Pequeño pez de cardumen con una característica línea azul iridiscente. Muy popular en acuarios comunitarios.',
    descripcion_en: 'Small schooling fish with a characteristic iridescent blue line. Very popular in community aquariums.',
    category_slug: 'peces-tropicales', brand: 'N/A', sku: 'FISH-NEO-001',
    precio_mxn: 25, precio_usd: 1.5, stock: 80, images: ['/img/productos/tetraneon.png'], size_cm: '3-4',
    tipo: 'pez', destacado: 0, activo: 1,
    fish_specs: { scientific_name: 'Paracheirodon innesi', temp_min: 23, temp_max: 27, ph_min: 5.5, ph_max: 7, adult_size_cm: 4, difficulty: 'beginner', lifespan_years: 5, feeding: 'omnivore', min_volume_liters: 60, water_type: 'fresh' },
    compatible_with: [],
  },
  {
    slug: 'corydora-pygmaeus', nombre_es: 'Corydora Pigmea', nombre_en: 'Pygmy Corydora',
    descripcion_es: 'Bagre pequeño y pacífico que habita el fondo del acuario. Excelente para acuarios comunitarios.',
    descripcion_en: 'Small, peaceful catfish that inhabits the bottom of the aquarium. Excellent for community tanks.',
    category_slug: 'peces-tropicales', brand: 'N/A', sku: 'FISH-COR-001',
    precio_mxn: 45, precio_usd: 2.5, stock: 40, images: ['/img/productos/corydora.png'], size_cm: '3',
    tipo: 'pez', destacado: 0, activo: 1,
    fish_specs: { scientific_name: 'Corydoras pygmaeus', temp_min: 22, temp_max: 26, ph_min: 6.5, ph_max: 7.5, adult_size_cm: 3, difficulty: 'beginner', lifespan_years: 4, feeding: 'omnivore', min_volume_liters: 40, water_type: 'fresh' },
    compatible_with: [],
  },
  {
    slug: 'pez-angel', nombre_es: 'Pez Ángel', nombre_en: 'Angelfish',
    descripcion_es: 'Pez elegante y majestuoso con aletas largas y forma triangular. Requiere un acuario alto.',
    descripcion_en: 'Elegant and majestic fish with long fins and triangular shape. Requires a tall aquarium.',
    category_slug: 'peces-tropicales', brand: 'N/A', sku: 'FISH-ANG-001',
    precio_mxn: 120, precio_usd: 7, stock: 15, images: ['/img/productos/angel.png'], size_cm: '15',
    tipo: 'pez', destacado: 1, activo: 1,
    fish_specs: { scientific_name: 'Pterophyllum scalare', temp_min: 24, temp_max: 30, ph_min: 6, ph_max: 7.5, adult_size_cm: 15, difficulty: 'intermediate', lifespan_years: 10, feeding: 'omnivore', min_volume_liters: 120, water_type: 'fresh' },
    compatible_with: [],
  },
  {
    slug: 'pez-dorado', nombre_es: 'Pez Dorado', nombre_en: 'Goldfish',
    descripcion_es: 'El clásico pez de agua fría. Resistente y fácil de cuidar, pero requiere espacio adecuado.',
    descripcion_en: 'The classic cold water fish. Hardy and easy to care for, but requires adequate space.',
    category_slug: 'peces-agua-fria', brand: 'N/A', sku: 'FISH-GOL-001',
    precio_mxn: 60, precio_usd: 3.5, stock: 20, images: ['/img/productos/golfish.png'], size_cm: '15-25',
    tipo: 'pez', destacado: 1, activo: 1,
    fish_specs: { scientific_name: 'Carassius auratus', temp_min: 18, temp_max: 23, ph_min: 7, ph_max: 8, adult_size_cm: 25, difficulty: 'beginner', lifespan_years: 15, feeding: 'omnivore', min_volume_liters: 100, water_type: 'fresh' },
    compatible_with: [],
  },
  {
    slug: 'koi', nombre_es: 'Koi', nombre_en: 'Koi',
    descripcion_es: 'Pez ornamental de gran tamaño y colores vibrantes. Ideal para estanques al aire libre. Muy longevo y apreciado en la cultura japonesa.',
    descripcion_en: 'Large ornamental fish with vibrant colors. Ideal for outdoor ponds. Very long-lived and appreciated in Japanese culture.',
    category_slug: 'peces-agua-fria', brand: 'N/A', sku: 'FISH-KOI-001',
    precio_mxn: 350, precio_usd: 20, stock: 10, images: ['/img/productos/koi.png'], size_cm: '30-60',
    tipo: 'pez', destacado: 0, activo: 1,
    fish_specs: { scientific_name: 'Cyprinus rubrofuscus', temp_min: 15, temp_max: 25, ph_min: 7, ph_max: 8.5, adult_size_cm: 60, difficulty: 'intermediate', lifespan_years: 30, feeding: 'omnivore', min_volume_liters: 1000, water_type: 'fresh' },
    compatible_with: [],
  },
  {
    slug: 'pez-cebra', nombre_es: 'Pez Cebra', nombre_en: 'Zebrafish',
    descripcion_es: 'Pez pequeño y activo con rayas horizontales características. Ideal para acuarios comunitarios por su resistencia y temperamento pacífico.',
    descripcion_en: 'Small, active fish with characteristic horizontal stripes. Ideal for community aquariums due to its hardiness and peaceful temperament.',
    category_slug: 'peces-tropicales', brand: 'N/A', sku: 'FISH-ZEB-001',
    precio_mxn: 25, precio_usd: 1.5, stock: 80, images: ['/img/productos/zebras.png'], size_cm: '4-5',
    tipo: 'pez', destacado: 0, activo: 1,
    fish_specs: { scientific_name: 'Danio rerio', temp_min: 22, temp_max: 27, ph_min: 6.5, ph_max: 7.5, adult_size_cm: 5, difficulty: 'beginner', lifespan_years: 5, feeding: 'omnivore', min_volume_liters: 40, water_type: 'fresh' },
    compatible_with: [],
  },
]

const SEED_ACCESSORIES = [
  {
    slug: 'peceras', nombre_es: 'Peceras', nombre_en: 'Aquariums',
    descripcion_es: 'Peceras de vidrio de alta calidad. Incluyen tapa y luz LED básica. Ideales para peces tropicales y de agua fría.',
    descripcion_en: 'High quality glass aquariums. Includes lid and basic LED light. Ideal for tropical and cold water fish.',
    category_slug: 'peceras', brand: 'AcuaTech', sku: 'TNK-020-001',
    precio_mxn: 450, precio_usd: 25, stock: 0, images: ['/img/productos/peceras.png'], size_cm: 'variable',
    tipo: 'accesorio', destacado: 1, activo: 1,
    variants: [
      { name: '20 Litros', sku: 'TNK-020-001', price: 450, stock: 30 },
      { name: '40 Litros', sku: 'TNK-040-001', price: 650, stock: 20 },
      { name: '60 Litros', sku: 'TNK-060-001', price: 850, stock: 15 },
    ],
  },
  {
    slug: 'filtro-externo-500l', nombre_es: 'Filtro Externo 500 L/h', nombre_en: 'External Filter 500 L/h',
    descripcion_es: 'Filtro externo con bomba de 500 litros por hora. Ideal para acuarios de 60-100 litros. Incluye medios filtrantes.',
    descripcion_en: 'External filter with 500 liter per hour pump. Ideal for 60-100 liter aquariums. Includes filter media.',
    category_slug: 'filtros', brand: 'AquaClear', sku: 'FIL-EXT-500',
    precio_mxn: 890, precio_usd: 49, stock: 15, images: [], size_cm: '25x15x20',
  },
  {
    slug: 'filtro-interno-650lh', nombre_es: 'Filtro Interno 650 L/h', nombre_en: 'Internal Filter 650 L/h',
    descripcion_es: 'Filtro interno sumergible con bomba de 650 litros por hora. Incluye medios filtrantes y ventosas para fijación.',
    descripcion_en: 'Submersible internal filter with 650 liter per hour pump. Includes filter media and suction cups.',
    category_slug: 'filtros', brand: 'Marina', sku: 'FIL-INT-650',
    precio_mxn: 350, precio_usd: 19, stock: 20, images: ['/img/productos/filtro interno de 650LH.png'], size_cm: '20x10x15',
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
    precio_mxn: 180, precio_usd: 10, stock: 40, images: ['/img/productos/sustrato arena de silice.png'], size_cm: '30x20x5',
    tipo: 'accesorio', destacado: 0, activo: 1,
  },
  {
    slug: 'bomba-aire-simple', nombre_es: 'Bomba de Aire Simple', nombre_en: 'Single Air Pump',
    descripcion_es: 'Bomba de aire silenciosa para acuarios de hasta 60 litros. Incluye tubo y difusor de burbuja fina.',
    descripcion_en: 'Silent air pump for aquariums up to 60 liters. Includes tube and fine bubble diffuser.',
    category_slug: 'bombas-aire', brand: 'Marina', sku: 'AIR-PMP-001',
    precio_mxn: 220, precio_usd: 12, stock: 35, images: ['/img/productos/bomba de aire chica.png'], size_cm: '10x6x8',
    tipo: 'accesorio', destacado: 0, activo: 1,
  },
]

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
}

function seedCategories() {
  const db = _db!
  const existing = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }
  if (existing.count > 0) return
  const insert = db.prepare('INSERT INTO categories (slug, nombre_es, nombre_en, icon, parent_id) VALUES (@slug, @nombre_es, @nombre_en, @icon, @parent_id)')
  for (const c of CATEGORIES) insert.run(c)
}

function seedNewProducts() {
  const db = _db!
  const existing = db.prepare('SELECT COUNT(*) as count FROM new_products').get() as { count: number }
  if (existing.count > 0) return

  const insertProduct = db.prepare(`
    INSERT INTO new_products (slug, nombre_es, nombre_en, descripcion_es, descripcion_en, category_id, brand, sku, precio_mxn, precio_usd, stock, images, size_cm, variants, tipo, destacado, activo)
    VALUES (@slug, @nombre_es, @nombre_en, @descripcion_es, @descripcion_en, @category_id, @brand, @sku, @precio_mxn, @precio_usd, @stock, @imagenes, @size_cm, @variants, @tipo, @destacado, @activo)
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
      variants: '[]',
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
      variants: JSON.stringify(p.variants || []),
    })
    count++
  }
}

function seedCompatibility() {
  const db = _db!
  const existing = db.prepare('SELECT COUNT(*) as count FROM compatibility').get() as { count: number }
  if (existing.count > 0) return
  const insert = db.prepare('INSERT INTO compatibility (product_id, compatible_with_id) VALUES (?, ?)')
  const fish = db.prepare("SELECT id, slug FROM new_products WHERE tipo = 'pez'").all() as any[]
  const bySlug: Record<string, number> = {}
  for (const f of fish) bySlug[f.slug] = f.id

  const pairs: [string, string][] = [
    ['guppy', 'tetra-neon'], ['guppy', 'corydora-pygmaeus'], ['tetra-neon', 'corydora-pygmaeus'],
    ['betta-splendens', 'corydora-pygmaeus'],
    ['pez-angel', 'guppy'], ['pez-angel', 'tetra-neon'], ['pez-angel', 'corydora-pygmaeus'],
    ['pez-cebra', 'guppy'], ['pez-cebra', 'tetra-neon'], ['pez-cebra', 'corydora-pygmaeus'],
  ]
  let count = 0
  for (const [a, b] of pairs) {
    if (bySlug[a] && bySlug[b]) {
      insert.run(bySlug[a], bySlug[b])
      insert.run(bySlug[b], bySlug[a])
      count += 2
    }
  }
}

export function seed() {
  seedColors()
  seedProductTypes()
  seedModels()
  seedCategories()
  seedNewProducts()
  seedCompatibility()
}

export { CATEGORIES, SEED_FISH, SEED_ACCESSORIES }
