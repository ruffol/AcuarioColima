import { NextResponse } from 'next/server'
import { getColors, upsertColor, deleteColor } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function GET(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth
  const colors = getColors()
  return NextResponse.json(colors)
}

export async function POST(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data = await req.json()
  const errors: string[] = []
  if (!data.slug?.trim()) errors.push('Slug requerido')
  if (!data.nombre_es?.trim()) errors.push('Nombre (ES) requerido')
  if (!data.nombre_en?.trim()) errors.push('Nombre (EN) requerido')
  if (!data.hex_code?.trim()) errors.push('Código hex requerido')
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  const color = upsertColor(data)
  return NextResponse.json(color)
}

export async function PUT(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data = await req.json()
  const errors: string[] = []
  if (!data.slug?.trim()) errors.push('Slug requerido')
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  const color = upsertColor(data)
  return NextResponse.json(color)
}

export async function DELETE(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  deleteColor(id)
  return NextResponse.json({ success: true })
}
