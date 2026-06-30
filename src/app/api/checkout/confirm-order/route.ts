import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getResend } from '@/lib/resend'
import { getPaypalBaseUrl, getPaypalClientId, getPaypalClientSecret } from '@/lib/paypal'
import { createFullOrder } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { session_id, paypal_order_id, email_usuario } = body

    if (!session_id && !paypal_order_id) {
      return NextResponse.json({ error: 'session_id or paypal_order_id required' }, { status: 400 })
    }

    let email = ''
    let nombre = ''
    let pais = 'MX'
    let direccion = ''
    let moneda = 'MXN'
    let subtotal = 0
    let costoEnvio = 0
    let total = 0
    let itemsData: any[] = []
    let provider = ''
    let providerId = ''

    if (session_id) {
      // Stripe
      const stripe = getStripe()
      const session = await stripe.checkout.sessions.retrieve(session_id)
      const s = session as any

      if (session.payment_status !== 'paid') {
        return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
      }

      const metadata = s.metadata || {}
      moneda = s.currency === 'mxn' ? 'MXN' : 'USD'
      email = s.customer_details?.email || metadata.email || ''
      nombre = metadata.nombre || ''
      pais = metadata.pais || 'MX'
      direccion = s.shipping_details ? JSON.stringify({
        line1: s.shipping_details.address?.line1,
        city: s.shipping_details.address?.city,
        state: s.shipping_details.address?.state,
        postal_code: s.shipping_details.address?.postal_code,
        country: s.shipping_details.address?.country,
      }) : ''
      subtotal = s.amount_subtotal || 0
      costoEnvio = parseInt(metadata.shipping_cost || '0')
      total = s.amount_total || 0
      provider = 'stripe'
      providerId = s.id

      try { if (metadata.items) itemsData = JSON.parse(metadata.items) } catch {}
    } else if (paypal_order_id) {
      // PayPal
      const baseUrl = getPaypalBaseUrl()
      const auth = Buffer.from(`${getPaypalClientId()}:${getPaypalClientSecret()}`).toString('base64')

      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      })
      if (!tokenRes.ok) {
        return NextResponse.json({ error: 'PayPal auth error' }, { status: 500 })
      }
      const { access_token } = await tokenRes.json()

      const orderRes = await fetch(`${baseUrl}/v2/checkout/orders/${paypal_order_id}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      if (!orderRes.ok) {
        return NextResponse.json({ error: 'PayPal order error' }, { status: 500 })
      }
      const paypalOrder = await orderRes.json()

      const purchaseUnit = paypalOrder.purchase_units?.[0]
      const amount = parseFloat(purchaseUnit?.amount?.value || '0')
      moneda = purchaseUnit?.amount?.currency_code || 'USD'
      email = paypalOrder.payer?.email_address || ''
      nombre = paypalOrder.payer?.name?.given_name || ''
      pais = purchaseUnit?.shipping?.address?.country_code || 'US'
      direccion = purchaseUnit?.shipping?.address
        ? JSON.stringify({
            line1: purchaseUnit.shipping.address.address_line_1,
            city: purchaseUnit.shipping.address.admin_area_2,
            state: purchaseUnit.shipping.address.admin_area_1,
            postal_code: purchaseUnit.shipping.address.postal_code,
            country: purchaseUnit.shipping.address.country_code,
          })
        : ''
      subtotal = Math.round(amount * (purchaseUnit?.items?.length ? 1 : 1) * 100)
      costoEnvio = 0
      total = Math.round(amount * 100)
      provider = 'paypal'
      providerId = paypal_order_id

      const items = purchaseUnit?.items || []
      itemsData = items.map((item: any, i: number) => {
        const skuParts = (item.sku || '').split('-')
        return {
          modelId: parseInt(skuParts[0]) || 0,
          productTypeId: parseInt(skuParts[1]) || 0,
          colorId: parseInt(skuParts[2]) || 0,
          quantity: parseInt(item.quantity || '1'),
          precio: parseFloat(item.unit_amount?.value || '0'),
        }
      })
    }

    const order = createFullOrder({
      email, nombre, pais, direccion, moneda,
      subtotal, costo_envio: costoEnvio, total,
      payment_provider: provider,
      payment_status: 'completed',
      stripe_session_id: provider === 'stripe' ? providerId : undefined,
      paypal_order_id: provider === 'paypal' ? providerId : undefined,
      items: itemsData.length > 0 ? itemsData : undefined,
    })

    // Enviar email (al email real del usuario si se proporciono)
    const emailDestino = email_usuario || email
    if (process.env.RESEND_API_KEY && emailDestino) {
      try {
        const resend = getResend()
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Tlalchichi <onboarding@resend.dev>',
          to: emailDestino,
          subject: 'Gracias por tu compra! - Tlalchichi Store',
          html: `
            <h1>Gracias por tu compra!</h1>
            <p>Hola ${nombre || 'Cliente'},</p>
            <p>Tu pedido ha sido confirmado.</p>
            <p><strong>Total:</strong> $${(total / 100).toFixed(2)} ${moneda}</p>
            <p>Te enviaremos un correo cuando tu pedido sea enviado.</p>
            <p>Gracias por apoyar el arte mexicano!</p>
          `,
        })
        console.log('[confirm-order] Email sent to', email)
      } catch (emailErr) {
        console.error('[confirm-order] Email error:', emailErr)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[confirm-order] Error:', err)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
