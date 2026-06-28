import { NextResponse } from 'next/server'
import { getModels, upsertModel, deleteModel } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function GET(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth
  const models = getModels()
  return NextResponse.json(models)
}

export async function POST(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data = await req.json()
  const errors: string[] = []
  if (!data.slug?.trim()) errors.push('Slug requerido')
  if (!data.nombre_es?.trim()) errors.push('Nombre (ES) requerido')
  if (!data.nombre_en?.trim()) errors.push('Nombre (EN) requerido')
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  const model = upsertModel({
    ...data,
    imagenes: data.imagenes ? JSON.stringify(data.imagenes) : '[]',
    destacado: data.destacado ? 1 : 0,
    activo: data.activo !== undefined ? (data.activo ? 1 : 0) : 1,
  })
  return NextResponse.json(model)
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

  const model = upsertModel({
    ...data,
    imagenes: data.imagenes ? JSON.stringify(data.imagenes) : '[]',
    destacado: data.destacado ? 1 : 0,
  })
  return NextResponse.json(model)
}

export async function DELETE(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  deleteModel(id)
  return NextResponse.json({ success: true })
}
