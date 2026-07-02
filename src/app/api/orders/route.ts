import { NextRequest, NextResponse } from 'next/server'
import { createOrder, type CreateOrderInput } from '@/lib/repositories/orders'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CreateOrderInput

    if (!body.customerName?.trim()) {
      return NextResponse.json({ error: 'El nombre del cliente es obligatorio' }, { status: 400 })
    }
    if (!body.phone?.trim()) {
      return NextResponse.json({ error: 'El teléfono es obligatorio' }, { status: 400 })
    }
    if (!body.deliveryMethod) {
      return NextResponse.json({ error: 'Selecciona un método de entrega' }, { status: 400 })
    }
    if (!body.paymentMethod) {
      return NextResponse.json({ error: 'Selecciona un método de pago' }, { status: 400 })
    }
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'El pedido debe contener al menos un producto' }, { status: 400 })
    }

    if (body.deliveryMethod === 'envio_nacional') {
      if (!body.address?.trim()) return NextResponse.json({ error: 'La dirección es obligatoria para envío' }, { status: 400 })
      if (!body.city?.trim()) return NextResponse.json({ error: 'La ciudad es obligatoria para envío' }, { status: 400 })
      if (!body.state?.trim()) return NextResponse.json({ error: 'El estado es obligatorio para envío' }, { status: 400 })
      if (!body.postalCode?.trim()) return NextResponse.json({ error: 'El código postal es obligatorio para envío' }, { status: 400 })
    }

    const order = createOrder(body)

    return NextResponse.json({ order }, { status: 201 })
  } catch (e: any) {
    console.error('[Orders] POST error:', e?.message)
    return NextResponse.json({ error: e?.message || 'Error al crear la orden' }, { status: 500 })
  }
}
