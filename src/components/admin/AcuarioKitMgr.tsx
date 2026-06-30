'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAdminToast } from '@/lib/admin-helpers'

interface KitForm {
  slug: string
  nombre_es: string
  nombre_en: string
  descripcion_es: string
  descripcion_en: string
  discount_percent: number
  image: string
  activo: boolean
  items: { product_id: number; quantity: number }[]
}

const EMPTY: KitForm = {
  slug: '', nombre_es: '', nombre_en: '',
  descripcion_es: '', descripcion_en: '',
  discount_percent: 0, image: '', activo: true,
  items: [],
}

export default function AcuarioKitMgr() {
  const [kits, setKits] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [form, setForm] = useState<KitForm>(EMPTY)
  const { toast, showToast } = useAdminToast()

  async function load() {
    const [kitsRes, prodRes] = await Promise.all([
      fetch('/api/admin/acuario/kits'),
      fetch('/api/admin/acuario/products'),
    ])
    setKits(await kitsRes.json())
    setProducts(await prodRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true); setErrors([])
    const res = await fetch('/api/admin/acuario/kits', {
      method: editing ? 'PUT' : 'POST',
      body: JSON.stringify(editing ? { ...form, id: editing } : form),
    })
    const data = await res.json()
    if (res.ok) {
      showToast(editing ? 'Guardado' : 'Creado')
      setEditing(null); setShowForm(false); setForm({ ...EMPTY }); load()
    } else {
      setErrors(data.errors || ['Error'])
    }
    setSaving(false)
  }

  const handleEdit = async (k: any) => {
    setEditing(k.id); setShowForm(true); setErrors([])
    const itemsRes = await fetch(`/api/admin/acuario/kits?id=${k.id}`)
    setForm({
      slug: k.slug, nombre_es: k.nombre_es, nombre_en: k.nombre_en || '',
      descripcion_es: k.descripcion_es || '', descripcion_en: k.descripcion_en || '',
      discount_percent: k.discount_percent || 0, image: k.image || '',
      activo: k.activo !== 0, items: await itemsRes.json(),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar kit?')) return
    await fetch('/api/admin/acuario/kits', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    load(); showToast('Eliminado')
  }

  const addItem = () => setForm({ ...form, items: [...form.items, { product_id: 0, quantity: 1 }] })
  const updateItem = (idx: number, key: string, val: any) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], [key]: val }
    setForm({ ...form, items })
  }
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })

  const getProductName = (id: number) => {
    const p = products.find((p) => p.id === id)
    return p ? p.nombre_es : `ID: ${id}`
  }

  if (loading) return <p className="text-center py-12 text-muted">Cargando...</p>

  return (
    <div>
      {toast.message && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm ${
          toast.type === 'success' ? 'bg-terracota text-white' : 'bg-red-600 text-white'
        }`}>{toast.message}</div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Kits ({kits.length})</h2>
        <Button onClick={() => { setEditing(null); setShowForm(true); setErrors([]); setForm({ ...EMPTY }) }} size="sm">+ Nuevo kit</Button>
      </div>

      {showForm && (
        <div className="bg-card border border-arena rounded-xl p-6 mb-8 space-y-4">
          <h3 className="text-lg font-semibold">{editing ? `Editar: ${form.nombre_es}` : 'Nuevo kit'}</h3>

          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <ul className="list-disc list-inside text-sm text-red-600">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Input label="Nombre (ES)" value={form.nombre_es} onChange={(e) => setForm({ ...form, nombre_es: e.target.value })} />
            <Input label="Nombre (EN)" value={form.nombre_en} onChange={(e) => setForm({ ...form, nombre_en: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Descripción (ES)" value={form.descripcion_es} onChange={(e) => setForm({ ...form, descripcion_es: e.target.value })} />
            <Input label="Descripción (EN)" value={form.descripcion_en} onChange={(e) => setForm({ ...form, descripcion_en: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Descuento (%)" type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: parseInt(e.target.value) || 0 })} />
            <Input label="URL de imagen" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            Activo
          </label>

          <div className="border-t border-arena pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Productos incluidos</h4>
              <Button size="sm" variant="ghost" onClick={addItem}>+ Agregar</Button>
            </div>

            {form.items.length === 0 && <p className="text-sm text-muted">Sin productos</p>}

            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <select className="flex-1 px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm" value={item.product_id} onChange={(e) => updateItem(idx, 'product_id', parseInt(e.target.value))}>
                    <option value={0}>Seleccionar...</option>
                    {products.filter((p: any) => p.activo).map((p: any) => (
                      <option key={p.id} value={p.id}>{p.nombre_es} (${p.precio_mxn})</option>
                    ))}
                  </select>
                  <Input label="Cant." type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} />
                  <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 text-lg px-2">×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-arena">
            <Button onClick={handleSave} loading={saving}>{editing ? 'Guardar' : 'Crear'}</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); setShowForm(false); setForm({ ...EMPTY }) }}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kits.length === 0 ? (
          <p className="text-center py-12 text-muted col-span-2">Sin kits</p>
        ) : (
          kits.map((k) => (
            <div key={k.id} className="bg-card border border-arena rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium">{k.nombre_es}</h3>
                  <p className="text-xs text-muted">/{k.slug}</p>
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-600">{k.discount_percent}% OFF</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleEdit(k)} className="text-xs px-3 py-1.5 rounded-lg bg-terracota/10 text-terracota hover:bg-terracota/20 transition-colors">Editar</button>
                <button onClick={() => handleDelete(k.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
