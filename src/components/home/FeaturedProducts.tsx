import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { ProductCard } from '@/components/ui/ProductCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { getFeaturedProducts } from '@/services/catalog'

export function FeaturedProducts() {
  const { data: products = [] } = useQuery({
    queryKey: ['catalog', 'featured'],
    queryFn: getFeaturedProducts,
  })

  return (
    <section aria-labelledby="featured-heading" className="section-space">
      <Container>
        <SectionHeader
          titleId="featured-heading"
          title="Uitgelicht assortiment"
          action={
            <Button to="/assortiment" variant="secondary">
              Bekijk alles
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-8 md:hidden">
          <Button to="/assortiment" variant="secondary" className="w-full">
            Bekijk alles
          </Button>
        </div>
      </Container>
    </section>
  )
}
