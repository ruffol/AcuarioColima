'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-negro-suave mb-4">Algo salió mal</h1>
      <p className="text-negro-suave/60 mb-8">Ocurrió un error inesperado. Intenta de nuevo.</p>
      <button
        onClick={reset}
        className="bg-terracota text-white px-6 py-3 rounded-xl font-medium hover:bg-terracota-dark transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
