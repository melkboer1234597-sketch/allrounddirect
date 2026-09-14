import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SITE } from '@/config/site'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { formatProductPrice } from '@/lib/money'
import { getProductBySlug } from '@/services/catalog'

export function ProductPage() {
  const { slug = '' } = useParams()
  const { data: product, isLoading } = useQuery({
    queryKey: ['catalog', 'product', slug],
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  })

  if (isLoading) {
    return (
      <main id="main" className="section-space">
        <SeoHead
          title={`Product | ${SITE.name}`}
          description="Productpagina van AllRound Direct."
          path={`/product/${slug}`}
          robots="noindex,nofollow"
        />
        <Container>
          <p className="text-muted">Laden…</p>
        </Container>
      </main>
    )
  }

  if (!product) {
    return (
      <main id="main" className="section-space">
        <SeoHead
          title={`Product niet gevonden | ${SITE.name}`}
          description="Dit product is niet gevonden."
          path={`/product/${slug}`}
          robots="noindex,nofollow"
        />
        <Container>
          <h1 className="heading-display text-ink">Product niet gevonden</h1>
          <p className="text-body mt-4 text-muted">Dit artikel staat niet (meer) in het assortiment.</p>
          <div className="mt-8">
            <Button to="/assortiment">Naar assortiment</Button>
          </div>
        </Container>
      </main>
    )
  }

  const image = product.images[0]
  const isDemo = 'isDemo' in product && product.isDemo === true

  return (
    <main id="main" className="section-space">
      <SeoHead
        title={`${product.name} | ${SITE.name}`}
        description={`${product.name} in ${product.category} bij AllRound Direct.`}
        path={`/product/${product.slug}`}
        robots="noindex,nofollow"
        image={image?.src}
        imageAlt={image?.alt}
      />
      <Container>
        <nav aria-label="Kruimelpad" className="text-[14px] text-muted">
          <Link to="/" className="hover:text-ink">
            Home
          </Link>
          {' / '}
          <Link to={product.categoryHref} className="hover:text-ink">
            {product.category}
          </Link>
          {' / '}
          <span className="text-ink">{product.name}</span>
        </nav>
        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="overflow-hidden rounded-[12px] bg-surface">
            {image ? (
              <img
                src={image.src}
                alt={image.alt}
                width={1200}
                height={900}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : null}
          </div>
          <div>
            <p className="text-[12px] font-medium tracking-wide text-muted uppercase">
              {product.category}
            </p>
            <h1 className="heading-display mt-2 text-ink">{product.name}</h1>
            {isDemo ? (
              <p className="mt-3 text-[14px] text-muted">
                Voorbeeldproduct voor layout. Geen live voorraad of bestelactie.
              </p>
            ) : null}
            <p className="mt-4 text-[22px] font-semibold text-ink">{formatProductPrice(product)}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/winkelwagen" variant="primary">
                Naar winkelwagen
              </Button>
              <Button to={product.categoryHref} variant="secondary">
                {product.category}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}
