import { useQuery } from '@tanstack/react-query'
import { ProductCard, ProductCardSkeleton } from '@/components/ui/ProductCard'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { getFeaturedProducts } from '@/services/catalog'
import { cn } from '@/lib/cn'
import type { CatalogProduct } from '@/types/catalog'

/** Prefer cross-category variety for homepage merchandising. */
function diversifyForHome(items: CatalogProduct[], limit = 5): CatalogProduct[] {
  const byCategory = new Map<string, CatalogProduct[]>()
  for (const item of items) {
    const key = item.categorySlug || item.category || 'overig'
    const list = byCategory.get(key) ?? []
    list.push(item)
    byCategory.set(key, list)
  }

  const picked: CatalogProduct[] = []
  const keys = [...byCategory.keys()]
  let round = 0
  while (picked.length < limit && keys.some((key) => (byCategory.get(key)?.length ?? 0) > round)) {
    for (const key of keys) {
      const item = byCategory.get(key)?.[round]
      if (item) picked.push(item)
      if (picked.length >= limit) break
    }
    round += 1
  }
  return picked.length ? picked : items.slice(0, limit)
}

export function FeaturedProducts() {
  const { data: products = [], isPending } = useQuery({
    queryKey: ['catalog', 'featured', 'home', 'diverse'],
    queryFn: async () => diversifyForHome(await getFeaturedProducts(), 5),
  })

  return (
    <section aria-labelledby="featured-heading" className="section-space-tight">
      <Container>
        <div className="mb-4 flex items-end justify-between gap-4 md:mb-5">
          <h2 id="featured-heading" className="heading-section text-ink">
            Uitgelicht assortiment
          </h2>
          <Button
            to="/assortiment"
            variant="secondary"
            size="sm"
            className="hidden shrink-0 sm:inline-flex"
          >
            Alles bekijken
          </Button>
        </div>

        <div
          className={cn(
            '-mx-4 flex gap-3 overflow-x-auto px-4 pb-1',
            'snap-x snap-mandatory',
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            'md:mx-0 md:grid md:grid-cols-4 md:gap-x-4 md:overflow-visible md:px-0 md:pb-0',
            '2xl:grid-cols-5 2xl:gap-x-5',
            'md:[&>*:nth-child(n+5)]:hidden 2xl:[&>*:nth-child(n+5)]:block',
          )}
        >
          {isPending
            ? Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="w-[58%] shrink-0 snap-start min-[400px]:w-[46%] sm:w-[42%] md:w-auto md:min-w-0 md:shrink"
                >
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map((product) => (
                <div
                  key={product.id}
                  className="w-[58%] shrink-0 snap-start min-[400px]:w-[46%] sm:w-[42%] md:w-auto md:min-w-0 md:shrink"
                >
                  <ProductCard product={product} />
                </div>
              ))}
        </div>

        <div className="mt-5 sm:hidden">
          <Button to="/assortiment" variant="secondary" size="sm">
            Alles bekijken
          </Button>
        </div>
      </Container>
    </section>
  )
}
