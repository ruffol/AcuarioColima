import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getCategories, getCategoryBySlug, upsertCategory, deleteCategory } from '@/lib/repositories/categories'
import type { CategoryFormData } from '@/types'

export async function GET(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth
  return NextResponse.json(getCategories())
}

export async function POST(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data: CategoryFormData = await req.json()
  const errors: string[] = []
  if (!data.slug?.trim()) errors.push('Slug requerido')
  if (!data.nombre_es?.trim()) errors.push('Nombre (ES) requerido')
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 400 })

  return NextResponse.json(upsertCategory(data))
}

export async function PUT(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data = await req.json()
  if (!data.id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  return NextResponse.json(upsertCategory(data as CategoryFormData & { id: number }))
}

export async function DELETE(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  deleteCategory(id)
  return NextResponse.json({ success: true })
}
