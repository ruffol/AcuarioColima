import { NextResponse } from 'next/server'
import { getStripe, formatAmountForStripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, pais, moneda, email, nombre, direccion, shipping } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      shipping_address_collection: {
        allowed_countries: ['MX', 'US', 'CA', 'DE', 'FR', 'ES', 'IT', 'GB', 'NL'],
      },
      line_items: items.map((item: any) => ({
        price_data: {
          currency: moneda.toLowerCase(),
          product_data: {
            name: item.nombre,
            images: item.imagen ? [`https://www.tlalchichi.xyz${item.imagen}`] : [],
          },
          unit_amount: formatAmountForStripe(item.precio, moneda),
        },
        quantity: item.quantity,
      })),
      metadata: {
        pais,
        nombre,
        direccion: direccion || '',
        shipping_cost: shipping?.toString() || '0',
        items: JSON.stringify(items.map((i: any) => ({
          modelId: i.modelId,
          productTypeId: i.productTypeId,
          colorId: i.colorId,
          quantity: i.quantity,
          precio: i.precio,
        }))),
      },
      success_url: `https://www.tlalchichi.xyz/${pais === 'MX' ? 'es' : 'en'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.tlalchichi.xyz/${pais === 'MX' ? 'es' : 'en'}/checkout`,
    })

    return NextResponse.json({ id: session.id, url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error creating checkout session' },
      { status: 500 }
    )
  }
}
