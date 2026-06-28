import { NextResponse } from 'next/server'
import { getStripe, formatAmountForStripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, pais, moneda, email, nombre, direccion, shipping } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 })
    }

    const stripe = getStripe()

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: moneda.toLowerCase(),
        product_data: { name: item.nombre, images: item.imagen ? [item.imagen] : [] },
        unit_amount: formatAmountForStripe(item.precio, moneda),
      },
      quantity: item.quantity,
    }))

    const amountTotal = lineItems.reduce(
      (sum: number, li: any) => sum + li.price_data.unit_amount * li.quantity,
      0
    )
    const shippingAmount = formatAmountForStripe(shipping || 0, moneda)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTotal + shippingAmount,
      currency: moneda.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: {
        pais,
        nombre: nombre || '',
        direccion: direccion || '',
        shipping_cost: shipping?.toString() || '0',
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('create-payment-intent error:', err)
    return NextResponse.json({ error: 'Error al crear el pago' }, { status: 500 })
  }
}
