import { getDb } from '@/lib/db/connection'
import { generateOrderNumber } from '@/lib/orderNumber'
import { buildWhatsAppMessage } from '@/lib/whatsapp'
import { getProducts } from './products'

export interface CreateOrderInput {
  customerName: string
  phone: string
  email?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  deliveryMethod: string
  paymentMethod: string
  notes?: string
  items: Array<{
    productId: number
    productName: string
    variantName?: string
    quantity: number
    unitPrice: number
    image?: string
    sku?: string
  }>
}

export interface Order {
  id: number
  orderNumber: string
  customerName: string
  phone: string
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  deliveryMethod: string
  paymentMethod: string
  notes: string | null
  subtotal: number
  shipping: number
  total: number
  status: string
  whatsappMessage: string | null
  communicationStatus: string
  shippingMethod: string | null
  shippingCost: number
  shippingCarrier: string | null
  createdAt: string
  updatedAt: string | null
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  productSlug: string
  productName: string
  variantName: string | null
  unitPrice: number
  image: string | null
  sku: string | null
  quantity: number
  subtotal: number
}

const DELIVERY_SHIPPING_COST: Record<string, number> = {
  envio_nacional: 200,
  recoger_taller: 0,
  entrega_local: 100,
}

function calcShipping(deliveryMethod: string): number {
  return DELIVERY_SHIPPING_COST[deliveryMethod] ?? 0
}

const VALID_STATUSES = ['NUEVO', 'PENDIENTE', 'CONFIRMADA', 'ENVIADA', 'ENTREGADA', 'CANCELADA']

export function createOrder(input: CreateOrderInput): OrderWithItems {
  const db = getDb()
  const orderNumber = generateOrderNumber()

  const items: Array<{
    productId: number
    productSlug: string
    productName: string
    variantName: string | null
    unitPrice: number
    image: string | null
    sku: string | null
    quantity: number
    subtotal: number
  }> = []

  // Try to look up products from DB for authoritative prices
  const products = getProducts({ activo: true })
  const productMap = new Map(products.map((p) => [p.id, p]))

  for (const item of input.items) {
    const qty = Math.max(1, Math.floor(item.quantity))
    const product = productMap.get(item.productId)

    // Use server price if found, otherwise trust client-provided snapshot
    const unitPrice = product
      ? Math.round(product.precio_mxn)
      : Math.round(item.unitPrice)

    const subtotal = unitPrice * qty

    items.push({
      productId: item.productId,
      productSlug: product?.slug || '',
      productName: item.productName || product?.nombre_es || 'Producto',
      variantName: item.variantName || null,
      unitPrice,
      image: item.image
        || (Array.isArray(product?.images) ? product.images[0] : null)
        || null,
      sku: item.sku || product?.sku || null,
      quantity: qty,
      subtotal,
    })
  }

  if (items.length === 0) {
    throw new Error('El pedido debe contener al menos un producto')
  }

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0)
  const shipping = calcShipping(input.deliveryMethod)
  const total = subtotal + shipping

  const now = new Date().toISOString()

  const order = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO orders (
        orderNumber, customerName, phone, email,
        address, city, state, postalCode,
        deliveryMethod, paymentMethod, notes,
        subtotal, shipping, total,
        status, communicationStatus,
        shippingMethod, shippingCarrier,
        createdAt, updatedAt
      ) VALUES (
        @orderNumber, @customerName, @phone, @email,
        @address, @city, @state, @postalCode,
        @deliveryMethod, @paymentMethod, @notes,
        @subtotal, @shipping, @total,
        'NUEVO', 'PENDING',
        @deliveryMethod, NULL,
        @createdAt, @createdAt
      )
    `).run({
      orderNumber,
      customerName: input.customerName,
      phone: input.phone,
      email: input.email || null,
      address: input.address || null,
      city: input.city || null,
      state: input.state || null,
      postalCode: input.postalCode || null,
      deliveryMethod: input.deliveryMethod,
      paymentMethod: input.paymentMethod,
      notes: input.notes || null,
      subtotal,
      shipping,
      total,
      createdAt: now,
    })

    const orderId = Number(result.lastInsertRowid)

    const insertItem = db.prepare(`
      INSERT INTO order_items (
        order_id, productId, productSlug, productName, variantName,
        unitPrice, image, sku, quantity, subtotal
      ) VALUES (
        @orderId, @productId, @productSlug, @productName, @variantName,
        @unitPrice, @image, @sku, @quantity, @subtotal
      )
    `)

    for (const item of items) {
      insertItem.run({ orderId, ...item })
    }

    // Generate and store WhatsApp message
    const waMessage = buildWhatsAppMessage({
      orderNumber,
      createdAt: now,
      customerName: input.customerName,
      phone: input.phone,
      deliveryMethod: input.deliveryMethod,
      address: input.address,
      city: input.city,
      state: input.state,
      paymentMethod: input.paymentMethod,
      notes: input.notes,
      subtotal,
      shipping,
      total,
      items: items.map((i) => ({
        productName: i.productName,
        variantName: i.variantName || undefined,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal,
      })),
    })

    db.prepare('UPDATE orders SET whatsappMessage = ? WHERE id = ?').run(waMessage, orderId)

    db.prepare(`
      INSERT INTO order_history (orderId, status, date)
      VALUES (?, 'NUEVO', ?)
    `).run(orderId, now)

    return orderId
  })()

  const fullOrder = getOrderById(order) as OrderWithItems
  return fullOrder
}

export function getOrders(filters?: {
  status?: string
  search?: string
  limit?: number
  offset?: number
}): OrderWithItems[] {
  const db = getDb()
  const conditions: string[] = []
  const params: any[] = []

  if (filters?.status && VALID_STATUSES.includes(filters.status)) {
    conditions.push('o.status = ?')
    params.push(filters.status)
  }

  if (filters?.search) {
    const q = `%${filters.search}%`
    conditions.push('(o.orderNumber LIKE ? OR o.customerName LIKE ? OR o.phone LIKE ?)')
    params.push(q, q, q)
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
  const limit = filters?.limit ?? 100
  const offset = filters?.offset ?? 0

  const orders = db.prepare(`
    SELECT o.* FROM orders o ${where}
    ORDER BY o.createdAt DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as any[]

  return orders.map((o) => ({
    ...o,
    items: getItemsForOrder(o.id),
  }))
}

