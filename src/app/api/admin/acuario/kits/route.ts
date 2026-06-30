import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getKits, getKitBySlug, upsertKit, deleteKit, getKitItems, setKitItems } from '@/lib/repositories/kits'
import type { KitFormData } from '@/types'

export async function GET(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth
  return NextResponse.json(getKits())
}

export async function POST(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data = await req.json()
  const { items, ...kitData } = data
  const errors: string[] = []
  if (!kitData.slug?.trim()) errors.push('Slug requerido')
  if (!kitData.nombre_es?.trim()) errors.push('Nombre (ES) requerido')
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 400 })

  const kit = upsertKit(kitData as KitFormData)
  if (items?.length) setKitItems(kit.id, items)

  return NextResponse.json({ ...kit, items: getKitItems(kit.id) })
}

export async function PUT(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data = await req.json()
  const { items, ...kitData } = data
  if (!kitData.id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const kit = upsertKit(kitData as KitFormData & { id: number })
  if (items?.length) setKitItems(kit.id, items)

  return NextResponse.json({ ...kit, items: getKitItems(kit.id) })
}

export async function DELETE(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  deleteKit(id)
  return NextResponse.json({ success: true })
}
