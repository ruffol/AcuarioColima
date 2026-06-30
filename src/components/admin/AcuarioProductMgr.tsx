'use client'

import { useState, useEffect, useMemo } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAdminToast } from '@/lib/admin-helpers'

interface ProductForm {
  slug: string
  nombre_es: string
  nombre_en: string
  descripcion_es: string
  descripcion_en: string
  category_id: number | null
  brand: string
  sku: string
  barcode: string
  weight_kg: number
  supplier: string
  cost_price: number
  margin: number
  precio_mxn: number
  precio_usd: number
  stock: number
  images: string[]
  size_cm: string
  tipo: 'pez' | 'accesorio'
  destacado: boolean
  activo: boolean
  compatibility_ids: number[]
  fish_specs: {
    scientific_name: string
    temp_min: number
    temp_max: number
    ph_min: number
    ph_max: number
    adult_size_cm: number
    difficulty: string
    lifespan_years: number
    feeding: string
    min_volume_liters: number
    water_type: string
  }
}

const EMPTY_FORM: ProductForm = {
  slug: '', nombre_es: '', nombre_en: '',
  descripcion_es: '', descripcion_en: '',
  category_id: null, brand: '', sku: '', barcode: '',
  weight_kg: 0, supplier: '', cost_price: 0, margin: 0,
  precio_mxn: 0, precio_usd: 0, stock: 0, images: [], size_cm: '',
  tipo: 'accesorio', destacado: false, activo: true, compatibility_ids: [],
  fish_specs: {
    scientific_name: '', temp_min: 0, temp_max: 0,
    ph_min: 0, ph_max: 0, adult_size_cm: 0,
    difficulty: 'fácil', lifespan_years: 0, feeding: '',
    min_volume_liters: 0, water_type: 'dulce',
  },
}

