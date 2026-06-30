'use client'

import { useEffect, useCallback } from 'react'
import { CloseIcon } from '@/components/ui/icons'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function Modal({ open, onClose, title, children }: Props) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, handleKey])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
          <button onClick={onClose} className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors ml-auto">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
