import { NextResponse } from 'next/server'
import { getAvailability, upsertAvailability, deleteAvailability } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function GET(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth
  const url = new URL(req.url)
  const modelId = url.searchParams.get('modelId')
  const productTypeId = url.searchParams.get('productTypeId')
  const availability = getAvailability(
    modelId ? parseInt(modelId) : undefined,
    productTypeId ? parseInt(productTypeId) : undefined
  )
  return NextResponse.json(availability)
}

export async function POST(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data = await req.json()
  const errors: string[] = []
  if (!data.model_id) errors.push('model_id requerido')
  if (!data.product_type_id) errors.push('product_type_id requerido')
  if (data.stock === undefined || data.stock < 0) errors.push('stock debe ser positivo')
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  const availability = upsertAvailability(data)
  return NextResponse.json(availability)
}

export async function DELETE(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  deleteAvailability(id)
  return NextResponse.json({ success: true })
}
