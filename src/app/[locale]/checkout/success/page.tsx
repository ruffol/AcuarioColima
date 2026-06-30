'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import Button from '@/components/ui/Button'

export default function SuccessPage() {
  const t = useTranslations('Checkout')
  const [sent, setSent] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    if (sent) return
    setSent(true)

    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    const paypalToken = params.get('token')

    if (sessionId) {
      setStatusMsg('Confirmando tu pedido...')
      fetch('/api/checkout/confirm-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
        .then(r => r.json())
        .then(d => setStatusMsg(d.received ? 'Pedido confirmado. Te enviaremos un email en breve.' : 'Error: ' + (d.error || '')))
        .catch(e => setStatusMsg('Error al confirmar: ' + e.message))
    } else if (paypalToken) {
      setStatusMsg('Confirmando tu pago con PayPal...')
      fetch('/api/checkout/confirm-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paypal_order_id: paypalToken, email_usuario: sessionStorage.getItem('tlalchichi_email') || '' }),
      })
        .then(r => r.json())
        .then(d => setStatusMsg(d.received ? 'Pedido confirmado. Te enviaremos un email en breve.' : 'Error: ' + (d.error || '')))
        .catch(e => setStatusMsg('Error al confirmar: ' + e.message))
    }
  }, [sent])

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="#16a34a"
          className="w-8 h-8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-3">
        {t('exito_titulo')}
      </h1>
      <p className="text-muted mb-8">{t('exito_desc')}</p>
      <p className="text-sm text-muted mb-8">Te enviaremos un correo de confirmación en breve.</p>
      {statusMsg && (
        <p className="text-sm mb-8" style={{color: statusMsg.includes('Error') ? '#dc2626' : '#16a34a'}}>
          {statusMsg}
        </p>
      )}
      <Link href="/productos">
        <Button>{t('continuar')}</Button>
      </Link>
    </div>
  )
}
