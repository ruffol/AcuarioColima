import { getDb } from './connection'
import { decrementStock } from './connection'

export function createFullOrder(data: {
  email: string
  nombre?: string
  pais: string
  direccion?: string
  moneda: string
  subtotal: number
  costo_envio: number
  total: number
  payment_provider: string
  payment_status: string
  stripe_session_id?: string
  paypal_order_id?: string
  items?: { modelId: number; productTypeId: number; colorId: number; quantity: number; precio: number }[]
}): any {
  const db = getDb()
  const txn = db.transaction(() => {
    const order = createOrder(data)
    if (data.items && data.items.length > 0) {
      const orderItems = data.items.map((item) => ({
        order_id: order.id,
        model_id: item.modelId || 0,
        product_type_id: item.productTypeId || 0,
        color_id: item.colorId || 0,
        quantity: item.quantity || 1,
        precio_unitario: Math.round((item.precio || 0) * (data.moneda === 'MXN' ? 100 : 100)),
      }))
      createOrderItems(orderItems)
      for (const item of data.items) {
        if (item.modelId && item.productTypeId) {
          decrementStock(item.modelId, item.productTypeId, item.quantity || 1)
        }
      }
    }
    return order
  })
  return txn()
}

export function createOrder(data: {
  email: string
  nombre?: string
  pais: string
  direccion?: string
  moneda: string
  subtotal: number
  costo_envio: number
  total: number
  payment_provider: string
  payment_status: string
  stripe_session_id?: string
  paypal_order_id?: string
}): any {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO orders (email, nombre, pais, direccion, moneda, subtotal, costo_envio, total, payment_provider, payment_status, stripe_session_id, paypal_order_id)
    VALUES (@email, @nombre, @pais, @direccion, @moneda, @subtotal, @costo_envio, @total, @payment_provider, @payment_status, @stripe_session_id, @paypal_order_id)
  `)
  const result = stmt.run({
    email: data.email,
    nombre: data.nombre || null,
    pais: data.pais,
    direccion: data.direccion || null,
    moneda: data.moneda,
    subtotal: data.subtotal,
    costo_envio: data.costo_envio,
    total: data.total,
    payment_provider: data.payment_provider,
    payment_status: data.payment_status,
    stripe_session_id: data.stripe_session_id || null,
    paypal_order_id: data.paypal_order_id || null,
  })
  return db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid)
}

export function createOrderItems(items: { order_id: number; model_id: number; product_type_id: number; color_id: number; quantity: number; precio_unitario: number }[]) {
  const db = getDb()
  const stmt = db.prepare('INSERT INTO order_items (order_id, model_id, product_type_id, color_id, quantity, precio_unitario) VALUES (@order_id, @model_id, @product_type_id, @color_id, @quantity, @precio_unitario)')
  for (const item of items) {
    stmt.run(item)
  }
}

export function getOrders(): any[] {
  const db = getDb()
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[]
  return orders.map((o) => ({
    ...o,
    direccion: o.direccion ? JSON.parse(o.direccion) : null,
  }))
}

export function getOrderItems(orderId: number): any[] {
  const db = getDb()
  return db.prepare(`
    SELECT oi.*, m.nombre_es, m.nombre_en, m.slug as model_slug, pt.nombre_es as type_nombre_es, c.nombre_es as color_nombre_es, c.hex_code
    FROM order_items oi
    LEFT JOIN models m ON m.id = oi.model_id
    LEFT JOIN product_types pt ON pt.id = oi.product_type_id
    LEFT JOIN colors c ON c.id = oi.color_id
    WHERE oi.order_id = ?
  `).all(orderId)
}
