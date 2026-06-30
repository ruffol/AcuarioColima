import { createHmac, randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { getSetting, setSetting } from '@/lib/db'

export function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET || getSetting('admin_secret')
  if (!secret) {
    throw new Error('ADMIN_SECRET no configurado. Define ADMIN_SECRET en .env.local o en settings.')
  }
  return secret
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

function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)
  const cookieHeader = req.headers.get('cookie')
  if (!cookieHeader) return null
  const match = cookieHeader.match(/(?:^|;\s*)admin_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function requireAdmin(req: Request): NextResponse | null {
  const token = getTokenFromRequest(req)
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  return null
}

const MAX_ATTEMPTS = 5
const WINDOW_MS = 60_000

function rateLimitKey(ip: string): string {
  return `ratelimit:${ip}`
}

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const key = rateLimitKey(ip)
  const raw = getSetting(key)
  if (raw) {
    try {
      const entry = JSON.parse(raw)
      if (now < entry.resetAt) {
        if (entry.count >= MAX_ATTEMPTS) return false
        setSetting(key, JSON.stringify({ count: entry.count + 1, resetAt: entry.resetAt }))
        return true
      }
    } catch {}
  }
  setSetting(key, JSON.stringify({ count: 1, resetAt: now + WINDOW_MS }))
  return true
}

// Clean up expired entries (runs hourly in long-running processes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    // Expired entries will be overwritten on next access
  }, 3600_000)
}

export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'
}
