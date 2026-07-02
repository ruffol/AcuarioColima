const STORE_NAME = process.env.STORE_NAME || 'Tlalchichi'
const DOMAIN = process.env.NEXT_PUBLIC_BASE_URL || 'https://acuariocolima.com'

export function buildWhatsAppMessage(order: {
  orderNumber: string
  createdAt: string
  customerName: string
  phone: string
  deliveryMethod: string
  address?: string
  city?: string
  state?: string
  paymentMethod: string
  notes?: string
  subtotal: number
  shipping: number
  total: number
  items: Array<{
    productName: string
    variantName?: string
    quantity: number
    unitPrice: number
    subtotal: number
  }>
}): string {
  const now = new Date(order.createdAt || new Date().toISOString())
  const dateStr = now.toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit',
  })

  const deliveryLabels: Record<string, string> = {
    envio_nacional: 'Envío nacional',
    recoger_taller: 'Recoger en taller',
    entrega_local: 'Entrega local (Colima)',
  }

  const paymentLabels: Record<string, string> = {
    transferencia: 'Transferencia',
    deposito: 'Depósito',
    efectivo: 'Efectivo',
    contra_entrega: 'Contra entrega',
  }

  let msg = `🛒 *Nueva Orden de Compra*\n\n`
  msg += `*Orden:*\n${order.orderNumber}\n\n`
  msg += `*Fecha:*\n${dateStr}\n\n`
  msg += `*Hora:*\n${timeStr}\n\n`
  msg += `*Cliente:*\n${order.customerName}\n\n`
  msg += `*Teléfono:*\n${order.phone}\n\n`
  msg += `*Entrega:*\n${deliveryLabels[order.deliveryMethod] || order.deliveryMethod}\n\n`

  if (order.address || order.city) {
    msg += `*Dirección:*\n${order.address || ''}${order.city ? `\n${order.city}` : ''}${order.state ? `, ${order.state}` : ''}\n\n`
  }

  msg += `*Productos:*\n`
  for (const item of order.items) {
    msg += `\n• ${item.productName}${item.variantName ? ` (${item.variantName})` : ''}`
    msg += `\n  Cantidad: ${item.quantity}`
    msg += `\n  Precio: $${(item.unitPrice / 100).toLocaleString()}`
  }

  msg += `\n\n*Subtotal:*\n$${(order.subtotal / 100).toLocaleString()}`
  msg += `\n\n*Envío:*\n$${(order.shipping / 100).toLocaleString()}`
  msg += `\n\n*Total:*\n$${(order.total / 100).toLocaleString()}`
  msg += `\n\n*Método de pago:*\n${paymentLabels[order.paymentMethod] || order.paymentMethod}`

  if (order.notes?.trim()) {
    msg += `\n\n*Notas del cliente:*\n${order.notes.trim()}`
  }

  msg += `\n\n_Gracias._`
  msg += `\n\n--------------------------------`
  msg += `\nPedido realizado desde ${DOMAIN}`

  return msg
}

export function openWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/[^0-9]/g, '')
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}
