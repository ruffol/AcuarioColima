import { NextResponse } from 'next/server'
import { getAdminSecret, createAdminToken, checkRateLimit, getClientIp } from '@/lib/admin'

export async function POST(req: Request) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Demasiados intentos. Espera un minuto.' }, { status: 429 })
  }

  const { password } = await req.json()

  if (password === getAdminSecret()) {
    const token = createAdminToken()
    return NextResponse.json({ verified: true, token })
  }

  return NextResponse.json({ verified: false }, { status: 401 })
}
