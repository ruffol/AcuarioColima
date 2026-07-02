'use client'

import { useEffect, useState, use } from 'react'
import { Link } from '@/i18n/routing'
import { openWhatsAppUrl } from '@/lib/whatsapp'
import Button from '@/components/ui/Button'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '523121337694'

export default function ConfirmacionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = use(searchParams)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [waOpened, setWaOpened] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) { setLoading(false); setError('No se recibió el ID de la orden'); return }

    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order)
          // Mark WhatsApp as opened after fetching
          fetch(`/api/orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'whatsapp_opened' }),
          }).catch(() => {})
        } else {
          setError('Orden no encontrada')
        }
      })
      .catch((e) => setError('Error al cargar la orden: ' + e.message))
      .finally(() => setLoading(false))
  }, [id])

  const openWA = () => {
    if (!order?.whatsappMessage) return
    const url = openWhatsAppUrl(WHATSAPP_NUMBER, order.whatsappMessage)
    window.open(url, '_blank')
    setWaOpened(true)
  }

  const copyToClipboard = async () => {
    if (!order?.whatsappMessage) return
    try {
      await navigator.clipboard.writeText(order.whatsappMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = order.whatsappMessage
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  // Auto-open WhatsApp once order loads
  useEffect(() => {
    if (order?.whatsappMessage && !waOpened) {
      const timer = setTimeout(openWA, 500)
      return () => clearTimeout(timer)
    }
  }, [order, waOpened])

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="animate-pulse space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface mx-auto" />
          <div className="h-6 w-48 bg-surface rounded mx-auto" />
          <div className="h-4 w-64 bg-surface rounded mx-auto" />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#dc2626" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <p className="text-foreground font-medium mb-2">Error</p>
        <p className="text-sm text-muted mb-6">{error || 'No se pudo cargar la orden'}</p>
        <Link href="/checkout"><Button>Volver al checkout</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      {/* Success icon */}
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#16a34a" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-foreground font-[family-name:var(--font-heading)] tracking-tight mb-2">
        ✅ Pedido recibido
      </h1>

      <p className="text-muted mb-1">
        Orden <span className="font-semibold text-foreground">{order.orderNumber}</span>
      </p>
      <p className="text-sm text-muted mb-8">
        Ahora solo falta enviarlo por WhatsApp para que podamos confirmar disponibilidad, costo de envío y método de pago.
      </p>

      {/* Order summary */}
      <div className="bg-card border border-border rounded-2xl p-6 text-left mb-8">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Resumen del pedido</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Cliente</span>
            <span className="text-foreground">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Teléfono</span>
            <span className="text-foreground">{order.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="text-foreground">${order.subtotal} MXN</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Envío</span>
            <span className="text-foreground">${order.shipping} MXN</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t border-border">
            <span className="text-foreground">Total</span>
            <span className="text-primary">${order.total} MXN</span>
          </div>
        </div>
      </div>

      {/* WhatsApp actions */}
      <div className="space-y-3">
        <button
          onClick={openWA}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98] text-base"
          style={{ background: '#25D366' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
          </svg>
          {waOpened ? 'Abrir WhatsApp de nuevo' : 'Enviar pedido por WhatsApp'}
        </button>

        <button
          onClick={copyToClipboard}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-border text-foreground font-medium text-sm hover:bg-surface transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          {copied ? '¡Copiado!' : 'Copiar pedido'}
        </button>
      </div>

      <p className="text-xs text-muted mt-6">
        Si no se abre WhatsApp automáticamente, presiona el botón de arriba.
        La orden queda guardada aunque no envíes el mensaje.
      </p>

      <div className="mt-8">
        <Link href="/" className="text-sm text-primary hover:underline font-medium">
          Volver a la tienda
        </Link>
      </div>
    </div>
  )
}
