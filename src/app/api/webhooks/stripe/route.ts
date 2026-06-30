import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getResend } from '@/lib/resend'
import { createFullOrder } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!

    let event
    let stripe
    try {
      stripe = getStripe()
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('[stripe-webhook] Invalid signature:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const metadata = session.metadata || {}
      const moneda = session.currency === 'mxn' ? 'MXN' : 'USD'
      const subtotal = session.amount_subtotal || 0
      const shippingCost = parseInt(metadata.shipping_cost || '0')
      const totalAmount = session.amount_total || 0

      // Extraer items del metadata (pasados como JSON)
      let itemsData: any[] = []
      try {
        if (metadata.items) itemsData = JSON.parse(metadata.items)
      } catch {}

      const order = createFullOrder({
        email: session.customer_details?.email || metadata.email || '',
        nombre: metadata.nombre || '',
        pais: metadata.pais || 'MX',
        direccion: session.shipping_details
          ? JSON.stringify({
              line1: session.shipping_details.address?.line1,
              city: session.shipping_details.address?.city,
              state: session.shipping_details.address?.state,
              postal_code: session.shipping_details.address?.postal_code,
              country: session.shipping_details.address?.country,
            })
          : '',
        moneda,
        subtotal,
        costo_envio: shippingCost,
        total: totalAmount,
        payment_provider: 'stripe',
        payment_status: 'completed',
        stripe_session_id: session.id,
        items: itemsData.length > 0 ? itemsData : undefined,
      })

      // Enviar email (si Resend esta configurado)
      try {
        if (process.env.RESEND_API_KEY) {
          const resend = getResend()
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'AcuarioColima <onboarding@resend.dev>',
            to: session.customer_details?.email || metadata.email,
            subject: 'Gracias por tu compra! - AcuarioColima',
            html: `
              <h1>Gracias por tu compra!</h1>
              <p>Hola ${metadata.nombre || 'Cliente'},</p>
              <p>Tu pedido ha sido confirmado.</p>
              <p><strong>Total:</strong> $${((totalAmount) / 100).toFixed(2)} ${moneda}</p>
              <p>Te enviaremos un correo cuando tu pedido sea enviado.</p>
              <p>Gracias por apoyar el arte mexicano!</p>
            `,
          })


        }
      } catch (emailErr) {
        console.error('[stripe-webhook] Email error:', emailErr)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('[stripe-webhook] Unhandled error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
