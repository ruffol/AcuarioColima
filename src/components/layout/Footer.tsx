'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

export default function Footer() {
  const t = useTranslations('Footer')

  return (
    <footer className="py-16 mt-24" style={{ background: 'var(--footer-bg)', color: '#e8e2da' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Tlalchichi Store</h3>
            <p className="text-sm" style={{ color: 'var(--footer-text)' }}>
              {t('envios')}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Navegación</h3>
            <nav className="flex flex-col gap-2 text-sm" style={{ color: 'var(--footer-text)' }}>
              <Link href="/" className="hover:text-terracota-light transition-colors">
                {t('inicio')}
              </Link>
              <Link href="/productos" className="hover:text-terracota-light transition-colors">
                {t('productos')}
              </Link>
              <Link href="/nosotros" className="hover:text-terracota-light transition-colors">
                {t('nosotros')}
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('contacto')}</h3>
            <div className="flex flex-col gap-3 text-sm" style={{ color: 'var(--footer-text)' }}>
              <a
                href="https://wa.me/523121337694"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-terracota-light transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="#25D366" className="w-4 h-4 flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
                <span>312 133 7694</span>
              </a>
              <a
                href="mailto:srtlalchichi@gmail.com"
                className="flex items-center gap-2 hover:text-terracota-light transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span>srtlalchichi@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 text-center text-sm" style={{ borderTop: '1px solid var(--footer-border)', color: 'var(--footer-text)' }}>
          &copy; {new Date().getFullYear()} Tlalchichi. {t('derechos')}.
        </div>
      </div>
    </footer>
  )
}
