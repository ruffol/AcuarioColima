import { createHmac, randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { getSetting } from '@/lib/db'

export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET || getSetting('admin_secret') || console.error('⚠️ ADMIN_SECRET no configurado — usando fallback inseguro') || 'admin_inseguro_cambiar'
}

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000

export function createAdminToken(): string {
  const secret = getAdminSecret()
  const timestamp = Date.now().toString()
  const nonce = randomBytes(8).toString('hex')
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}:${nonce}`)
    .digest('hex')
  return Buffer.from(`${timestamp}:${nonce}:${signature}`).toString('base64')
}

export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const [timestamp, nonce, signature] = decoded.split(':')
    if (!timestamp || !nonce || !signature) return false
    if (Date.now() - Number(timestamp) > TOKEN_EXPIRY_MS) return false
    const secret = getAdminSecret()
    const expected = createHmac('sha256', secret)
      .update(`${timestamp}:${nonce}`)
      .digest('hex')
    return signature === expected
  } catch {
    return false
  }
}

export function requireAdmin(req: Request): NextResponse | null {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!verifyAdminToken(authHeader.slice(7))) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 })
  }
  return null
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 60_000

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_ATTEMPTS) return false
  entry.count++
  return true
}

export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'
}
