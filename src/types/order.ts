export interface Order {
  id: number
  email: string
  nombre: string | null
  pais: string
  direccion: Record<string, unknown> | null
  moneda: 'MXN' | 'USD'
  subtotal: number
  costo_envio: number
  total: number
  payment_provider: 'stripe' | 'paypal'
  payment_status: string
  stripe_session_id: string | null
  paypal_order_id: string | null
  created_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  model_id: number
  product_type_id: number
  color_id: number
  quantity: number
  precio_unitario: number
}
