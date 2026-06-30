'use client'

import { useTranslations } from 'next-intl'
import { useCartStore, getSubtotal, getShippingCost, getTotal } from '@/store/cart'
import { SHIPPING_RATES, type ShippingDestination } from '@/types'
import { WHATSAPP_NUMBER } from '@/lib/constants'
import { useState } from 'react'
import { Link } from '@/i18n/routing'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export default function CheckoutPage() {
  const t = useTranslations('Checkout')
  const ct = useTranslations('Cart')
  const { items, pais, setPais } = useCartStore()

  const validItems = items.filter((item) => {
    const v = item?.variant
    return v && typeof v.precio_mxn === 'number'
  })

  const subtotal = getSubtotal(validItems)
  const shippingCost = getShippingCost(pais)
  const total = getTotal(validItems, pais)
  const [loading, setLoading] = useState<'stripe' | 'paypal' | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', nombre: '', direccion: '', ciudad: '', estado: '', cp: '' })

  if (validItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <p className="text-foreground font-medium mb-2">{ct('vacio')}</p>
        <p className="text-sm text-muted mb-6">{ct('vacio_desc')}</p>
        <Link href="/productos" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium transition-colors">
          {ct('seguir')}
        </Link>
      </div>
    )
  }

  const shippingOptions = (Object.entries(SHIPPING_RATES) as [ShippingDestination, typeof SHIPPING_RATES[ShippingDestination]][]).map(
    ([key, val]) => ({ value: key, label: `${val.label} — $${val.MXN} MXN` })
  )

  function validateForm(): string | null {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t('email_invalido')
    if (!form.nombre.trim()) return t('nombre_requerido')
    if (!form.direccion.trim()) return t('direccion_requerida')
    if (!form.ciudad.trim()) return t('ciudad_requerida')
    if (!form.estado.trim()) return t('estado_requerido')
    if (!form.cp.trim()) return t('cp_requerido')
    return null
  }

  const checkoutItems = validItems.map((item) => ({
    modelId: Number(item.variant.modelId),
    productTypeId: Number(item.variant.typeId),
    colorId: Number(item.variant.colorId),
    nombre: item.variant.nombre_es,
    precio: item.variant.precio_mxn,
    quantity: item.quantity,
    imagen: item.variant.image,
  }))

  const handleStripeClick = async () => {
    const formError = validateForm()
    if (formError) { setError(formError); return }
    setError('')
    setLoading('stripe')
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems, pais, moneda: 'MXN', email: form.email, nombre: form.nombre,
          direccion: `${form.direccion}, ${form.ciudad}, ${form.estado}, ${form.cp}`,
          shipping: shippingCost,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear el pago')
      if (data.url) window.location.href = data.url
      else throw new Error('No se recibió la URL de pago')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago')
      setLoading(null)
    }
  }

  const handlePayPal = async () => {
    const formError = validateForm()
    if (formError) { setError(formError); return }
    setLoading('paypal')
    setError('')
    if (typeof window !== 'undefined') { sessionStorage.setItem('tlalchichi_email', form.email) }
    try {
      const res = await fetch('/api/checkout/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems, pais, moneda: 'MXN', email: form.email, nombre: form.nombre,
          direccion: `${form.direccion}, ${form.ciudad}, ${form.estado}, ${form.cp}`,
          shipping: shippingCost,
          direccion_linea: form.direccion, ciudad: form.ciudad, estado: form.estado, cp: form.cp,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al procesar el pago')
      if (data.approvalUrl) window.location.href = data.approvalUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago')
      setLoading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-heading)] tracking-tight mb-8">
        {t('titulo')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Left — Form */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
              {t('informacion_envio') || 'Información de envío'}
            </h2>
            <Input label={t('email')} type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
            <Input label={t('nombre')} value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <Input label={t('direccion')} value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label={t('ciudad')} value={form.ciudad}
                onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
              <Input label={t('estado')} value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label={t('codigo_postal')} value={form.cp}
                onChange={(e) => setForm({ ...form, cp: e.target.value })} />
              <Select label={t('pais')} value={pais}
                onChange={(e) => setPais(e.target.value as ShippingDestination)} options={shippingOptions} />
            </div>
          </div>

          {/* Payment buttons */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
              {t('metodo_pago') || 'Método de pago'}
            </h2>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleStripeClick}
              disabled={loading === 'stripe'}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-medium text-white transition-all disabled:opacity-60 hover:shadow-lg active:scale-[0.98]"
              style={{ background: '#635BFF' }}
            >
              {loading === 'stripe' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Redirigiendo...
                </span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                    <path d="M19.5 3H4.5C3.7 3 3 3.7 3 4.5v15c0 .8.7 1.5 1.5 1.5h15c.8 0 1.5-.7 1.5-1.5v-15c0-.8-.7-1.5-1.5-1.5zm-2.2 7.5c-.3 2.1-1.8 3.5-3.8 3.5H12l-.9 4.5H9.2l1.8-9.3h3.1c1.4 0 2.4.4 2.7 1.3h.5z"/>
                    <path d="M14.3 8.5c-.3.1-.6.1-1 .2h-1.7l-.6 3.3h1.4c1.8 0 3.4-1.1 3.7-2.8.1-.3.1-.6.1-.8-.3.1-1.1.1-1.9.1z"/>
                  </svg>
                  Pagar con Stripe
                </>
              )}
            </button>

            <button
              onClick={handlePayPal}
              disabled={loading === 'paypal'}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-medium text-white transition-all disabled:opacity-60 hover:shadow-lg active:scale-[0.98]"
              style={{ background: '#003087' }}
            >
              {loading === 'paypal' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Procesando...
                </span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                    <path d="M7.1 3l-2.8 14.5h4.3l.7-3.5h2.7c2.8 0 5.2-1.9 5.7-4.7.3-1.3.1-2.5-.5-3.4-.6-.8-1.6-1-2.5-1H7.1zm5.5 5.4c-.2 1.2-1.1 2-2.2 2H8.9l.8-4.1h2.1c1.1 0 1.9.8 1.8 2.1z"/>
                    <path d="M19.1 8.3c-.3 2-1.7 3.5-3.7 3.5H14l-.5 2.8h-2.7l1.3-6.6h3.1c.9 0 1.7.1 2.3.4l-.4-.1z"/>
                  </svg>
                  Pagar con PayPal
                </>
              )}
            </button>
          </div>

          {/* Contact support */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted mb-3">
              '¿Tienes dudas antes de pagar?'
            </p>
            <div className="flex items-center justify-center gap-4">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors">
                <svg viewBox="0 0 24 24" fill="#25D366" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
                WhatsApp
              </a>
              <a href="mailto:srtlalchichi@gmail.com"
                className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                srtlalchichi@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Right — Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 sticky top-24">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
              {ct('resumen') || 'Resumen'}
            </h2>

            <div className="space-y-3">
              {validItems.map((item) => {
                const v = item.variant
                const nombre = v.nombre_es
                const tipo = v.typeNombreEs
                const color = v.colorNombreEs
                return (
                  <div key={`${v.modelId}-${v.typeId}-${v.colorId}`} className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="w-14 h-14 rounded-xl bg-surface overflow-hidden shrink-0 border border-border">
                      {v.image && <img src={v.image} alt={nombre} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{nombre}</p>
                      <p className="text-xs text-muted">{tipo}{color ? ` · ${color}` : ''} × {item.quantity}</p>
                      {v.weight_kg > 0 && (
                        <p className="text-xs text-muted">
                          {(v.weight_kg * 1000).toFixed(0)} g / {v.weight_kg.toFixed(2)} kg
                        </p>
                      )}
                      <p className="text-sm text-foreground font-medium mt-0.5">
                        ${v.precio_mxn * item.quantity} MXN
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {(() => {
              const totalWeightKg = validItems.reduce((sum, item) => sum + (item.variant.weight_kg || 0) * item.quantity, 0)
              return (
            <div className="space-y-2 pt-2 border-t border-border">
              {totalWeightKg > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Peso total</span>
                  <span className="text-foreground">{(totalWeightKg * 1000).toFixed(0)} g ({totalWeightKg.toFixed(2)} kg)</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted">{ct('subtotal')}</span>
                <span className="text-foreground">${subtotal} MXN</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{ct('envio')}</span>
                <span className="text-foreground">${shippingCost} MXN</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
                <span className="text-foreground">{ct('total')}</span>
                <span className="text-primary">${total} MXN</span>
              </div>
            </div>
            )})()}
          </div>
        </div>
      </div>
    </div>
  )
}
