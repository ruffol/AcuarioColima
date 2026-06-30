import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getFishSpecs, upsertFishSpecs } from '@/lib/repositories/fish'
import type { FishSpecsFormData } from '@/types'

export async function GET(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const url = new URL(req.url)
  const productId = parseInt(url.searchParams.get('product_id') || '0')
  if (!productId) return NextResponse.json({ error: 'product_id requerido' }, { status: 400 })

  const specs = getFishSpecs(productId)
  return NextResponse.json(specs || {})
}

export async function POST(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data = await req.json()
  const { product_id, ...specs } = data
  if (!product_id) return NextResponse.json({ error: 'product_id requerido' }, { status: 400 })

  return NextResponse.json(upsertFishSpecs(product_id, specs as FishSpecsFormData))
}
