import { Link } from '@/i18n/routing'

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-terracota mb-4">404</h1>
      <p className="text-lg text-negro-suave/60 mb-8">Página no encontrada</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-terracota text-white px-6 py-3 rounded-xl font-medium hover:bg-terracota-dark transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
