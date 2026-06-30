import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getPosts, getPostBySlug, upsertPost, deletePost } from '@/lib/repositories/blog'
import type { BlogPostFormData } from '@/types'

export async function GET(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth
  return NextResponse.json(getPosts())
}

export async function POST(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data: BlogPostFormData = await req.json()
  const errors: string[] = []
  if (!data.slug?.trim()) errors.push('Slug requerido')
  if (!data.title_es?.trim()) errors.push('Título (ES) requerido')
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 400 })

  return NextResponse.json(upsertPost(data))
}

export async function PUT(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const data = await req.json()
  if (!data.id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  return NextResponse.json(upsertPost(data as BlogPostFormData & { id: number }))
}

export async function DELETE(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  deletePost(id)
  return NextResponse.json({ success: true })
}
