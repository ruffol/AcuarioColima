import { NextResponse } from 'next/server'
import { getProducts, upsertProduct, deleteProduct } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function GET(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth
  const products = getProducts()
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
  if (!data.categoria_es?.trim()) errors.push('Categoría (ES) requerida')
  if (!data.categoria_en?.trim()) errors.push('Categoría (EN) requerida')
  if (data.precio_mxn < 0) errors.push('precio_mxn debe ser positivo')
  if (data.precio_usd < 0) errors.push('precio_usd debe ser positivo')
  if (data.stock < 0) errors.push('stock debe ser positivo')
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  const product = upsertProduct({
    ...data,
    imagenes: data.imagenes ? JSON.stringify(data.imagenes) : '[]',
    destacado: data.destacado ? 1 : 0,
    activo: data.activo !== undefined ? (data.activo ? 1 : 0) : 1,
  })
  return NextResponse.json(product)
}

export async function PUT(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data = await req.json()
  const errors: string[] = []
  if (!data.slug?.trim()) errors.push('Slug requerido')
  if (data.precio_mxn < 0) errors.push('precio_mxn debe ser positivo')
  if (data.precio_usd < 0) errors.push('precio_usd debe ser positivo')
  if (data.stock < 0) errors.push('stock debe ser positivo')
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  const product = upsertProduct({
    ...data,
    imagenes: data.imagenes ? JSON.stringify(data.imagenes) : '[]',
    destacado: data.destacado ? 1 : 0,
  })
  return NextResponse.json(product)
}

export async function DELETE(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  deleteProduct(id)
  return NextResponse.json({ success: true })
}
