import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import seedData from '@/lib/seed.json'

export async function POST() {
  try {
    const db = getDb()
    const values = [42, 67, 69]

    const products = db.prepare('SELECT id, slug FROM products').all() as any[]
    const update = db.prepare('UPDATE products SET stock = ? WHERE id = ?')

    let updated = 0
    for (let i = 0; i < products.length; i++) {
      const stock = values[i % values.length]
      update.run(stock, products[i].id)
      updated++
    }

    return NextResponse.json({
      success: true,
      mensaje: `Stock actualizado para ${updated} productos`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
