'use client'

import { useEffect, useState } from 'react'
import { CloseIcon } from '@/components/ui/icons'

interface ToastData {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
}

let addToastFn: ((t: ToastData) => void) | null = null

export function showToast(message: string, type: ToastData['type'] = 'info') {
  addToastFn?.({ id: Date.now().toString(), message, type })
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    addToastFn = (t) => {
      setToasts((prev) => [...prev, t])
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id))
      }, 4000)
    }
    return () => { addToastFn = null }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => {
        const colors = {
          success: 'bg-green-600 text-white',
          error: 'bg-red-600 text-white',
          info: 'bg-card border border-border text-foreground',
        }
        return (
          <div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-3 animate-slide-up ${colors[t.type || 'info']}`}>
            <span className="flex-1">{t.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>
              <CloseIcon className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
