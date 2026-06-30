import { NextResponse } from 'next/server'
import { createOrder } from '@/lib/db'
import { getResend } from '@/lib/resend'
import { getPaypalBaseUrl, getPayPalAccessToken, fetchPayPalOrder } from '@/lib/paypal'

async function verifyWebhookSignature(req: Request, body: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.warn('[paypal-webhook] PAYPAL_WEBHOOK_ID not set — skipping verification')
    return true
  }

  const authAlgo = req.headers.get('PAYPAL-AUTH-ALGO')
  const certUrl = req.headers.get('PAYPAL-CERT-URL')
  const transmissionId = req.headers.get('PAYPAL-TRANSMISSION-ID')
  const transmissionSig = req.headers.get('PAYPAL-TRANSMISSION-SIG')
  const transmissionTime = req.headers.get('PAYPAL-TRANSMISSION-TIME')

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    console.error('[paypal-webhook] Missing verification headers')
    return false
  }

  try {
    const token = await getPayPalAccessToken()
    const baseUrl = getPaypalBaseUrl()
    const res = await fetch(baseUrl + '/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    })

    if (!res.ok) {
      console.error('[paypal-webhook] Verification API error:', await res.text())
      return false
    }

    const data = await res.json()
    return data.verification_status === 'SUCCESS'
  } catch (err) {
    console.error('[paypal-webhook] Verification exception:', err)
    return false
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)

    if (!(await verifyWebhookSignature(req, rawBody))) {
      console.error('[paypal-webhook] Signature verification failed')
      return NextResponse.json({ error: 'Verification failed' }, { status: 401 })
    }

    console.log('[paypal-webhook] Event:', body.event_type)

    if (body.event_type === 'CHECKOUT.ORDER.APPROVED') {
      const resource = body.resource
      const orderId = resource.id
      if (!orderId) {
        console.error('No order id in event')
        return NextResponse.json({ error: 'No order id' }, { status: 400 })
      }

      const paypalOrder = await fetchPayPalOrder(orderId)
      const purchaseUnit = paypalOrder.purchase_units?.[0]
      const amount = parseFloat(purchaseUnit?.amount?.value || '0')

      if (!purchaseUnit || amount <= 0) {
        return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
      }

      const email = paypalOrder.payer?.email_address || ''
      const nombre = purchaseUnit.shipping?.name?.full_name || 'Cliente'
      const direccion = [
        purchaseUnit.shipping?.address?.address_line_1 || '',
        purchaseUnit.shipping?.address?.admin_area_2 || '',
        purchaseUnit.shipping?.address?.admin_area_1 || '',
      ].filter(Boolean).join(', ')

      const pais = purchaseUnit.shipping?.address?.country_code === 'MX' ? 'MX' : 'WORLD'
      const moneda = 'MXN'

      const itemTotal = purchaseUnit.items?.reduce((sum: number, i: any) => {
        return sum + parseFloat(i.unit_amount?.value || '0') * parseInt(i.quantity || '1')
      }, 0) || 0

      const shippingCost = amount - itemTotal

      const order = createOrder({
        email,
        nombre,
        pais,
        direccion,
        moneda,
        subtotal: Math.round(itemTotal * 100),
        costo_envio: Math.round(shippingCost * 100),
        total: Math.round(amount * 100),
        payment_provider: 'paypal',
        payment_status: 'completed',
        paypal_order_id: orderId,
      })

      console.log('[paypal-webhook] Order created:', order.id)

      // Send email
      try {
        if (process.env.RESEND_API_KEY && email) {
          const resend = getResend()
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Tlalchichi <onboarding@resend.dev>',
            to: [email],
            subject: 'Gracias por tu compra - Tlalchichi Store',
            html: '<p>Hola ' + nombre + ',</p><p>Gracias por tu compra. Recibiras tu pedido pronto.</p><p>Total: $' + (amount * (moneda === 'MXN' ? 1 : 1)).toFixed(2) + ' ' + moneda + '</p>',
          })
          console.log('[paypal-webhook] Email sent')
        }
      } catch (emailErr) {
        console.error('[paypal-webhook] Email error:', emailErr)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('[paypal-webhook] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
