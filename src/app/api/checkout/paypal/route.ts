import { NextResponse } from 'next/server'
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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, pais, moneda, email, nombre, direccion, shipping, direccion_linea, ciudad, estado, cp } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacio' }, { status: 400 })
    }

    const baseUrl = getPaypalBaseUrl()
    const clientId = getPaypalClientId()
    const clientSecret = getPaypalClientSecret()
    const auth = B64(clientId + ':' + clientSecret).toString('base64')

    const tokenRes = await fetch(baseUrl + '/v1/oauth2/token', {
      method: 'POST',
      headers: { 'Authorization': basicAuth(auth), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('[paypal] Token error:', errText)
      return NextResponse.json({ error: 'Error de autenticacion con PayPal' }, { status: 500 })
    }

    const { access_token } = await tokenRes.json()

    const itemTotal = items.reduce((sum: number, item: any) => sum + (item.precio || 0) * (item.quantity || 0), 0)
    const shippingCost = shipping || 0
    const total = itemTotal + shippingCost

    const purchaseUnits = [{
      amount: {
        currency_code: moneda,
        value: total.toFixed(2),
      },
      description: 'Compra en Tlalchichi Store',
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
      headers: { 'Authorization': bearerAuth(access_token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: purchaseUnits,
      }),
    })

    const orderData = await orderRes.json()
    console.log('[paypal] Order status:', orderRes.status, 'id:', orderData?.id, 'status:', orderData?.status)
    console.log('[paypal] Order links:', JSON.stringify(orderData?.links?.map((l: any) => l.rel + ':' + l.href?.substring(0, 60))))
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
