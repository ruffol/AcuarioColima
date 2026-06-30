'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { Link, usePathname } from '@/i18n/routing'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations('Admin')
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/verify')
      .then((res) => {
        if (res.ok) setAuthed(true)
      })
      .catch(() => {})
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (res.ok && data.token) {
        setAuthed(true)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/verify', { method: 'DELETE' })
    setAuthed(false)
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-24">
        <h1 className="text-2xl font-bold text-negro-suave mb-6 text-center">
          {t('titulo')}
        </h1>
        <div className="space-y-4">
          <Input
            type="password"
            label={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            error={error ? 'Contraseña incorrecta' : undefined}
          />
          <Button onClick={handleLogin} loading={loading} className="w-full">
            {t('entrar')}
          </Button>
        </div>
      </div>
    )
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/') ? 'bg-arena text-negro-suave' : 'text-muted hover:text-negro-suave'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between gap-6 mb-8 pb-4 border-b border-arena">
        <div className="flex items-center gap-6 min-w-0">
          <h1 className="text-2xl font-bold text-negro-suave">{t('titulo')}</h1>
          <nav className="flex gap-1 text-sm font-medium">
            <Link href="/admin" className={`px-3 py-1.5 rounded-lg transition-colors ${isActive('/admin')}`}>
              {t('productos')}
            </Link>
            <Link href="/admin/ordenes" className={`px-3 py-1.5 rounded-lg transition-colors ${isActive('/admin/ordenes')}`}>
              {t('ordenes')}
            </Link>
            <Link href="/admin/acuario" className={`px-3 py-1.5 rounded-lg transition-colors ${isActive('/admin/acuario')}`}>
              Acuario
            </Link>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-muted hover:text-negro-suave transition-colors px-3 py-1.5 rounded-lg hover:bg-arena/50"
        >
          Cerrar sesión
        </button>
      </div>
      {children}
    </div>
  )
}
