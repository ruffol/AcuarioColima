'use client'

import { useTranslations } from 'next-intl'
import { useCartStore, getSubtotal, getItemCount, getTotal, getShippingCost } from '@/store/cart'
import { Link } from '@/i18n/routing'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { SHIPPING_RATES, type ShippingDestination } from '@/types'
import { CloseIcon, TrashIcon, EmptyCartIcon, MinusIcon, PlusIcon } from '@/components/ui/icons'

export default function CartDrawer() {
  const t = useTranslations('Cart')
  const { items, isOpen, closeCart, pais, setPais, removeItem, updateQuantity } = useCartStore()

  const validItems = items.filter((item) => {
    const v = item?.variant
    return v && typeof v.precio_mxn === 'number'
  })

  const count = getItemCount(validItems)
  const subtotal = getSubtotal(validItems)
  const shipping = getShippingCost(pais)
  const total = getTotal(validItems, pais)

  useBodyScrollLock(isOpen)

  const shippingOptions = (Object.entries(SHIPPING_RATES) as [ShippingDestination, typeof SHIPPING_RATES[ShippingDestination]][]).map(
    ([key, val]) => ({
      value: key,
      label: `${val.label} — $${val.MXN} MXN`,
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
                <CloseIcon />
              </button>
            </div>

            {validItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
                  <EmptyCartIcon className="w-8 h-8 text-muted" />
                </div>
                <p className="text-foreground font-medium mb-1">{t('vacio')}</p>
                <p className="text-sm text-muted mb-6">{t('vacio_desc')}</p>
                <button onClick={closeCart} className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
                  {t('seguir')}
                </button>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {validItems.map((item) => {
                    const v = item.variant
                    const nombre = v.nombre_es
                    const tipo = v.typeNombreEs
                    const color = v.colorNombreEs

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
                            ${v.precio_mxn} MXN
                          </p>
                          {v.weight_kg > 0 && (
                            <p className="text-xs text-muted mt-0.5">
                              {(v.weight_kg * 1000).toFixed(0)} g / {v.weight_kg.toFixed(2)} kg {item.quantity > 1 ? `(total ${(v.weight_kg * item.quantity * 1000).toFixed(0)} g)` : ''}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(v, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors"
                            ><MinusIcon /></button>
                            <span className="text-sm w-6 text-center text-foreground">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(v, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors"
                            ><PlusIcon /></button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(v)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-red-500 p-1"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-border p-4 space-y-4 bg-surface">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">
                      Tipo de envío
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

                  {(() => {
                    const totalWeightKg = validItems.reduce((sum, item) => sum + (item.variant.weight_kg || 0) * item.quantity, 0)
                    return (
                      <div className="space-y-1.5 text-sm">
                        {totalWeightKg > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted">Peso total</span>
                            <span className="text-foreground">{(totalWeightKg * 1000).toFixed(0)} g ({totalWeightKg.toFixed(2)} kg)</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted">{t('subtotal')}</span>
                          <span className="text-foreground">${subtotal} MXN</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">{t('envio')}</span>
                          <span className="text-foreground">${shipping} MXN</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                          <span className="text-foreground">{t('total')}</span>
                          <span className="text-foreground">${total} MXN</span>
                        </div>
                      </div>
                    )
                  })()}

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
