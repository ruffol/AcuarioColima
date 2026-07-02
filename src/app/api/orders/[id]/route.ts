import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrderStatus, markWhatsAppOpened } from '@/lib/repositories/orders'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const numId = Number(id)
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const order = getOrderById(numId)
  if (!order) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
  }

  return NextResponse.json({ order })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const numId = Number(id)
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const body = await req.json() as { action?: string; status?: string }

    if (body.action === 'whatsapp_opened') {
      markWhatsAppOpened(numId)
      return NextResponse.json({ success: true })
    }

    if (body.status) {
      const order = updateOrderStatus(numId, body.status)
      return NextResponse.json({ order })
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
  } catch (e: any) {
    console.error('[Orders] PATCH error:', e?.message)
    return NextResponse.json({ error: e?.message || 'Error al actualizar la orden' }, { status: 500 })
  }
}
