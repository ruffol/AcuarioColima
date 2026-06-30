'use client'

import { usePathname, useRouter } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { useTransition } from 'react'

export default function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const toggle = () => {
    const next = locale === 'es' ? 'en' : 'es'
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="text-sm font-medium text-blue-200/60 hover:text-white transition-colors"
    >
      {locale === 'es' ? 'EN' : 'ES'}
    </button>
  )
}