export function getOrderById(id: number): OrderWithItems | null {
  const db = getDb()
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any
  if (!order) return null
  return {
    ...order,
    items: getItemsForOrder(order.id),
  }
}

export function getOrderByOrderNumber(orderNumber: string): OrderWithItems | null {
  const db = getDb()
  const order = db.prepare('SELECT * FROM orders WHERE orderNumber = ?').get(orderNumber) as any
  if (!order) return null
  return {
    ...order,
    items: getItemsForOrder(order.id),
  }
}

function getItemsForOrder(orderId: number): OrderItem[] {
  const db = getDb()
  return db.prepare(`
    SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC
  `).all(orderId) as OrderItem[]
}

export function updateOrderStatus(id: number, status: string): OrderWithItems {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Estado inválido: ${status}. Valores: ${VALID_STATUSES.join(', ')}`)
  }

  const db = getDb()
  const now = new Date().toISOString()

  db.transaction(() => {
    db.prepare('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?').run(status, now, id)
    db.prepare('INSERT INTO order_history (orderId, status, date) VALUES (?, ?, ?)').run(id, status, now)
  })()

  return getOrderById(id)!
}

export function getOrderHistory(orderId: number): Array<{ id: number; status: string; date: string; user: string | null }> {
  const db = getDb()
  return db.prepare(`
    SELECT * FROM order_history WHERE orderId = ? ORDER BY date ASC
  `).all(orderId) as any[]
}

export function markWhatsAppOpened(id: number): void {
  const db = getDb()
  db.prepare("UPDATE orders SET communicationStatus = 'OPENED', updatedAt = ? WHERE id = ?").run(
    new Date().toISOString(), id
  )
}
