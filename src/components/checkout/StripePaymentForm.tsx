'use client'

import { useState } from 'react'

interface Props {
  items: any[]
  pais: string
  moneda: string
  form: { email: string; nombre: string; direccion: string; ciudad: string; estado: string; cp: string }
  shipping: number
  total: number
  onSuccess: () => void
}

export default function StripePaymentForm({ items, pais, moneda, form, shipping }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            nombre: i.nombre,
            precio: i.precio,
            quantity: i.quantity,
            imagen: i.imagen,
          })),
          pais,
          moneda,
          email: form.email,
          nombre: form.nombre,
          direccion: `${form.direccion}, ${form.ciudad}, ${form.estado}, ${form.cp}`,
          shipping,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear el pago')

      // Redirigir directamente a Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No se recibio la URL de pago')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-medium text-white transition-colors disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #635BFF, #0A2540)' }}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Redirigiendo a Stripe...
          </span>
        ) : (
          <>
            <svg viewBox="0 0 48 20" className="w-10 h-4" fill="white">
              <path d="M40.7 0C37.7 0 34.2 1.5 33 5.1c1.6-.5 3.1-.6 4.2-.6 2.3 0 4.3.6 5.8 1.8-1 3-3.7 5.2-7 5.2-.6 0-1.2-.1-1.7-.2l-.6 2.2c.7.1 1.5.2 2.3.2 4.5 0 8.3-2.8 9.7-7.1.5-1.6.7-3 .7-4.2C47.4.7 44.9 0 40.7 0zM33.3 12.2c-.3 0-.6-.1-.9-.2.1-.4.2-.8.3-1.2 1.2-4.9 5.5-8.6 10.5-8.6h.1c-.7-1.3-2-2.2-3.6-2.2-2.3 0-4.2 1.8-4.6 4.1-.2 1.2.3 2.4 1.3 3.1-.8.3-1.7.5-2.6.5.7.3 1.3.9 1.5 1.7.2.8 0 1.7-.6 2.3-.3.3-.7.5-1.2.5z"/>
            </svg>
            Pagar con Stripe
          </>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  )
}
