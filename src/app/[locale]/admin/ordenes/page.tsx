'use client'

import { useState, useEffect, useCallback } from 'react'

const STATUSES = ['NUEVO', 'PENDIENTE', 'CONFIRMADA', 'ENVIADA', 'ENTREGADA', 'CANCELADA']

const STATUS_COLORS: Record<string, string> = {
  NUEVO: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  PENDIENTE: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  CONFIRMADA: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  ENVIADA: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  ENTREGADA: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  CANCELADA: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
}

export default function AdminOrdenesPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  const authHeaders = () => {
    const token = sessionStorage.getItem('admin_token')
    return token ? { Authorization: `Bearer ${token}` } : undefined
  }

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    if (search) params.set('search', search)

    try {
      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: authHeaders(),
      })
      const data = await res.json()
      setOrders(data || [])
    } catch (e) {
      console.error('Error fetching orders:', e)
    } finally {
      setLoading(false)
    }
  }, [filterStatus, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) fetchOrders()
    } catch (e) {
      console.error('Error updating status:', e)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !filterStatus ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-foreground'
            }`}
          >
            Todas
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === s ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por #orden, nombre, teléfono..."
          className="w-full sm:w-64 px-3 py-2 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Orders */}
      {loading ? (
        <p className="text-center py-12 text-muted">Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="text-center py-12 text-muted">No hay órdenes</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isNew = order.orderNumber
            const status = order.status || order.payment_status || 'pending'
            return (
              <div key={order.id} className="p-6 bg-card rounded-xl border border-border">
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">
                        {order.customerName || order.nombre || '—'}
                      </p>
                      {isNew && (
                        <span className="text-xs text-muted font-mono">
                          {order.orderNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted">
                      {order.phone || order.email || '—'}
                    </p>
                    <p className="text-xs text-muted/60 mt-1">
                      {new Date(order.createdAt || order.created_at).toLocaleString('es-MX')}
                      {isNew && ` · #${order.id}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || ''}`}>
                      {status}
                    </span>
                    <p className="text-sm font-medium mt-1 text-foreground">
                      ${(order.total / 100).toFixed(2)} MXN
                    </p>
                  </div>
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-4 border-t border-border pt-4">
                    <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Productos</p>
                    <div className="space-y-1.5">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="truncate text-foreground">
                            {item.productName || item.nombre_es || item.nombre || '—'}
                            {item.variantName ? ` (${item.variantName})` : ''}
                          </span>
                          <span className="text-muted shrink-0 ml-4">
                            {item.quantity || 1} &times; ${((item.unitPrice ?? item.precio_unitario) / 100).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details */}
                {isNew && (
                  <div className="text-xs text-muted/80 border-t border-border pt-3 mb-3 space-y-1">
                    <p>Entrega: {order.deliveryMethod} | Pago: {order.paymentMethod}</p>
                    {order.address && <p>Dirección: {order.address}, {order.city}, {order.state} CP {order.postalCode}</p>}
                    {order.notes && <p>Notas: {order.notes}</p>}
                    {order.whatsappMessage && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-primary hover:underline text-xs">Ver mensaje WhatsApp</summary>
                        <pre className="mt-2 p-3 bg-surface rounded-lg text-xs whitespace-pre-wrap font-mono">{order.whatsappMessage}</pre>
                      </details>
                    )}
                  </div>
                )}

                {!isNew && (
                  <div className="text-xs text-muted/60 border-t border-border pt-3">
                    <span>Pago: {order.payment_provider} | </span>
                    <span>Status: {order.payment_status}</span>
                  </div>
                )}

                {/* Status actions */}
                {isNew && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                    {STATUSES.map((s) => {
                      if (s === order.status) return null
                      return (
                        <button
                          key={s}
                          onClick={() => updateStatus(order.id, s)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-surface text-muted hover:text-foreground hover:bg-border transition-colors"
                        >
                          Marcar {s}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
