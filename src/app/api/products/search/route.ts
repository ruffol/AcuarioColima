import { NextResponse } from 'next/server'
import { getModels } from '@/lib/db'
import { getProducts } from '@/lib/repositories/products'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const busqueda = url.searchParams.get('busqueda') || ''
  const tipo = url.searchParams.get('tipo') || '' // old: llaveros/portamacetas | new: pez/accesorio
  const agua = url.searchParams.get('agua') || ''
  const dificultad = url.searchParams.get('dificultad') || ''
  const precioMin = parseFloat(url.searchParams.get('precio_min') || '')
  const precioMax = parseFloat(url.searchParams.get('precio_max') || '')
  const categorySlug = url.searchParams.get('category_slug') || ''
  const soloAcuario = url.searchParams.get('acuario') === 'true'

  // 1. Old models (only if not filtering by new-only params)
  let oldModels: any[] = []
  if (!soloAcuario && !agua && !dificultad) {
    if (tipo && ['llaveros', 'portamacetas', 'alcacias', 'cuencos'].includes(tipo)) {
      const { getModelsByType } = await import('@/lib/db')
      oldModels = getModelsByType(tipo)
    } else {
      oldModels = getModels({ activo: true })
    }

    // Apply search to old models
    if (busqueda) {
      const q = busqueda.toLowerCase()
      oldModels = oldModels.filter((m: any) =>
        m.nombre_es?.toLowerCase().includes(q) ||
        m.nombre_en?.toLowerCase().includes(q) ||
        m.slug?.toLowerCase().includes(q) ||
        m.descripcion_es?.toLowerCase().includes(q)
      )
    }

    // Map old models to unified format
    oldModels = oldModels.map((m: any) => ({
      id: `old_${m.id}`,
      source: 'model',
      slug: m.slug,
      nombre_es: m.nombre_es,
      nombre_en: m.nombre_en,
      descripcion_es: m.descripcion_es,
      descripcion_en: m.descripcion_en,
      precio_mxn: m.precio_mxn,
      precio_usd: m.precio_usd,
      stock: m.stock,
      image: Array.isArray(m.imagenes) ? m.imagenes[0] || null : null,
      tipo: 'artesania',
      category: m.categoria_es,
    }))
  }

  // 2. New products
  const newProducts = getProducts({
    busqueda: busqueda || undefined,
    tipo: (tipo && ['pez', 'accesorio'].includes(tipo)) ? tipo : undefined,
    category_slug: categorySlug || undefined,
    agua: agua || undefined,
    dificultad: dificultad || undefined,
    precio_min: precioMin || undefined,
    precio_max: precioMax || undefined,
    activo: true,
  })

  const unified = newProducts.map((p: any) => ({
    id: `new_${p.id}`,
    source: 'product',
    slug: p.slug,
    nombre_es: p.nombre_es,
    nombre_en: p.nombre_en,
    descripcion_es: p.descripcion_es,
    descripcion_en: p.descripcion_en,
    precio_mxn: p.precio_mxn,
    precio_usd: p.precio_usd,
    stock: p.stock,
    image: Array.isArray(p.images) ? p.images[0] || null : null,
    tipo: p.tipo,
    category: null, // could add category name here
    water_type: (p as any).water_type,
    difficulty: (p as any).difficulty,
  }))

  const combined = [...oldModels, ...unified]

  // Apply price filter (needed for old models since repo only does new)
  if (precioMin || precioMax) {
    return NextResponse.json(
      combined.filter((p: any) => {
        if (precioMin && p.precio_mxn < precioMin) return false
        if (precioMax && p.precio_mxn > precioMax) return false
        return true
      })
    )
  }

  return NextResponse.json(combined)
}
