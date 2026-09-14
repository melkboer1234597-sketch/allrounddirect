import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SITE } from '@/config/site'
import { SeoHead } from '@/components/seo/SeoHead'
import { ProductGallery } from '@/components/product/ProductGallery'
import { FlooringPackCalculator } from '@/components/product/FlooringPackCalculator'
import { ProductVariantSelectors } from '@/components/product/ProductVariantSelectors'
import { RecentlyViewed, trackRecentlyViewed } from '@/components/product/RecentlyViewed'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { addToCart } from '@/lib/cart'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { formatMoney, formatProductPrice } from '@/lib/money'
import {
  flooringPackCoverage,
  presentationForProduct,
  resolveAllSpecs,
  resolveKeySpecs,
  resolveVariantSlots,
  type ProductVariantOption,
} from '@/lib/product-presentation'
import { breadcrumbListJsonLd, productJsonLd } from '@/lib/seo'
import { getProductBySlug, getRelatedProducts } from '@/services/catalog'
import { WishlistButton } from '@/components/account/WishlistButton'
import { cn } from '@/lib/cn'
import {
  deliveryLabelFull,
  freeShippingThresholdLabel,
  qualifiesForFreeShipping,
} from '../../shared/commerce'
import { eurosToCents } from '../../shared/money'

function stockCopy(product: {
  stockStatus?: string
}): { title: string; detail?: string } | null {
  if (product.stockStatus === 'out_of_stock') return { title: 'Niet op voorraad' }
  if (product.stockStatus === 'in_stock') return { title: 'Op voorraad' }
  return null
}

