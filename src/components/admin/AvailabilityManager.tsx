'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { authHeaders, useAdminToast } from '@/lib/admin-helpers'

export default function AvailabilityManager() {
  const [models, setModels] = useState<any[]>([])
  const [types, setTypes] = useState<any[]>([])
  const [availability, setAvailability] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast, showToast } = useAdminToast()
  const [errors, setErrors] = useState<string[]>([])
  const [form, setForm] = useState({ model_id: 0, product_type_id: 0, stock: 0 })

  async function loadAll() {
    const [mRes, tRes, aRes] = await Promise.all([
      fetch('/api/admin/models', { headers: authHeaders() }),
      fetch('/api/admin/product-types', { headers: authHeaders() }),
      fetch('/api/admin/availability', { headers: authHeaders() }),
    ])
    setModels(await mRes.json() || [])
    setTypes(await tRes.json() || [])
    setAvailability(await aRes.json() || [])
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  const handleSave = async () => {
    if (!form.model_id || !form.product_type_id) {
      setErrors(['Selecciona modelo y tipo'])
      return
    }
    setSaving(true)
    setErrors([])
    const res = await fetch('/api/admin/availability', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      showToast('Stock actualizado')
      setForm({ model_id: 0, product_type_id: 0, stock: 0 })
      loadAll()
    } else {
      setErrors(data.errors || ['Error al guardar'])
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar disponibilidad?')) return
    await fetch('/api/admin/availability', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ id }),
    })
    loadAll()
    showToast('Disponibilidad eliminada')
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
        <h2 className="text-xl font-semibold mb-6">Gestionar stock</h2>

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Errores:</p>
            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300 space-y-0.5">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-negro-suave mb-1.5">Modelo</label>
            <select
              value={form.model_id}
              onChange={(e) => setForm({ ...form, model_id: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl border border-arena bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-terracota/50 focus:border-terracota transition-colors text-sm"
            >
              <option value={0}>Seleccionar modelo...</option>
              {models.map((m: any) => (
                <option key={m.id} value={m.id}>{m.nombre_es}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-negro-suave mb-1.5">Tipo de producto</label>
            <select
              value={form.product_type_id}
              onChange={(e) => setForm({ ...form, product_type_id: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl border border-arena bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-terracota/50 focus:border-terracota transition-colors text-sm"
            >
              <option value={0}>Seleccionar tipo...</option>
              {types.map((t: any) => (
                <option key={t.id} value={t.id}>{t.nombre_es}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-negro-suave mb-1.5">Stock</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl border border-arena bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracota/50 focus:border-terracota transition-colors text-sm"
              min={0}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-arena">
          <Button onClick={handleSave} loading={saving}>Guardar stock</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-arena">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-arena text-left text-muted text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Modelo</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-arena">
            {availability.map((a: any) => {
              const model = models.find((m: any) => m.id === a.model_id)
              const type = types.find((t: any) => t.id === a.product_type_id)
              return (
                <tr key={a.id} className="bg-card hover:bg-arena/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{model?.nombre_es || `ID: ${a.model_id}`}</td>
                  <td className="px-4 py-3 text-muted">{type?.nombre_es || a.type_nombre_es || `ID: ${a.product_type_id}`}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 ${a.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${a.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      {a.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
