import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { useDb } from '@/lib/repositories/base'

export async function GET(req: Request) {
  const auth = requireAdmin(req)
  if (auth) return auth

  const db = useDb()

  const totalProducts = (db.prepare('SELECT COUNT(*) as count FROM new_products WHERE activo = 1').get() as any).count
  const totalFish = (db.prepare("SELECT COUNT(*) as count FROM new_products WHERE tipo = 'pez' AND activo = 1").get() as any).count
  const lowStock = (db.prepare("SELECT COUNT(*) as count FROM new_products WHERE stock > 0 AND stock <= 5 AND activo = 1").get() as any).count
  const outOfStock = (db.prepare("SELECT COUNT(*) as count FROM new_products WHERE stock = 0 AND activo = 1").get() as any).count
  const publishedPosts = (db.prepare('SELECT COUNT(*) as count FROM blog_posts WHERE published = 1').get() as any).count

  const today = new Date().toISOString().slice(0, 10)
  const salesToday = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE date(created_at) = ?").get(today) as any).count

  const topProducts = db.prepare(`
    SELECT p.nombre_es, SUM(oi.quantity) as total_sold
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN new_products p ON p.id = oi.model_id
    WHERE date(o.created_at) >= date('now', '-30 days')
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT 5
  `).all()

  return NextResponse.json({
    totalProducts,
    totalFish,
    lowStock,
    outOfStock,
    publishedPosts,
    salesToday,
    topProducts,
  })
}
