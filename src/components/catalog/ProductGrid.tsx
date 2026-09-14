import { ProductCard, ProductCardSkeleton } from '@/components/ui/ProductCard'
import { cn } from '@/lib/cn'
import type { CatalogProduct } from '@/types/catalog'

type ProductGridProps = {
  products: CatalogProduct[]
  className?: string
  loading?: boolean
  skeletonCount?: number
}

export function ProductGrid({
  products,
  className,
  loading = false,
  skeletonCount = 8,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-x-3 gap-y-6 min-[360px]:grid-cols-2 md:grid-cols-3 md:gap-x-5 md:gap-y-8 xl:grid-cols-4 xl:gap-x-6',
        className,
      )}
    >
      {loading
        ? Array.from({ length: skeletonCount }, (_, index) => <ProductCardSkeleton key={index} />)
        : products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}
