import { NextResponse } from 'next/server'
import { getAdminSecret, createAdminToken, requireAdmin, checkRateLimit, getClientIp } from '@/lib/admin'

export async function GET(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return NextResponse.json({ authed: false }, { status: 401 })
  return NextResponse.json({ authed: true })
}

export async function POST(req: Request) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Demasiados intentos. Espera un minuto.' }, { status: 429 })
  }

  const { password } = await req.json()

  if (password === getAdminSecret()) {
    const token = createAdminToken()
    const response = NextResponse.json({ verified: true, token })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/',
    })
    return response
  }

  return NextResponse.json({ verified: false }, { status: 401 })
}

export async function DELETE() {
  const response = NextResponse.json({ logout: true })
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  return response
}
