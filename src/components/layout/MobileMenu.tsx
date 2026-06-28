'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import LanguageToggle from './LanguageToggle'
import { useEffect } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: Props) {
  const t = useTranslations('Navbar')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-72 bg-card shadow-xl p-6">
        <div className="flex justify-between items-center mb-8">
          <LanguageToggle />
          <button onClick={onClose} className="p-2 text-negro-suave">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-4">
          <Link href="/" className="text-lg font-medium py-2" onClick={onClose}>
            {t('inicio')}
          </Link>
          <Link href="/productos" className="text-lg font-medium py-2" onClick={onClose}>
            {t('productos')}
          </Link>
          <Link href="/nosotros" className="text-lg font-medium py-2" onClick={onClose}>
            {t('nosotros')}
          </Link>
        </nav>
      </div>
    </div>
  )
}
