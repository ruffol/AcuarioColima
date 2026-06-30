'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect, useMemo } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ImageUploader from '@/components/admin/ImageUploader'
import { authHeaders, useAdminToast } from '@/lib/admin-helpers'

const MODEL_TEMPLATE = {
  slug: '',
  nombre_es: '',
  nombre_en: '',
  descripcion_es: 'Artesanía tradicional de Colima. Hecho a mano con barro natural. Cada pieza es única.',
  descripcion_en: 'Traditional Colima craftsmanship. Handmade with natural clay. Each piece is unique.',
  historia_es: 'Pieza única de la tradición Tlalchichi de Colima, México.',
  historia_en: 'Unique piece from the Tlalchichi tradition of Colima, Mexico.',
  categoria_es: 'Llaveros',
  categoria_en: 'Keychains',
  precio_mxn: 35,
  precio_usd: 2,
  stock: 42,
  destacado: false,
  imagenes: [] as string[],
  colores: [
    { nombre_es: 'Blanco', nombre_en: 'White', hex: '#F5F5F5', imagen: '' },
    { nombre_es: 'Negro', nombre_en: 'Black', hex: '#2D2D2D', imagen: '' },
    { nombre_es: 'Traslúcido', nombre_en: 'Translucent', hex: '#D4D4D4', imagen: '' },
    { nombre_es: 'Naranja', nombre_en: 'Orange', hex: '#E87A3E', imagen: '' },
  ],
}

