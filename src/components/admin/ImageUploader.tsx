'use client'

import { useState, useRef } from 'react'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        onChange([...images, data.url])
      } else {
        setError(data.error || 'Error al subir la imagen')
      }
    } catch {
      setError('Error de conexión al subir la imagen')
    }
    setUploading(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleAddUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    onChange([...images, url])
    setUrlInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddUrl()
    }
  }

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const handleSetPrincipal = (index: number) => {
    const newImages = [...images]
    const [selected] = newImages.splice(index, 1)
    newImages.unshift(selected)
    onChange(newImages)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-negro-suave">
        Imágenes del producto
      </label>

      <p className="text-xs text-muted">
        La primera imagen es la principal.
      </p>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-arena bg-arena/30">
              {url.startsWith('http') || url.startsWith('/') ? (
                <img
                  src={url}
                  alt={`Imagen ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ''
                    ;(e.target as HTMLImageElement).classList.add('hidden')
                    const parent = (e.target as HTMLImageElement).parentElement
                    if (parent) parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-muted text-xs p-2">Sin imagen</div>'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted/40 text-xs p-2 text-center break-all">
                  {url}
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetPrincipal(i)}
                    className="bg-card text-negro-suave text-xs px-2 py-1 rounded font-medium hover:bg-arena transition-colors"
                  >
                    ★ Principal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-terracota text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-arena rounded-xl p-6 text-center hover:border-terracota/50 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploading ? (
          <p className="text-sm text-muted">Subiendo imagen...</p>
        ) : (
          <div>
            <p className="text-sm text-muted font-medium">
              Arrastra una imagen aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted/60 mt-1">
              JPG, PNG, WebP o GIF — máximo 5MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted flex-shrink-0">O pega una URL:</span>
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://..."
            className="flex-1 px-4 py-2 text-sm rounded-xl border border-arena bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracota/50 focus:border-terracota transition-colors"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlInput.trim()}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-terracota text-white hover:bg-terracota-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}
