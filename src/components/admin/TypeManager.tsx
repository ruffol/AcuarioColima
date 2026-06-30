'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { authHeaders, useAdminToast } from '@/lib/admin-helpers'

const emptyType = {
  slug: '',
  nombre_es: '',
  nombre_en: '',
  precio_mxn: 0,
  precio_usd: 0,
}

export default function TypeManager() {
  const [types, setTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const { toast, showToast } = useAdminToast()
  const [errors, setErrors] = useState<string[]>([])
  const [form, setForm] = useState(emptyType)

  async function loadTypes() {
    const res = await fetch('/api/admin/product-types', { headers: authHeaders() })
    const data = await res.json()
    setTypes(data || [])
    setLoading(false)
  }

  useEffect(() => { loadTypes() }, [])

  const handleSave = async () => {
    setSaving(true)
    setErrors([])
    const res = await fetch('/api/admin/product-types', {
      method: editing ? 'PUT' : 'POST',
      headers: authHeaders(),
      body: JSON.stringify(editing ? { ...form, id: editing } : form),
    })
    const data = await res.json()
    if (res.ok) {
      showToast(editing ? 'Guardado' : 'Creado')
      setEditing(null)
      setForm({ ...emptyType })
      loadTypes()
    } else {
      setErrors(data.errors || ['Error al guardar'])
    }
    setSaving(false)
  }

  const handleEdit = (p: any) => {
    setEditing(p.id)
    setErrors([])
    setForm({
      slug: p.slug,
      nombre_es: p.nombre_es,
      nombre_en: p.nombre_en,
      precio_mxn: p.precio_mxn,
      precio_usd: p.precio_usd,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar tipo de producto?')) return
    await fetch('/api/admin/product-types', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ id }),
    })
    loadTypes()
    showToast('Tipo eliminado')
  }

  if (loading) return <p className="text-center py-12 text-muted">Cargando...</p>

  return (
    <div>
      {toast.message && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm animate-fade-in ${
          toast.type === 'success' ? 'bg-terracota text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="bg-card rounded-xl border border-arena p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">
          {editing ? `Editar: ${form.nombre_es}` : 'Nuevo tipo de producto'}
        </h2>

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Errores:</p>
            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300 space-y-0.5">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ej: llaveros" />
          <Input label="Nombre (ES)" value={form.nombre_es} onChange={(e) => setForm({ ...form, nombre_es: e.target.value })} />
          <Input label="Nombre (EN)" value={form.nombre_en} onChange={(e) => setForm({ ...form, nombre_en: e.target.value })} />
          <Input label="Precio MXN" type="number" value={form.precio_mxn} onChange={(e) => setForm({ ...form, precio_mxn: parseInt(e.target.value) || 0 })} />
          <Input label="Precio USD" type="number" step="0.01" value={form.precio_usd} onChange={(e) => setForm({ ...form, precio_usd: parseFloat(e.target.value) || 0 })} />
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-arena">
          <Button onClick={handleSave} loading={saving}>Guardar</Button>
          {editing && (
            <Button variant="ghost" onClick={() => { setEditing(null); setForm({ ...emptyType }); setErrors([]) }}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-arena">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-arena text-left text-muted text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Precio MXN</th>
              <th className="px-4 py-3 font-medium">Precio USD</th>
              <th className="px-4 py-3 font-medium w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-arena">
            {types.map((p) => (
              <tr key={p.id} className="bg-card hover:bg-arena/30 transition-colors">
                <td className="px-4 py-3 font-medium">{p.nombre_es}</td>
                <td className="px-4 py-3 text-muted">{p.slug}</td>
                <td className="px-4 py-3">${p.precio_mxn}</td>
                <td className="px-4 py-3">${p.precio_usd}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => handleEdit(p)} className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-terracota text-white hover:bg-terracota-dark transition-colors">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
