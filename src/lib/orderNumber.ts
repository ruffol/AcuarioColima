import { getDb } from './db/connection'

const PREFIX = 'TLC'

function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayCompact(): string {
  return today().replace(/-/g, '')
}

export function generateOrderNumber(): string {
  const db = getDb()
  const date = today()
  const seq = db.transaction(() => {
    const row = db.prepare('SELECT lastNumber FROM order_sequences WHERE date = ?').get(date) as any
    const next = (row?.lastNumber ?? 0) + 1
    db.prepare(
      'INSERT INTO order_sequences (date, lastNumber) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET lastNumber = excluded.lastNumber'
    ).run(date, next)
    return next
  })()
  return `${PREFIX}-${todayCompact()}-${String(seq).padStart(3, '0')}`
}
