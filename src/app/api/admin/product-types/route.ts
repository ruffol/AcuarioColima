import { NextResponse } from 'next/server'
import { getProductTypes, upsertProductType, deleteProductType } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function GET(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth
  const types = getProductTypes()
  return NextResponse.json(types)
}

export async function POST(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data = await req.json()
  const errors: string[] = []
  if (!data.slug?.trim()) errors.push('Slug requerido')
  if (!data.nombre_es?.trim()) errors.push('Nombre (ES) requerido')
  if (!data.nombre_en?.trim()) errors.push('Nombre (EN) requerido')
  if (data.precio_mxn < 0) errors.push('precio_mxn debe ser positivo')
  if (data.precio_usd < 0) errors.push('precio_usd debe ser positivo')
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  const type = upsertProductType(data)
  return NextResponse.json(type)
}

export async function PUT(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data = await req.json()
  const errors: string[] = []
  if (!data.slug?.trim()) errors.push('Slug requerido')
  if (data.precio_mxn < 0) errors.push('precio_mxn debe ser positivo')
  if (data.precio_usd < 0) errors.push('precio_usd debe ser positivo')
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  const type = upsertProductType(data)
  return NextResponse.json(type)
}

export async function DELETE(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  deleteProductType(id)
  return NextResponse.json({ success: true })
}
