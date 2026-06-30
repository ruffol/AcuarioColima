import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getProducts, getProductBySlug, upsertProduct, deleteProduct } from '@/lib/repositories/products'
import { upsertFishSpecs, deleteFishSpecs, getFishSpecs } from '@/lib/repositories/fish'
import type { ProductFormData } from '@/types'

export async function GET(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const url = new URL(req.url)
  const filters: any = {}
  if (url.searchParams.get('tipo')) filters.tipo = url.searchParams.get('tipo')!
  if (url.searchParams.get('category_slug')) filters.category_slug = url.searchParams.get('category_slug')!
  if (url.searchParams.get('activo')) filters.activo = url.searchParams.get('activo') === 'true'

  const products = getProducts(filters)
  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data = await req.json()
  const errors: string[] = []
  if (!data.slug?.trim()) errors.push('Slug requerido')
  if (!data.nombre_es?.trim()) errors.push('Nombre (ES) requerido')
  if (!data.nombre_en?.trim()) errors.push('Nombre (EN) requerido')
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 400 })

  const product = upsertProduct(data as ProductFormData)

  if (data.tipo === 'pez' && data.fish_specs) {
    upsertFishSpecs(product.id, data.fish_specs)
  }

  return NextResponse.json(getProductBySlug(product.slug))
}

export async function PUT(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data = await req.json()
  if (!data.id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const product = upsertProduct(data as ProductFormData & { id: number })

  if (data.tipo === 'pez') {
    if (data.fish_specs) {
      upsertFishSpecs(product.id, data.fish_specs)
    }
  } else {
    deleteFishSpecs(product.id)
  }

  return NextResponse.json(getProductBySlug(product.slug))
}

export async function DELETE(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  deleteProduct(id)
  return NextResponse.json({ success: true })
}
