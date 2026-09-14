import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { SITE } from '@/config/site'
import { SeoHead } from '@/components/seo/SeoHead'
import { addToCart } from '@/lib/cart'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { formatProductPrice } from '@/lib/money'
import { breadcrumbListJsonLd, productJsonLd } from '@/lib/seo'
import { getProductBySlug } from '@/services/catalog'

export function ProductPage() {
  const { slug = '' } = useParams()
  const [added, setAdded] = useState(false)
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
          <p className="text-body mt-4 text-muted">
            Dit artikel staat niet (meer) in het assortiment.
          </p>
          <div className="mt-8">
            <Button to="/assortiment">Naar assortiment</Button>
          </div>
        </Container>
      </main>
    )
  }

  const image = product.images[0]
  const isDemo = 'isDemo' in product && product.isDemo === true
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: product.category, href: `/${product.categorySlug}` },
    { label: product.subcategoryName, href: product.categoryHref },
    { label: product.name },
  ]
  const liveSchema =
    !isDemo && product.price
      ? productJsonLd({
          name: product.name,
          slug: product.slug,
          description: `${product.name} in ${product.category} bij AllRound Direct.`,
          sku: product.sku,
          gtin: product.gtin,
          brand: product.brand,
          images: product.images.map((item) => item.src),
          price: product.price,
          stockStatus: product.stockStatus,
        })
      : null

  return (
    <main id="main" className="section-space">
      <SeoHead
        title={`${product.name} | ${SITE.name}`}
        description={`${product.name} in ${product.category} bij AllRound Direct.`}
        path={`/product/${product.slug}`}
        robots={isDemo ? 'noindex,nofollow' : 'index,follow'}
        image={image?.src}
        imageAlt={image?.alt}
        ogType={isDemo ? 'website' : 'product'}
        extraJsonLd={[
          {
            id: 'jsonld-breadcrumb',
            data: breadcrumbListJsonLd(
              crumbs.map((item) => ({
                name: item.label,
                path: item.href ?? `/product/${product.slug}`,
              })),
            ),
          },
          ...(liveSchema ? [{ id: 'jsonld-product', data: liveSchema }] : []),
        ]}
      />
      <Container>
        <Breadcrumbs items={crumbs} />
        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="overflow-hidden rounded-[12px] bg-surface">
            {image ? (
              <img
                src={image.src}
                alt={image.alt}
                width={image.width ?? 1200}
                height={image.height ?? 900}
                sizes="(min-width: 1024px) 50vw, 100vw"
                decoding="async"
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
                Voorbeeldproduct voor layout. Structured data en live voorraad ontbreken tot de
                catalogus live is. U kunt het artikel lokaal in de winkelwagen zetten; betalen staat
                uit.
              </p>
            ) : null}
            <p className="mt-4 text-[22px] font-semibold text-ink">{formatProductPrice(product)}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  addToCart(product)
                  setAdded(true)
                }}
              >
                In winkelwagen
              </Button>
              <Button to="/winkelwagen" variant="secondary">
                Winkelwagen
              </Button>
              <Button to={product.categoryHref} variant="ghost">
                {product.subcategoryName}
              </Button>
            </div>
            {added ? (
              <p className="mt-3 text-[14px] text-ink" role="status">
                Toegevoegd.{' '}
                <Link to="/winkelwagen" className="text-brand hover:underline">
                  Naar winkelwagen
                </Link>
              </p>
            ) : null}
            <ul className="mt-8 space-y-2 text-[15px] text-ink">
              <li>
                <Link to={`/${product.categorySlug}`} className="text-brand hover:underline">
                  Alle {product.category.toLowerCase()}
                </Link>
              </li>
              {product.categorySlug === 'vloeren' ? (
                <li>
                  <Link to="/advies/pvc-of-laminaat-kiezen" className="text-brand hover:underline">
                    Advies: PVC of laminaat kiezen
                  </Link>
                </li>
              ) : null}
              {product.categorySlug === 'meubels' ? (
                <li>
                  <Link
                    to="/advies/bank-opmeten-voor-levering"
                    className="text-brand hover:underline"
                  >
                    Advies: bank opmeten voor levering
                  </Link>
                </li>
              ) : null}
              {product.categorySlug === 'horeca' || product.isBusinessOnly ? (
                <li>
                  <Link to="/zakelijk/offerte" className="text-brand hover:underline">
                    Zakelijke offerte voor grotere aantallen
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </Container>
    </main>
  )
}
