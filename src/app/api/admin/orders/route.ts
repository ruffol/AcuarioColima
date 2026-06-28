import { NextResponse } from 'next/server'
import { getOrders, getOrderItems } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function GET(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const orders = getOrders()
  const ordersWithItems = orders.map((order: any) => ({
    ...order,
    items: getOrderItems(order.id),
  }))
  return NextResponse.json(ordersWithItems)
}
