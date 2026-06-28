'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import type { Order } from '@/types'

interface OrderItemDisplay {
  nombre_es?: string
  nombre?: string
  cantidad?: number
  quantity?: number
  precio_mxn: number
}

interface AdminOrder extends Order {
  items: OrderItemDisplay[]
}

export default function AdminOrdenesPage() {
  const t = useTranslations('Admin')
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    fetch('/api/admin/orders', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((r) => r.json())
      .then((data) => {
        setOrders(data || [])
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="text-center py-12 text-muted">{t('cargando')}</p>
  if (orders.length === 0) return <p className="text-center py-12 text-muted">{t('sin_ordenes')}</p>

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="p-6 bg-card rounded-xl border border-arena">
          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="min-w-0">
              <p className="font-semibold">{order.nombre || '—'}</p>
              <p className="text-sm text-muted truncate">{order.email}</p>
              <p className="text-xs text-muted/60 mt-1">
                {new Date(order.created_at).toLocaleDateString()} &middot; #{order.id}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                order.payment_status === 'completed'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
              }`}>
                {order.payment_status === 'completed' ? 'Pagado' : order.payment_status}
              </span>
              <p className="text-sm font-medium mt-1">
                {order.moneda === 'MXN' ? `$${(order.total / 100).toFixed(2)} MXN` : `$${(order.total / 100).toFixed(2)} USD`}
              </p>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="mb-4 border-t border-arena pt-4">
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Productos</p>
              <div className="space-y-1.5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate">{item.nombre_es || item.nombre || '—'}</span>
                    <span className="text-muted shrink-0 ml-4">
                      {item.cantidad || item.quantity || 1} &times; ${(item.precio_mxn / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted/60 border-t border-arena pt-4">
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <span>Pago: {order.payment_provider}</span>
              {order.direccion && (
                <span>Envío: {typeof order.direccion === 'string' ? order.direccion : JSON.stringify(order.direccion)}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
