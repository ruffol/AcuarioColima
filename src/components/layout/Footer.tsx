'use client'

import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { WHATSAPP_NUMBER } from '@/lib/constants'
import ThemeToggle from './ThemeToggle'


export default function Footer() {
  const t = useTranslations('Footer')
  const locale = useLocale()

  return (
    <footer className="bg-[#0B1220] border-t border-[#1e2d3d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold">
                P
              </div>
              <span className="text-lg font-bold text-white font-[family-name:var(--font-heading)]">
                AcuarioColima
              </span>
            </div>
            <p className="text-sm text-blue-200/60 leading-relaxed">
              {t('envios')}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <ThemeToggle />

            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {t('navegacion') || 'Navegación'}
            </h3>
            <nav className="flex flex-col gap-2.5">
              <Link href="/" className="text-sm text-blue-200/60 hover:text-secondary transition-colors">{t('inicio')}</Link>
              <Link href="/productos" className="text-sm text-blue-200/60 hover:text-secondary transition-colors">{t('productos')}</Link>
              <Link href="/productos?tipo=pez" className="text-sm text-blue-200/60 hover:text-secondary transition-colors">Peces</Link>
              <Link href="/productos?tipo=accesorio" className="text-sm text-blue-200/60 hover:text-secondary transition-colors">Accesorios</Link>
              <Link href="/blog" className="text-sm text-blue-200/60 hover:text-secondary transition-colors">Blog</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">{t('contacto')}</h3>
            <div className="flex flex-col gap-3">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-200/60 hover:text-secondary transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-success">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
                312 133 7694
              </a>
              <a href="mailto:srtlalchichi@gmail.com" className="flex items-center gap-2 text-sm text-blue-200/60 hover:text-secondary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                srtlalchichi@gmail.com
              </a>
            </div>
          </div>

          {/* Payment methods */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {locale === 'es' ? 'Métodos de pago' : 'Payment methods'}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-blue-200/60 text-xs">Visa</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-blue-200/60 text-xs">Mastercard</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-blue-200/60 text-xs">PayPal</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-blue-200/60 text-xs">Stripe</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-blue-200/60 text-xs">OXXO</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-blue-200/60 text-xs">SPEI</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1e2d3d] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-blue-200/40">
          <p>&copy; {new Date().getFullYear()} AcuarioColima. {t('derechos')}</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-secondary transition-colors">Términos</a>
            <a href="#" className="hover:text-secondary transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
