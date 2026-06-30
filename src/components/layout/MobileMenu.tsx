'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import LanguageToggle from './LanguageToggle'
import ThemeToggle from './ThemeToggle'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: Props) {
  const t = useTranslations('Navbar')

  useBodyScrollLock(isOpen)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-72 bg-card border-l border-border shadow-xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">P</div>
            <span className="text-sm font-bold text-foreground font-[family-name:var(--font-heading)]">AcuarioColima</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          <Link href="/" className="px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-surface transition-colors" onClick={onClose}>
            {t('inicio')}
          </Link>
          <Link href="/productos" className="px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-surface transition-colors" onClick={onClose}>
            {t('productos')}
          </Link>
          <Link href="/productos?tipo=pez" className="px-3 py-3 rounded-xl text-sm font-medium text-muted hover:bg-surface transition-colors" onClick={onClose}>
            🐠 Peces
          </Link>
          <Link href="/productos?tipo=accesorio" className="px-3 py-3 rounded-xl text-sm font-medium text-muted hover:bg-surface transition-colors" onClick={onClose}>
            💧 Accesorios
          </Link>
          <Link href="/blog" className="px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-surface transition-colors" onClick={onClose}>
            Blog
          </Link>
        </nav>

        <div className="mt-8 pt-6 border-t border-border flex items-center gap-3">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </div>
  )
}
