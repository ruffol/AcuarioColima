import { NextResponse } from 'next/server'
import { getPaypalBaseUrl, getPayPalAccessToken } from '@/lib/paypal'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, pais, moneda, email, nombre, direccion, shipping, direccion_linea, ciudad, estado, cp } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacio' }, { status: 400 })
    }

    const baseUrl = getPaypalBaseUrl()
    const access_token = await getPayPalAccessToken()

    const itemTotal = items.reduce((sum: number, item: any) => sum + (item.precio || 0) * (item.quantity || 0), 0)
    const shippingCost = shipping || 0
    const total = itemTotal + shippingCost

    const purchaseUnits = [{
      amount: {
        currency_code: moneda,
        value: total.toFixed(2),
      },
      description: 'Compra en AcuarioColima',
      shipping: {
        name: { full_name: nombre || 'Cliente' },
        address: {
          address_line_1: direccion_linea || (direccion ? direccion.split(',')[0].trim() : ''),
          admin_area_2: ciudad || '',
          admin_area_1: estado || '',
          postal_code: cp || '',
          country_code: pais === 'MX' ? 'MX' : 'US',
        },
      },
    }]

    const orderRes = await fetch(baseUrl + '/v2/checkout/orders', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + access_token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: purchaseUnits,
      }),
    })

    const orderData = await orderRes.json()


    if (!orderRes.ok) {
      console.error('[paypal] Create order error:', JSON.stringify(orderData))
      return NextResponse.json({ error: 'Error al crear orden PayPal: ' + (orderData.message || 'desconocido') }, { status: 500 })
    }

    const approvalUrl = orderData.links?.find((l: any) => l.rel === 'approve')?.href
    if (!approvalUrl) {
      return NextResponse.json({ error: 'No se pudo obtener URL de aprobacion' }, { status: 500 })
    }

    return NextResponse.json({ approvalUrl, orderId: orderData.id })
  } catch (err) {
    console.error('[paypal] Checkout error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error interno' }, { status: 500 })
  }
}
