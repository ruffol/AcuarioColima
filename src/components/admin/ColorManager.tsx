'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { authHeaders, useAdminToast } from '@/lib/admin-helpers'

const emptyColor = {
  slug: '',
  nombre_es: '',
  nombre_en: '',
  hex_code: '',
}

export default function ColorManager() {
  const [colors, setColors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const { toast, showToast } = useAdminToast()
  const [errors, setErrors] = useState<string[]>([])
  const [form, setForm] = useState(emptyColor)

  async function loadColors() {
    const res = await fetch('/api/admin/colors', { headers: authHeaders() })
    const data = await res.json()
    setColors(data || [])
    setLoading(false)
  }

  useEffect(() => { loadColors() }, [])

  const handleSave = async () => {
    setSaving(true)
    setErrors([])
    const res = await fetch('/api/admin/colors', {
      method: editing ? 'PUT' : 'POST',
      headers: authHeaders(),
      body: JSON.stringify(editing ? { ...form, id: editing } : form),
    })
    const data = await res.json()
    if (res.ok) {
      showToast(editing ? 'Guardado' : 'Creado')
      setEditing(null)
      setForm({ ...emptyColor })
      loadColors()
    } else {
      setErrors(data.errors || ['Error al guardar'])
    }
    setSaving(false)
  }

  const handleEdit = (p: any) => {
    setEditing(p.id)
    setErrors([])
    setForm({ slug: p.slug, nombre_es: p.nombre_es, nombre_en: p.nombre_en, hex_code: p.hex_code })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar color?')) return
    await fetch('/api/admin/colors', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ id }),
    })
    loadColors()
    showToast('Color eliminado')
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
          {editing ? `Editar: ${form.nombre_es}` : 'Nuevo color'}
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
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ej: blanco" />
          <Input label="Nombre (ES)" value={form.nombre_es} onChange={(e) => setForm({ ...form, nombre_es: e.target.value })} />
          <Input label="Nombre (EN)" value={form.nombre_en} onChange={(e) => setForm({ ...form, nombre_en: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-negro-suave mb-1.5">Código Hex</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={form.hex_code || '#000000'}
                onChange={(e) => setForm({ ...form, hex_code: e.target.value })}
                className="w-10 h-10 rounded-lg border border-arena cursor-pointer"
              />
              <input
                type="text"
                value={form.hex_code}
                onChange={(e) => setForm({ ...form, hex_code: e.target.value })}
                placeholder="#FFFFFF"
                className="flex-1 px-4 py-2.5 rounded-xl border border-arena bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracota/50 focus:border-terracota transition-colors text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-arena">
          <Button onClick={handleSave} loading={saving}>Guardar</Button>
          {editing && (
            <Button variant="ghost" onClick={() => { setEditing(null); setForm({ ...emptyColor }); setErrors([]) }}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-arena">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-arena text-left text-muted text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-medium w-12"></th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Hex</th>
              <th className="px-4 py-3 font-medium w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-arena">
            {colors.map((p) => (
              <tr key={p.id} className="bg-card hover:bg-arena/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="w-8 h-8 rounded-lg border border-arena" style={{ backgroundColor: p.hex_code }} />
                </td>
                <td className="px-4 py-3 font-medium">{p.nombre_es}</td>
                <td className="px-4 py-3 text-muted">{p.slug}</td>
                <td className="px-4 py-3 text-muted font-mono text-xs">{p.hex_code}</td>
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