export default function AcuarioProductMgr() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState<string>('')
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const { toast, showToast } = useAdminToast()

  async function loadData() {
    const [prodRes, catRes] = await Promise.all([
      fetch('/api/admin/acuario/products'),
      fetch('/api/admin/acuario/categories'),
    ])
    setProducts(await prodRes.json())
    setCategories(await catRes.json())
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleSave = async () => {
    setSaving(true)
    setErrors([])
    const res = await fetch('/api/admin/acuario/products', {
      method: editing ? 'PUT' : 'POST',
      body: JSON.stringify(editing ? { ...form, id: editing } : form),
    })
    const data = await res.json()
    if (res.ok) {
      showToast(editing ? 'Guardado' : 'Creado')
      setEditing(null); setShowForm(false); setForm({ ...EMPTY_FORM })
      loadData()
    } else {
      setErrors(data.errors || ['Error al guardar'])
    }
    setSaving(false)
  }

  const handleEdit = (p: any) => {
    setEditing(p.id)
    setErrors([])
    const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images || []
    const compat = typeof p.compatibility_ids === 'string' ? JSON.parse(p.compatibility_ids) : p.compatibility_ids || []
    setForm({
      slug: p.slug, nombre_es: p.nombre_es, nombre_en: p.nombre_en,
      descripcion_es: p.descripcion_es || '', descripcion_en: p.descripcion_en || '',
      category_id: p.category_id, brand: p.brand || '', sku: p.sku || '',
      barcode: p.barcode || '', weight_kg: p.weight_kg || 0, supplier: p.supplier || '',
      cost_price: p.cost_price || 0, margin: p.margin || 0,
      precio_mxn: p.precio_mxn || 0, precio_usd: p.precio_usd || 0,
      stock: p.stock || 0, images: imgs, size_cm: p.size_cm || '',
      tipo: p.tipo || 'accesorio', destacado: !!p.destacado, activo: p.activo !== 0,
      compatibility_ids: compat,
      fish_specs: p.fish_specs || { ...EMPTY_FORM.fish_specs },
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar producto?')) return
    await fetch('/api/admin/acuario/products', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    loadData()
    showToast('Eliminado')
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filterTipo && p.tipo !== filterTipo) return false
      if (!search) return true
      const q = search.toLowerCase()
      return p.nombre_es?.toLowerCase().includes(q) || p.nombre_en?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q)
    })
  }, [products, search, filterTipo])

  if (loading) return <p className="text-center py-12 text-muted">Cargando...</p>

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

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Nombre (ES)" value={form.nombre_es} onChange={(e) => setForm({ ...form, nombre_es: e.target.value })} />
              <Input label="Nombre (EN)" value={form.nombre_en} onChange={(e) => setForm({ ...form, nombre_en: e.target.value })} />
              <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Categoría</label>
                <select className="w-full px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm" value={form.category_id ?? ''} onChange={(e) => setForm({ ...form, category_id: e.target.value ? parseInt(e.target.value) : null })}>
                  <option value="">Sin categoría</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.nombre_es}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tipo</label>
                <select className="w-full px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as 'pez' | 'accesorio' })}>
                  <option value="accesorio">Accesorio</option>
                  <option value="pez">Pez</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Descripción (ES)" value={form.descripcion_es} onChange={(e) => setForm({ ...form, descripcion_es: e.target.value })} />
              <Input label="Descripción (EN)" value={form.descripcion_en} onChange={(e) => setForm({ ...form, descripcion_en: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input label="Precio MXN" type="number" value={form.precio_mxn} onChange={(e) => setForm({ ...form, precio_mxn: parseFloat(e.target.value) || 0 })} />
              <Input label="Precio USD" type="number" step="0.01" value={form.precio_usd} onChange={(e) => setForm({ ...form, precio_usd: parseFloat(e.target.value) || 0 })} />
              <Input label="Costo" type="number" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })} />
              <Input label="Margen %" type="number" value={form.margin} onChange={(e) => setForm({ ...form, margin: parseFloat(e.target.value) || 0 })} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
              <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <Input label="Código de barras" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
              <Input label="Peso (kg)" type="number" step="0.01" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: parseFloat(e.target.value) || 0 })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="Marca" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              <Input label="Proveedor" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
              <Input label="Tamaño (cm)" value={form.size_cm} onChange={(e) => setForm({ ...form, size_cm: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">URLs de imágenes (una por línea)</label>
              <textarea
                className="w-full px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm resize-y h-20"
                value={form.images.join('\n')}
                onChange={(e) => setForm({ ...form, images: e.target.value.split('\n').filter(Boolean) })}
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.destacado} onChange={(e) => setForm({ ...form, destacado: e.target.checked })} />
                Destacado
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
                Activo
              </label>
            </div>

            {form.tipo === 'pez' && (
              <div className="border-t border-arena pt-6">
                <h3 className="text-lg font-semibold mb-4">Especificaciones del pez</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input label="Nombre científico" value={form.fish_specs.scientific_name} onChange={(e) => setForm({ ...form, fish_specs: { ...form.fish_specs, scientific_name: e.target.value } })} />
                  <Input label="Temperatura mín (°C)" type="number" value={form.fish_specs.temp_min} onChange={(e) => setForm({ ...form, fish_specs: { ...form.fish_specs, temp_min: parseFloat(e.target.value) || 0 } })} />
                  <Input label="Temperatura máx (°C)" type="number" value={form.fish_specs.temp_max} onChange={(e) => setForm({ ...form, fish_specs: { ...form.fish_specs, temp_max: parseFloat(e.target.value) || 0 } })} />
                  <Input label="pH mín" type="number" step="0.1" value={form.fish_specs.ph_min} onChange={(e) => setForm({ ...form, fish_specs: { ...form.fish_specs, ph_min: parseFloat(e.target.value) || 0 } })} />
                  <Input label="pH máx" type="number" step="0.1" value={form.fish_specs.ph_max} onChange={(e) => setForm({ ...form, fish_specs: { ...form.fish_specs, ph_max: parseFloat(e.target.value) || 0 } })} />
                  <Input label="Tamaño adulto (cm)" type="number" value={form.fish_specs.adult_size_cm} onChange={(e) => setForm({ ...form, fish_specs: { ...form.fish_specs, adult_size_cm: parseFloat(e.target.value) || 0 } })} />
                  <Input label="Esperanza de vida (años)" type="number" value={form.fish_specs.lifespan_years} onChange={(e) => setForm({ ...form, fish_specs: { ...form.fish_specs, lifespan_years: parseFloat(e.target.value) || 0 } })} />
                  <Input label="Vol. mínimo (L)" type="number" value={form.fish_specs.min_volume_liters} onChange={(e) => setForm({ ...form, fish_specs: { ...form.fish_specs, min_volume_liters: parseFloat(e.target.value) || 0 } })} />
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Dificultad</label>
                    <select className="w-full px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm" value={form.fish_specs.difficulty} onChange={(e) => setForm({ ...form, fish_specs: { ...form.fish_specs, difficulty: e.target.value } })}>
                      <option value="fácil">Fácil</option>
                      <option value="media">Media</option>
                      <option value="difícil">Difícil</option>
                      <option value="experto">Experto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Tipo de agua</label>
                    <select className="w-full px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm" value={form.fish_specs.water_type} onChange={(e) => setForm({ ...form, fish_specs: { ...form.fish_specs, water_type: e.target.value } })}>
                      <option value="dulce">Dulce</option>
                      <option value="salada">Salada</option>
                      <option value="salobre">Salobre</option>
                    </select>
                  </div>
                  <Input label="Alimentación" value={form.fish_specs.feeding} onChange={(e) => setForm({ ...form, fish_specs: { ...form.fish_specs, feeding: e.target.value } })} />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-arena">
            <Button onClick={handleSave} loading={saving}>{editing ? 'Guardar cambios' : 'Crear producto'}</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); setShowForm(false); setForm({ ...EMPTY_FORM }); }}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Productos ({filtered.length})</h2>
          <Button onClick={() => { setEditing(null); setShowForm(true); setErrors([]); setForm({ ...EMPTY_FORM }); }} size="sm">+ Nuevo</Button>
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm" value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="pez">Peces</option>
            <option value="accesorio">Accesorios</option>
          </select>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl border border-arena bg-card text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracota/50 w-64"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 text-muted">Sin resultados</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((p: any) => {
            const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images || []
            return (
              <div key={p.id} className="bg-card border border-arena rounded-xl overflow-hidden hover:border-terracota/30 transition-colors group cursor-pointer" onClick={() => handleEdit(p)}>
                <div className="aspect-square bg-arena overflow-hidden">
                  {imgs[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgs[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-xs">Sin img</div>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <p className="font-medium text-sm text-foreground truncate">{p.nombre_es}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-terracota font-medium">${p.precio_mxn || '-'} MXN</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${p.tipo === 'pez' ? 'bg-blue-50 text-blue-600' : 'bg-arena text-muted'}`}>{p.tipo}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Stock: {p.stock ?? '-'}</span>
                    <span className={p.activo ? 'text-green-600' : 'text-red-500'}>{p.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(p); }} className="flex-1 px-2 py-1 text-xs rounded-lg bg-terracota/10 text-terracota hover:bg-terracota/20 transition-colors">Editar</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="flex-1 px-2 py-1 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Eliminar</button>
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
