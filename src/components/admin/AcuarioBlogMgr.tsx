'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAdminToast } from '@/lib/admin-helpers'

interface PostForm {
  slug: string
  title_es: string
  title_en: string
  content_es: string
  content_en: string
  excerpt_es: string
  excerpt_en: string
  image: string
  tags: string[]
  author: string
  published: boolean
}

const EMPTY: PostForm = {
  slug: '', title_es: '', title_en: '',
  content_es: '', content_en: '',
  excerpt_es: '', excerpt_en: '',
  image: '', tags: [], author: '', published: false,
}

export default function AcuarioBlogMgr() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [form, setForm] = useState<PostForm>(EMPTY)
  const { toast, showToast } = useAdminToast()

  async function load() {
    const res = await fetch('/api/admin/acuario/blog')
    setPosts(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true); setErrors([])
    const res = await fetch('/api/admin/acuario/blog', {
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

  const handleEdit = (p: any) => {
    setEditing(p.id); setShowForm(true); setErrors([])
    const tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags || []
    setForm({
      slug: p.slug, title_es: p.title_es, title_en: p.title_en || '',
      content_es: p.content_es || '', content_en: p.content_en || '',
      excerpt_es: p.excerpt_es || '', excerpt_en: p.excerpt_en || '',
      image: p.image || '', tags, author: p.author || '', published: !!p.published,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar artículo?')) return
    await fetch('/api/admin/acuario/blog', {
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

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Blog ({posts.length})</h2>
        <Button onClick={() => { setEditing(null); setShowForm(true); setErrors([]); setForm({ ...EMPTY }) }} size="sm">+ Nuevo</Button>
      </div>

      {showForm && (
        <div className="bg-card border border-arena rounded-xl p-6 mb-8 space-y-4">
          <h3 className="text-lg font-semibold">{editing ? `Editar: ${form.title_es}` : 'Nuevo artículo'}</h3>

          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <ul className="list-disc list-inside text-sm text-red-600">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Input label="Título (ES)" value={form.title_es} onChange={(e) => setForm({ ...form, title_es: e.target.value })} />
            <Input label="Título (EN)" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Extracto (ES)" value={form.excerpt_es} onChange={(e) => setForm({ ...form, excerpt_es: e.target.value })} />
            <Input label="Extracto (EN)" value={form.excerpt_en} onChange={(e) => setForm({ ...form, excerpt_en: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Contenido (ES)</label>
            <textarea className="w-full px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm resize-y h-32" value={form.content_es} onChange={(e) => setForm({ ...form, content_es: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Contenido (EN)</label>
            <textarea className="w-full px-3 py-2 rounded-xl border border-arena bg-card text-foreground text-sm resize-y h-32" value={form.content_en} onChange={(e) => setForm({ ...form, content_en: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="URL de imagen" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            <Input label="Autor" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            <Input label="Tags (separadas por coma)" value={form.tags.join(', ')} onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Publicado
          </label>

          <div className="flex gap-3 pt-4 border-t border-arena">
            <Button onClick={handleSave} loading={saving}>{editing ? 'Guardar' : 'Crear'}</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); setShowForm(false); setForm({ ...EMPTY }) }}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="text-center py-12 text-muted">Sin artículos</p>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="bg-card border border-arena rounded-xl p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{p.title_es}</h3>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${p.published ? 'bg-green-50 text-green-600' : 'bg-arena text-muted'}`}>{p.published ? 'Publicado' : 'Borrador'}</span>
                </div>
                <p className="text-xs text-muted">/{p.slug}</p>
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button onClick={() => handleEdit(p)} className="text-xs px-3 py-1.5 rounded-lg bg-terracota/10 text-terracota hover:bg-terracota/20 transition-colors">Editar</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
