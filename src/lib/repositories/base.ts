import Database from 'better-sqlite3'
import { getDb } from '@/lib/db'

export function useDb(): Database.Database {
  return getDb()
}

export function parseJson<T>(val: string | undefined | null, fallback: T): T {
  if (!val) return fallback
  try { return JSON.parse(val) } catch { return fallback }
}

export function boolToInt(v: boolean | number | undefined): number {
  return v ? 1 : 0
}

export function intToBool(v: number | undefined): boolean {
  return !!v
}
