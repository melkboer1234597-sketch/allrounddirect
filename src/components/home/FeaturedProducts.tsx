import { useQuery } from '@tanstack/react-query'
import { ProductCard, ProductCardSkeleton } from '@/components/ui/ProductCard'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { getFeaturedProducts } from '@/services/catalog'
import { cn } from '@/lib/cn'

export function FeaturedProducts() {
  const { data: products = [], isPending } = useQuery({
    queryKey: ['catalog', 'featured', 'home'],
    queryFn: async () => {
      const items = await getFeaturedProducts()
      return items.slice(0, 5)
    },
  })

  return (
    <section aria-labelledby="featured-heading" className="section-space">
      <Container>
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="featured-heading" className="heading-section text-ink">
            Uitgelicht assortiment
          </h2>
          <Button to="/assortiment" variant="secondary" className="hidden shrink-0 sm:inline-flex">
            Bekijk alles
          </Button>
        </div>

        {/* Mobile: horizontal snap rail · Desktop: single row (4, optionally 5 on 2xl) */}
        <div
          className={cn(
            '-mx-4 flex gap-3 overflow-x-auto px-4 pb-1',
            'snap-x snap-mandatory scroll-smooth',
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            'md:mx-0 md:grid md:grid-cols-4 md:gap-x-4 md:gap-y-0 md:overflow-visible md:px-0 md:pb-0',
            '2xl:grid-cols-5 2xl:gap-x-5',
            'md:[&>*:nth-child(n+5)]:hidden 2xl:[&>*:nth-child(n+5)]:block',
          )}
        >
          {isPending
            ? Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="w-[62%] shrink-0 snap-start min-[420px]:w-[48%] sm:w-[44%] md:w-auto md:min-w-0 md:shrink"
                >
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map((product) => (
                <div
                  key={product.id}
                  className="w-[62%] shrink-0 snap-start min-[420px]:w-[48%] sm:w-[44%] md:w-auto md:min-w-0 md:shrink"
                >
                  <ProductCard product={product} />
                </div>
              ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Button to="/assortiment" variant="secondary" className="w-full">
            Bekijk alles
          </Button>
        </div>
      </Container>
    </section>
  )
}