export default function ModelManager() {
  const t = useTranslations('Admin')
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { toast, showToast } = useAdminToast()
  const [errors, setErrors] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(MODEL_TEMPLATE)

  async function loadModels() {
    const res = await fetch('/api/admin/models', { headers: authHeaders() })
    const data = await res.json()
    setModels(data || [])
    setLoading(false)
  }

  useEffect(() => { loadModels() }, [])

  const handleSave = async () => {
    setSaving(true)
    setErrors([])
    const res = await fetch('/api/admin/models', {
      method: editing ? 'PUT' : 'POST',
      headers: authHeaders(),
      body: JSON.stringify(editing ? { ...form, id: editing } : form),
    })
    const data = await res.json()
    if (res.ok) {
      showToast(editing ? t('guardado') : 'Creado')
      setEditing(null)
      setShowForm(false)
      setForm({ ...MODEL_TEMPLATE })
      loadModels()
    } else {
      setErrors(data.errors || ['Error al guardar'])
    }
    setSaving(false)
  }

  const handleEdit = (p: any) => {
    setEditing(p.id)
    setShowForm(true)
    setErrors([])
    const imgs = p.imagenes
      ? (typeof p.imagenes === 'string' ? JSON.parse(p.imagenes) : p.imagenes)
      : []
    const cols = p.colores
      ? (typeof p.colores === 'string' ? JSON.parse(p.colores) : p.colores)
      : MODEL_TEMPLATE.colores
    setForm({
      slug: p.slug,
      nombre_es: p.nombre_es,
      nombre_en: p.nombre_en,
      descripcion_es: p.descripcion_es || '',
      descripcion_en: p.descripcion_en || '',
      historia_es: p.historia_es || '',
      historia_en: p.historia_en || '',
      categoria_es: p.categoria_es || '',
      categoria_en: p.categoria_en || '',
      precio_mxn: p.precio_mxn || 0,
      precio_usd: p.precio_usd || 0,
      stock: p.stock || 0,
      destacado: !!p.destacado,
      imagenes: imgs,
      colores: cols,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNew = () => {
    setEditing(null)
    setShowForm(true)
    setErrors([])
    setForm({ ...MODEL_TEMPLATE })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
    setErrors([])
    setForm({ ...MODEL_TEMPLATE })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar modelo?')) return
    await fetch('/api/admin/models', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ id }),
    })
    loadModels()
    showToast('Modelo eliminado')
  }

  const filtered = useMemo(
    () => models.filter((p) => {
      if (!search) return true
      const q = search.toLowerCase()
      return p.nombre_es?.toLowerCase().includes(q)
        || p.nombre_en?.toLowerCase().includes(q)
        || p.slug?.toLowerCase().includes(q)
    }),
    [models, search],
  )

  if (loading) return <p className="text-center py-12 text-muted">{t('cargando')}</p>

  return (
    <div>
      {toast.message && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm ${
          toast.type === 'success' ? 'bg-terracota text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {showForm && (
        <div className="bg-card rounded-xl border border-arena p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            {editing ? `Editar: ${form.nombre_es || 'Producto'}` : 'Nuevo producto'}
          </h2>

          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <ul className="list-disc list-inside text-sm text-red-600 space-y-0.5">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="order-2 lg:order-1">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Vista previa</p>
              <div className="border border-arena rounded-xl overflow-hidden bg-arena/30">
                <div className="aspect-[4/5] bg-arena overflow-hidden">
                  {form.imagenes[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.imagenes[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-sm">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <p className="font-medium text-sm text-foreground">{form.nombre_es || 'Nombre del producto'}</p>
                  <p className="text-lg font-semibold text-terracota">${form.precio_mxn || 0} MXN</p>
                  <p className="text-xs text-muted line-clamp-2">{form.descripcion_es || 'Descripción...'}</p>
                  <div className="flex gap-1.5 pt-1">
                    {(form.colores || []).slice(0, 4).map((c: any, i: number) => (
                      <div key={i} className="w-5 h-5 rounded-full border border-arena" style={{ backgroundColor: c.hex }} title={c.nombre_es} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted mt-2 text-center">Así se verá el producto en la tienda</p>
            </div>

            <div className="order-1 lg:order-2 space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Info básica</p>
                <div className="space-y-3">
                  <Input label="Nombre (ES)" value={form.nombre_es} onChange={(e) => setForm({ ...form, nombre_es: e.target.value })} />
                  <Input label="Nombre (EN)" value={form.nombre_en} onChange={(e) => setForm({ ...form, nombre_en: e.target.value })} />
                  <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generado" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Categoría (ES)</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm" value={form.categoria_es} onChange={(e) => setForm({ ...form, categoria_es: e.target.value })}>
                    <option value="Llaveros">Llaveros</option>
                    <option value="Portamacetas">Portamacetas</option>
                    <option value="Alcancías">Alcancías</option>
                    <option value="Cuencos">Cuencos</option>
                  </select>
                </div>
                <Input label="Categoría (EN)" value={form.categoria_en} onChange={(e) => setForm({ ...form, categoria_en: e.target.value })} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input label="Precio MXN" type="number" value={form.precio_mxn} onChange={(e) => setForm({ ...form, precio_mxn: parseInt(e.target.value) || 0 })} />
                <Input label="Precio USD" type="number" step="0.01" value={form.precio_usd} onChange={(e) => setForm({ ...form, precio_usd: parseFloat(e.target.value) || 0 })} />
                <Input label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
              </div>

              <ImageUploader
                images={form.imagenes}
                onChange={(imagenes) => setForm({ ...form, imagenes })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-arena">
            <Button onClick={handleSave} loading={saving}>{editing ? 'Guardar cambios' : 'Crear producto'}</Button>
            <Button variant="ghost" onClick={handleCancel}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Productos ({filtered.length})</h2>
          <Button onClick={handleNew} size="sm">+ Nuevo</Button>
        </div>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border border-arena bg-card text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracota/50 w-full sm:w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 text-muted">{search ? 'Sin resultados' : 'No hay productos aún. Crea el primero con "+ Nuevo"'}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((p) => {
            const imgs = p.imagenes
              ? (typeof p.imagenes === 'string' ? JSON.parse(p.imagenes) : p.imagenes)
              : []
            return (
              <div key={p.id} className="bg-card border border-arena rounded-xl overflow-hidden hover:border-terracota/30 transition-colors group cursor-pointer" onClick={() => handleEdit(p)}>
                <div className="aspect-square bg-arena overflow-hidden">
                  {imgs[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgs[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-xs">Sin imagen</div>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <p className="font-medium text-sm text-foreground truncate">{p.nombre_es}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-terracota font-medium">${p.precio_mxn || '-'} MXN</p>
                    <span className="text-xs text-muted">Stock: {p.stock || '-'}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                      className="flex-1 text-center px-2 py-1 text-xs rounded-lg bg-terracota/10 text-terracota hover:bg-terracota/20 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                      className="flex-1 text-center px-2 py-1 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