export function ProductPage() {
  const { slug = '' } = useParams()
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)
  const [openSection, setOpenSection] = useState<'desc' | 'specs' | 'delivery'>('desc')
  const [sticky, setSticky] = useState(false)
  const [variantSelection, setVariantSelection] = useState<Record<string, string>>({})
  const ctaRef = useRef<HTMLDivElement>(null)

  const { data: product, isLoading } = useQuery({
    queryKey: ['catalog', 'product', slug],
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  })
  const related = useQuery({
    queryKey: ['catalog', 'related', slug],
    queryFn: () => getRelatedProducts(slug),
    enabled: Boolean(slug && product),
  })

  useEffect(() => {
    if (product?.slug) trackRecentlyViewed(product.slug)
  }, [product?.slug])

  useEffect(() => {
    const node = ctaRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setSticky(!entry.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [product?.id])

  const crumbs = useMemo(() => {
    if (!product) return []
    return [
      { label: 'Home', href: '/' },
      { label: product.category, href: `/${product.categorySlug}` },
      { label: product.subcategoryName, href: product.categoryHref },
      { label: product.name },
    ]
  }, [product])

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
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="aspect-[4/3] animate-pulse rounded-[12px] bg-surface" />
            <div className="space-y-3">
              <div className="h-4 w-24 rounded bg-surface" />
              <div className="h-8 w-4/5 rounded bg-surface" />
              <div className="h-7 w-32 rounded bg-surface" />
            </div>
          </div>
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

  const presentation = presentationForProduct(product)
  const image = product.images[0]
  const isDemo = 'isDemo' in product && product.isDemo === true
  const showPrice = Boolean(product.price) && product.priceLabel !== 'Prijs op aanvraag'
  const stock = stockCopy(product)
  const deliveryFull = deliveryLabelFull()
  const productCents =
    showPrice && product.price ? eurosToCents(product.price.amount) : 0
  const freeShipLabel = qualifiesForFreeShipping(productCents)
    ? 'Gratis verzending'
    : freeShippingThresholdLabel()

  const keySpecs = resolveKeySpecs(product, presentation)
  const allSpecs = resolveAllSpecs(product, presentation)
  const packCoverage = flooringPackCoverage(product)
  const variants = (product as { variants?: ProductVariantOption[] }).variants
  const variantSlots = resolveVariantSlots(product, variants, presentation)
  const showCart = presentation.cta.mode === 'cart' || presentation.cta.mode === 'cart_and_quote'
  const showQuote =
    presentation.cta.mode === 'quote' ||
    presentation.cta.mode === 'cart_and_quote' ||
    product.isBusinessOnly
  const quoteProminent = Boolean(presentation.cta.quoteProminent) || Boolean(product.isBusinessOnly)
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

  function add() {
    for (let i = 0; i < qty; i += 1) addToCart(product!)
    setAdded(true)
  }

  return (
    <main id="main" className="pb-24 md:pb-0">
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
      <Container className="pt-4 md:pt-6 lg:pt-8">
        <Breadcrumbs
          items={crumbs.map((item, index) =>
            index === crumbs.length - 1
              ? { ...item, label: item.label.length > 42 ? `${item.label.slice(0, 40)}…` : item.label }
              : item,
          )}
        />

        <div className="mt-5 grid items-start gap-8 lg:mt-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10 xl:gap-14">
          <ProductGallery images={product.images} productName={product.name} />

          <div>
            {product.brand ? (
              <p className="text-[13px] font-medium tracking-wide text-muted uppercase">
                {product.brand}
              </p>
            ) : (
              <p className="text-[13px] font-medium tracking-wide text-muted uppercase">
                {product.category}
              </p>
            )}
            <h1 className="mt-2 font-heading text-[clamp(1.5rem,2vw,2rem)] leading-[1.25] font-semibold break-words text-ink">
              {product.name}
            </h1>
            {(product.sku || product.subcategoryName) && (
              <p className="mt-2 text-[13px] text-muted">
                {product.sku ? `SKU ${product.sku}` : null}
                {product.sku && product.subcategoryName ? ' · ' : null}
                {product.subcategoryName}
              </p>
            )}

            <p className="mt-5 text-[clamp(1.5rem,2vw,1.875rem)] font-semibold tracking-tight text-ink">
              {showPrice && product.price ? formatMoney(product.price) : formatProductPrice(product)}
              {showPrice && product.compareAtPrice ? (
                <span className="ml-3 text-[16px] font-normal text-muted line-through">
                  {formatMoney(product.compareAtPrice)}
                </span>
              ) : null}
            </p>
            {showPrice ? (
              <p className="mt-1 text-[13px] text-muted">
                Prijs incl. btw
                {product.price?.per === 'm2' ? ' · per m²' : null}
              </p>
            ) : null}

            <div className="mt-5 space-y-2 rounded-[8px] bg-surface px-4 py-3">
              <p className="text-[14px] font-medium text-ink">{deliveryFull}</p>
              <p className="text-[13px] text-muted">{freeShipLabel}</p>
              {stock ? (
                <p className="text-[13px] text-muted">{stock.title}</p>
              ) : null}
            </div>

            {keySpecs.length ? (
              <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-line pt-5 sm:grid-cols-2">
                {keySpecs.map((spec) => (
                  <div key={spec.id} className="min-w-0">
                    <dt className="text-[12px] text-muted">{spec.label}</dt>
                    <dd className="truncate text-[14px] text-ink">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <ProductVariantSelectors
              slots={variantSlots}
              selected={variantSelection}
              onChange={(slot, value) =>
                setVariantSelection((prev) => ({ ...prev, [slot]: value }))
              }
            />

            {packCoverage != null ? (
              <FlooringPackCalculator
                packCoverageM2={packCoverage}
                unitPrice={showPrice ? product.price : null}
                onPacksChange={setQty}
              />
            ) : null}

            <div ref={ctaRef} className="mt-6 flex flex-wrap items-center gap-3">
              {showCart ? (
                <>
                  <label className="sr-only" htmlFor="product-qty">
                    Aantal
                  </label>
                  <input
                    id="product-qty"
                    type="number"
                    min={1}
                    max={99}
                    value={qty}
                    onChange={(event) =>
                      setQty(Math.max(1, Math.min(99, Number(event.target.value) || 1)))
                    }
                    className="h-12 w-16 rounded-[4px] border border-line px-2 text-center text-[15px]"
                  />
                  <Button
                    type="button"
                    variant={quoteProminent ? 'secondary' : 'primary'}
                    className="h-12 min-w-[180px] flex-1 sm:flex-none"
                    onClick={add}
                  >
                    In winkelwagen
                  </Button>
                </>
              ) : null}
              {showQuote ? (
                <Button
                  to="/zakelijk/offerte"
                  variant={quoteProminent || !showCart ? 'primary' : 'secondary'}
                  className="h-12 min-w-[160px] flex-1 sm:flex-none"
                >
                  Offerte aanvragen
                </Button>
              ) : null}
              <div className="relative h-12 w-12 shrink-0">
                <WishlistButton
                  slug={product.slug}
                  name={product.name}
                  className="top-1 right-1"
                />
              </div>
            </div>
            {added ? (
              <p className="mt-3 text-[14px] text-ink" role="status">
                Toegevoegd aan winkelwagen.{' '}
                <Link to="/winkelwagen" className="text-brand hover:underline">
                  Bekijken
                </Link>
              </p>
            ) : null}

            <ul className="mt-6 space-y-1.5 text-[13px] text-muted">
              <li>{deliveryFull}</li>
              <li>{freeShipLabel}</li>
              <li>Bezorging op het afleveradres in Nederland en België</li>
              {presentation.serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-brand hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 max-w-[820px] md:mt-16">
          <div className="flex flex-wrap gap-2 border-b border-line">
            {(
              [
                ['desc', 'Productomschrijving'],
                ['specs', 'Specificaties'],
                ['delivery', 'Levering & retour'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setOpenSection(id)}
                className={cn(
                  'border-b-2 px-3 py-3 text-[14px] font-medium',
                  openSection === id
                    ? 'border-brand text-ink'
                    : 'border-transparent text-muted hover:text-ink',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="py-6">
            {openSection === 'desc' ? (
              <div className="space-y-4 text-[15px] leading-relaxed text-ink/85">
                {product.description || product.shortDescription ? (
                  <p>{product.description || product.shortDescription}</p>
                ) : (
                  <p className="text-muted">Nog geen omschrijving beschikbaar.</p>
                )}
              </div>
            ) : null}
            {openSection === 'specs' ? (
              allSpecs.length ? (
                <table className="w-full text-left text-[14px]">
                  <tbody>
                    {allSpecs.map((spec, index) => (
                      <tr key={`${spec.id}-${spec.label}`} className={index % 2 === 0 ? 'bg-surface' : undefined}>
                        <th className="w-[40%] px-3 py-2.5 font-medium text-muted">{spec.label}</th>
                        <td className="px-3 py-2.5 text-ink">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-[15px] text-muted">Nog geen specificaties beschikbaar.</p>
              )
            ) : null}
            {openSection === 'delivery' ? (
              <div className="space-y-3 text-[15px] leading-relaxed text-ink/85">
                <p>
                  {deliveryFull}. Wij leveren bestellingen in Nederland en België op het opgegeven
                  afleveradres.
                </p>
                <p>{freeShippingThresholdLabel()}.</p>
                <p>
                  Afhankelijk van het product en de logistiek kan een bestelling in meerdere
                  zendingen aankomen. Montage is niet standaard inbegrepen.
                </p>
                <p>
                  <Link to="/bezorgen" className="text-brand hover:underline">
                    Meer over levering
                  </Link>
                  {' · '}
                  <Link to="/retourneren" className="text-brand hover:underline">
                    Retourneren
                  </Link>
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {presentation.serviceLinks.some((link) => link.href === '/montage') ? (
          <section className="mt-10 rounded-[12px] bg-surface px-5 py-6 md:px-8">
            <h2 className="font-heading text-[20px] font-semibold text-ink">Vloer laten leggen?</h2>
            <p className="mt-2 max-w-2xl text-[15px] text-muted">
              Voor montage kunnen wij u doorverwijzen naar AllRoundKlussenbedrijf.
            </p>
            <div className="mt-4">
              <Button to="/montage" variant="secondary">
                Montage aanvragen
              </Button>
            </div>
          </section>
        ) : null}

        {(related.data?.length ?? 0) > 0 ? (
          <section aria-labelledby="related-heading" className="mt-12 md:mt-16">
            <h2 id="related-heading" className="heading-section text-ink">
              Vergelijkbare producten
            </h2>
            <div className="mt-5">
              <ProductGrid products={related.data ?? []} />
            </div>
          </section>
        ) : null}

        <RecentlyViewed excludeSlug={product.slug} />
      </Container>

      {sticky && showCart ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] text-muted">{product.brand ?? product.category}</p>
              <p className="text-[16px] font-semibold text-ink">
                {showPrice && product.price ? formatMoney(product.price) : formatProductPrice(product)}
              </p>
            </div>
            <Button type="button" variant="primary" className="h-11 shrink-0" onClick={add}>
              In winkelwagen
            </Button>
          </div>
        </div>
      ) : null}
      {sticky && !showCart && showQuote ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] text-muted">{product.brand ?? product.category}</p>
              <p className="text-[16px] font-semibold text-ink">Offerte op maat</p>
            </div>
            <Button to="/zakelijk/offerte" variant="primary" className="h-11 shrink-0">
              Offerte aanvragen
            </Button>
          </div>
        </div>
      ) : null}
    </main>
  )
}
