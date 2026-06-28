'use client'

import { useState, useCallback } from 'react'

export function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') : null
  return token ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

export function useAdminToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' }>({ message: '', type: 'success' })

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: 'success' }), 3000)
  }, [])

  return { toast, showToast }
}

/**
 * Simple CRUD helper for admin panels
 */
export function useAdminCrud<T extends { id: number }>(
  apiUrl: string,
  fetchList: () => Promise<T[]>,
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)

  const load = useCallback(async () => {
    const data = await fetchList()
    setItems(data)
    setLoading(false)
  }, [fetchList])

  const save = useCallback(async (url: string, method: string, body: any) => {
    setSaving(true)
    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) })
    const data = await res.json()
    setSaving(false)
    return { ok: res.ok, data }
  }, [])

  const remove = useCallback(async (id: number) => {
    await fetch(apiUrl, { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ id }) })
    load()
  }, [apiUrl, load])

  const cancel = useCallback(() => {
    setEditing(null)
  }, [])

  return { items, loading, saving, editing, setEditing, load, save, remove, cancel }
}
