'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAdminToast } from '@/lib/admin-helpers'

interface CatForm {
  slug: string
  nombre_es: string
  nombre_en: string
  icon: string
  parent_id: number | null
}

const EMPTY: CatForm = { slug: '', nombre_es: '', nombre_en: '', icon: '', parent_id: null }

export default function AcuarioCategoryMgr() {
  const [cats, setCats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState<CatForm>(EMPTY)
  const [errors, setErrors] = useState<string[]>([])
  const { toast, showToast } = useAdminToast()

  async function load() {
    const res = await fetch('/api/admin/acuario/categories')
    setCats(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setErrors([])
    const res = await fetch('/api/admin/acuario/categories', {
      method: editing ? 'PUT' : 'POST',
      body: JSON.stringify(editing ? { ...form, id: editing } : form),
    })
    const data = await res.json()
    if (res.ok) {
      showToast(editing ? 'Guardado' : 'Creado')
      setEditing(null); setForm({ ...EMPTY }); load()
    } else {
      setErrors(data.errors || ['Error'])
    }
  }

  const handleEdit = (c: any) => {
    setEditing(c.id)
    setForm({ slug: c.slug, nombre_es: c.nombre_es, nombre_en: c.nombre_en || '', icon: c.icon || '', parent_id: c.parent_id })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar categoría?')) return
    await fetch('/api/admin/acuario/categories', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    load(); showToast('Eliminado')
  }

  if (loading) return <p className="text-center py-12 text-muted">Cargando...</p>

  return (
    <div>
      {toast.message && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm ${
          toast.type === 'success' ? 'bg-terracota text-white' : 'bg-red-600 text-white'
        }`}>{toast.message}</div>
      )}

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <ul className="list-disc list-inside text-sm text-red-600">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold">Categorías ({cats.length})</h2>
        <Button onClick={() => { setEditing(null); setForm({ ...EMPTY }) }} size="sm">+ Nueva</Button>
      </div>

      {(editing !== null || editing === null && (form.slug || form.nombre_es)) && (
        <div className="bg-card border border-arena rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input label="Nombre (ES)" value={form.nombre_es} onChange={(e) => setForm({ ...form, nombre_es: e.target.value })} />
          <Input label="Nombre (EN)" value={form.nombre_en} onChange={(e) => setForm({ ...form, nombre_en: e.target.value })} />
          <Input label="Icono (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Categoría padre</label>
            <select className="w-full px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm" value={form.parent_id ?? ''} onChange={(e) => setForm({ ...form, parent_id: e.target.value ? parseInt(e.target.value) : null })}>
              <option value="">Sin padre</option>
              {cats.filter((c) => c.id !== editing).map((c) => (
                <option key={c.id} value={c.id}>{c.nombre_es}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-end">
            <Button onClick={handleSave} size="sm">{editing ? 'Guardar' : 'Crear'}</Button>
            <Button variant="ghost" size="sm" onClick={() => { setEditing(null); setForm({ ...EMPTY }) }}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cats.map((c) => (
          <div key={c.id} className="bg-card border border-arena rounded-xl p-4 hover:border-terracota/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{c.icon || '📁'}</span>
              <h3 className="font-medium">{c.nombre_es}</h3>
            </div>
            <p className="text-xs text-muted mb-1">Slug: {c.slug}</p>
            {c.parent_id && <p className="text-xs text-muted">Padre ID: {c.parent_id}</p>}
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleEdit(c)} className="text-xs px-3 py-1 rounded-lg bg-terracota/10 text-terracota hover:bg-terracota/20 transition-colors">Editar</button>
              <button onClick={() => handleDelete(c.id)} className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
