'use client'

import { useState } from 'react'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('')

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
        Las imágenes deben estar en <code className="bg-arena px-1 rounded">/public/img/productos/</code>.
        La primera imagen es la principal.
      </p>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-arena bg-arena/30">
              {url.startsWith('http') || url.startsWith('/') ? (
                // eslint-disable-next-line @next/next/no-img-element
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

      <div className="flex gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pega la URL de la imagen..."
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
  )
}
