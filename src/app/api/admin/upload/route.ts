import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Tipo de archivo no válido. Solo: JPG, PNG, WebP, GIF' },
      { status: 400 },
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'El archivo excede 5MB' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${crypto.randomUUID()}.${ext}`
  const dir = path.join(process.cwd(), 'public', 'img', 'productos')

  await mkdir(dir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(dir, filename), buffer)

  return NextResponse.json({ url: `/img/productos/${filename}` })
}
