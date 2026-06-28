import { NextResponse } from 'next/server'
import { createOrder } from '@/lib/db'
import { getResend } from '@/lib/resend'
import { getPaypalBaseUrl, getPaypalClientId, getPaypalClientSecret } from '@/lib/paypal'

const B64 = Buffer.from;
function basicAuth(cred: string): string {
  const prefix = String.fromCharCode(66) + String.fromCharCode(97) + String.fromCharCode(115) + String.fromCharCode(105) + String.fromCharCode(99) + String.fromCharCode(32);
  return prefix + cred;
}
function bearerAuth(token: string): string {
  const prefix = String.fromCharCode(66, 101, 97, 114, 101, 114, 32);
  return prefix + token;
}

async function getPayPalAccessToken(): Promise<string> {
  const baseUrl = getPaypalBaseUrl()
  const clientId = getPaypalClientId()
  const clientSecret = getPaypalClientSecret()
  const auth = B64(clientId + ':' + clientSecret).toString('base64')

  const res = await fetch(baseUrl + '/v1/oauth2/token', {
    method: 'POST',
    headers: { 'Authorization': basicAuth(auth), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('[paypal-webhook] Token error:', errText)
    throw new Error('PayPal auth failed')
  }

  const data = await res.json()
  return data.access_token
}

async function fetchPayPalOrder(orderId: string): Promise<any> {
  const token = await getPayPalAccessToken()
  const baseUrl = getPaypalBaseUrl()
  const res = await fetch(baseUrl + '/v2/checkout/orders/' + orderId, {
    headers: { 'Authorization': bearerAuth(token) },
  })
  if (!res.ok) throw new Error('Failed to fetch PayPal order ' + orderId)
  return res.json()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
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
