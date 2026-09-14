import { ProductCard } from '@/components/ui/ProductCard'
import type { CatalogProduct } from '@/types/catalog'

type ProductGridProps = {
  products: CatalogProduct[]
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
