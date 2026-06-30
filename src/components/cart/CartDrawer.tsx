'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useCartStore, getSubtotal, getItemCount, getTotal, getShippingCost } from '@/store/cart'
import { Link } from '@/i18n/routing'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { SHIPPING_RATES, type ShippingDestination } from '@/types'

const FREE_SHIPPING_THRESHOLD = 999

export default function CartDrawer() {
  const t = useTranslations('Cart')
  const locale = useLocale()
  const { items, isOpen, closeCart, pais, setPais, removeItem, updateQuantity } = useCartStore()

  const validItems = items.filter((item) => {
    const v = item?.variant
    return v && typeof v.precio_mxn === 'number' && typeof v.precio_usd === 'number'
  })

  const count = getItemCount(validItems)
  const subtotal = getSubtotal(validItems, pais === 'MX' ? 'MXN' : 'USD')
  const shipping = getShippingCost(pais, pais === 'MX' ? 'MXN' : 'USD')
  const total = subtotal + shipping
  const moneda = pais === 'MX' ? 'MXN' : 'USD'
  const freeShippingProgress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1)

  useBodyScrollLock(isOpen)

  const shippingOptions = (Object.entries(SHIPPING_RATES) as [ShippingDestination, typeof SHIPPING_RATES[ShippingDestination]][]).map(
    ([key, val]) => ({
      value: key,
      label: `${val.label_es} — ${moneda === 'MXN' && val.MXN > 0 ? `$${val.MXN} MXN` : val.USD > 0 ? `$${val.USD} USD` : 'Gratis'}`,
    })
  )

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeCart} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-xl flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground font-[family-name:var(--font-heading)]">
                {t('titulo')} <span className="text-muted font-normal">({getItemCount(validItems)})</span>
              </h2>
              <button onClick={closeCart} className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {validItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-muted">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <p className="text-foreground font-medium mb-1">{t('vacio')}</p>
                <p className="text-sm text-muted mb-6">{t('vacio_desc')}</p>
                <button onClick={closeCart} className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
                  {t('seguir')}
                </button>
              </div>
            ) : (
              <>
                {/* Free shipping progress bar */}
                <div className="px-4 pt-3 pb-1">
                  <div className="bg-surface rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-success h-full rounded-full transition-all duration-300"
                      style={{ width: `${freeShippingProgress * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted mt-1.5">
                    {subtotal < FREE_SHIPPING_THRESHOLD
                      ? `${locale === 'es' ? `Faltan $${FREE_SHIPPING_THRESHOLD - subtotal} MXN para envío gratis` : `$${FREE_SHIPPING_THRESHOLD - subtotal} MXN away from free shipping`}`
                      : locale === 'es' ? '🎉 Envío gratis' : '🎉 Free shipping'}
                  </p>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {validItems.map((item) => {
                    const v = item.variant
                    const precio = moneda === 'MXN' ? v.precio_mxn : v.precio_usd
                    const nombre = locale === 'es' ? v.nombre_es : v.nombre_en
                    const tipo = locale === 'es' ? v.typeNombreEs : v.typeNombreEn
                    const color = locale === 'es' ? v.colorNombreEs : v.colorNombreEn

                    return (
                      <div key={`${v.modelId}-${v.typeId}-${v.colorId}`} className="flex gap-3 p-3 rounded-xl bg-surface group">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface flex-shrink-0 border border-border">
                          {v.image && (
                            <img src={v.image} alt={nombre} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{nombre}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-muted">{tipo}</span>
                            {v.colorHex && v.colorHex !== '#ccc' && (
                              <>
                                <span className="w-3 h-3 rounded-full inline-block border border-border" style={{ backgroundColor: v.colorHex }} />
                                <span className="text-xs text-muted">{color}</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {moneda === 'MXN' ? `$${precio} MXN` : `$${precio.toFixed(2)} USD`}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(v, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-sm text-muted hover:text-foreground hover:bg-surface transition-colors"
                            >-</button>
                            <span className="text-sm w-6 text-center text-foreground">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(v, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-sm text-muted hover:text-foreground hover:bg-surface transition-colors"
                            >+</button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(v)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-red-500 p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-border p-4 space-y-4 bg-surface">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">
                      {t('seleccionar_pais')}
                    </label>
                    <select
                      value={pais}
                      onChange={(e) => setPais(e.target.value as ShippingDestination)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {shippingOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">{t('subtotal')}</span>
                      <span className="text-foreground">{moneda === 'MXN' ? `$${subtotal} MXN` : `$${subtotal.toFixed(2)} USD`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">{t('envio')}</span>
                      <span className="text-foreground">{shipping === 0 ? 'Gratis' : moneda === 'MXN' ? `$${shipping} MXN` : `$${shipping.toFixed(2)} USD`}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                      <span className="text-foreground">{t('total')}</span>
                      <span className="text-foreground">{moneda === 'MXN' ? `$${total} MXN` : `$${total.toFixed(2)} USD`}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="block w-full text-center bg-primary text-white py-3 rounded-2xl font-medium hover:bg-primary-dark transition-all active:scale-[0.98] shadow-md shadow-primary/20"
                  >
                    {t('pagar')}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
