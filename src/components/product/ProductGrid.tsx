import type { Model } from '@/types'
import ProductCard from './ProductCard'

interface Props {
  models: Model[]
  locale: string
}

export default function ProductGrid({ models, locale }: Props) {
  if (models.length === 0) {
    return (
      <p className="text-center text-muted py-12">
        No products found
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {models.map((model) => (
        <ProductCard key={model.id} model={model} locale={locale} />
      ))}
    </div>
  )
}
