import { NextRequest, NextResponse } from 'next/server'
import { getOrders as getLegacyOrders, getOrderItems } from '@/lib/db'
import { getOrders as getNewOrders, updateOrderStatus } from '@/lib/repositories/orders'
import { requireAdmin } from '@/lib/admin'

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined
  const search = searchParams.get('search') || undefined

  const legacyOrders = getLegacyOrders()
  const legacyWithItems = legacyOrders.map((order: any) => ({
    ...order,
    items: getOrderItems(order.id),
    source: 'legacy',
  }))

  const newOrders = getNewOrders({ status, search, limit: 200 })

  const all = [...newOrders, ...legacyWithItems].sort((a, b) => {
    const dateA = a.createdAt || a.created_at
    const dateB = b.createdAt || b.created_at
    return dateB.localeCompare(dateA)
  })

  return NextResponse.json(all)
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req)
  if (auth) return auth

  try {
    const body = await req.json() as { id?: number; status?: string }
    if (!body.id || !body.status) {
      return NextResponse.json({ error: 'Se requieren id y status' }, { status: 400 })
    }

    const order = updateOrderStatus(body.id, body.status)
    return NextResponse.json({ order })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error al actualizar' }, { status: 500 })
  }
}
