'use client'

import { useTranslations } from 'next-intl'
import { useCartStore, getSubtotal, getShippingCost, getTotal } from '@/store/cart'
import { SHIPPING_RATES, type ShippingDestination } from '@/types'
import { WHATSAPP_NUMBER } from '@/lib/constants'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/routing'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

type DeliveryMethod = 'envio_nacional' | 'recoger_taller' | 'entrega_local'
type PaymentMethod = 'transferencia' | 'deposito' | 'efectivo' | 'contra_entrega'

const DELIVERY_OPTIONS: { value: DeliveryMethod; label: string; shipping: number }[] = [
  { value: 'envio_nacional', label: 'Envío nacional', shipping: 200 },
  { value: 'recoger_taller', label: 'Recoger en taller', shipping: 0 },
  { value: 'entrega_local', label: 'Entrega local (Colima)', shipping: 100 },
]

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'deposito', label: 'Depósito' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'contra_entrega', label: 'Contra entrega' },
]

export default function CheckoutPage() {
  const t = useTranslations('Checkout')
  const ct = useTranslations('Cart')
  const router = useRouter()
  const { items } = useCartStore()

  const validItems = items.filter((item) => {
    const v = item?.variant
    return v && typeof v.precio_mxn === 'number'
  })

  const subtotal = getSubtotal(validItems)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('envio_nacional')
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    paymentMethod: 'transferencia' as PaymentMethod,
    notes: '',
  })

  const shippingCost = DELIVERY_OPTIONS.find((d) => d.value === deliveryMethod)?.shipping ?? 0
  const total = subtotal + shippingCost

  const needsAddress = deliveryMethod === 'envio_nacional'

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

  function validate(): string | null {
    if (!form.customerName.trim()) return 'El nombre es obligatorio'
    if (!form.phone.trim() || !/^\d{10,15}$/.test(form.phone.replace(/[^0-9]/g, ''))) return 'Teléfono inválido (10-15 dígitos)'
    if (needsAddress) {
      if (!form.address.trim()) return 'La dirección es obligatoria para envío'
      if (!form.city.trim()) return 'La ciudad es obligatoria para envío'
      if (!form.state.trim()) return 'El estado es obligatorio para envío'
      if (!form.postalCode.trim()) return 'El código postal es obligatorio para envío'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError('')
    setLoading(true)

    try {
      const itemsPayload = validItems.map((item) => ({
        productId: 0,
        productName: item.variant.nombre_es,
        variantName: item.variant.typeNombreEs
          ? `${item.variant.typeNombreEs}${item.variant.colorNombreEs ? ` - ${item.variant.colorNombreEs}` : ''}`
          : undefined,
        quantity: item.quantity,
        unitPrice: Math.round(item.variant.precio_mxn),
        image: item.variant.image || undefined,
      }))

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          phone: form.phone.replace(/[^0-9]/g, ''),
          email: form.email || undefined,
          address: form.address || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          postalCode: form.postalCode || undefined,
          deliveryMethod,
          paymentMethod: form.paymentMethod,
          notes: form.notes || undefined,
          items: itemsPayload,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear la orden')

      router.push(`/checkout/confirmacion?id=${data.order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-heading)] tracking-tight mb-8">
        Finalizar pedido
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left — Form */}
          <div className="lg:col-span-3 space-y-5">
            {/* Contact info */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
                Información de contacto
              </h2>
              <Input
                label="Nombre completo *"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Juan Pérez"
              />
              <Input
                label="Teléfono *"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="3121234567"
              />
              <Input
                label="Correo electrónico (opcional)"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </div>

            {/* Delivery method */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
                Entrega
              </h2>
              <div className="space-y-3">
                {DELIVERY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      deliveryMethod === opt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={opt.value}
                      checked={deliveryMethod === opt.value}
                      onChange={() => setDeliveryMethod(opt.value)}
                      className="w-4 h-4 accent-primary"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted">
                        {opt.shipping === 0 ? 'Sin costo' : `$${opt.shipping} MXN`}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {needsAddress && (
                <div className="space-y-4 pt-2">
                  <Input
                    label="Dirección *"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Calle, número, colonia"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Ciudad *"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                    <Input
                      label="Estado *"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Código postal *"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
                Método de pago preferido
              </h2>
              <Select
                label=""
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
                options={PAYMENT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
            </div>

            {/* Notes */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
                Notas del pedido
              </h2>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ej: Quiero el pez japonés, es para regalo, agregar tarjeta..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* WhatsApp button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold text-white transition-all disabled:opacity-60 hover:shadow-lg active:scale-[0.98] text-base"
              style={{ background: '#25D366' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creando orden...
                </span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
                  Realizar pedido por WhatsApp
                </>
              )}
            </button>
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
                        <p className="text-sm text-foreground font-medium mt-0.5">
                          ${v.precio_mxn * item.quantity} MXN
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{ct('subtotal')}</span>
                  <span className="text-foreground">${subtotal} MXN</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Envío</span>
                  <span className="text-foreground">
                    {shippingCost === 0 ? 'Gratis' : `$${shippingCost} MXN`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
                  <span className="text-foreground">{ct('total')}</span>
                  <span className="text-primary">${total} MXN</span>
                </div>
              </div>

              {deliveryMethod === 'recoger_taller' && (
                <p className="text-xs text-muted text-center pt-2">
                  Al seleccionar "Recoger en taller", nos pondremos en contacto para coordinar la entrega.
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
