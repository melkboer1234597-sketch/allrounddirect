import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { CatalogListing } from '@/components/catalog/CatalogListing'
import { SeoHead } from '@/components/seo/SeoHead'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Container } from '@/components/ui/Container'
import { SITE } from '@/config/site'
import { findCategoryByPath, taxonomyDescendantSlugs } from '@/data/taxonomy'
import { catalogCanonicalPath, hasUncuratedFacetParams } from '@/lib/catalog-url'
import { breadcrumbListJsonLd, collectionPageJsonLd } from '@/lib/seo'
import { SEO_REDIRECTS } from '../../shared/redirects'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function CategoryPage() {
  const { subSlug, leafSlug } = useParams()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const redirect = SEO_REDIRECTS.find((item) => item.from === pathname.replace(/\/+$/, ''))
  if (redirect) return <Navigate to={redirect.to} replace />

  const isAssortiment = pathname.startsWith('/assortiment')
  const found = isAssortiment
    ? { root: undefined, child: undefined, leaf: undefined }
    : findCategoryByPath(pathname)
  const root = found.root

  if (!isAssortiment && !root) return <NotFoundPage />
  if (subSlug && !leafSlug && root && !found.child) return <NotFoundPage />
  if (leafSlug && !found.leaf) return <NotFoundPage />

  const active = found.leaf ?? found.child
  const title = active?.name ?? root?.name ?? 'Assortiment'
  const intro =
    active?.intro ?? root?.intro ?? 'Bekijk het volledige assortiment van AllRound Direct.'
  const description = active?.intro ?? root?.seoDescription ?? intro
  const schemaId = root?.filterSchema ?? 'generic'
  const body = active?.content ?? root?.content
  const childLinks = found.leaf
    ? []
    : found.child?.children?.length
      ? found.child.children.map((item) => ({
          name: item.name,
          href: `/${root!.slug}/${found.child!.slug}/${item.slug}`,
        }))
      : root
        ? root.children.map((item) => ({
            name: item.name,
            href: `/${root.slug}/${item.slug}`,
          }))
        : []

  const crumbs = [
    { label: 'Home', href: '/' },
    ...(root ? [{ label: root.name, href: found.child ? `/${root.slug}` : undefined }] : []),
    ...(found.child
      ? [
          {
            label: found.child.name,
            href: found.leaf ? `/${root!.slug}/${found.child.slug}` : undefined,
          },
        ]
      : []),
    ...(found.leaf
      ? [{ label: found.leaf.name }]
      : isAssortiment
        ? [{ label: 'Assortiment' }]
        : []),
  ]

  const filtered = hasUncuratedFacetParams(params)
  const robots = filtered ? 'noindex,follow' : 'index,follow'
  const canonical = catalogCanonicalPath(pathname, params)
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)
  const seoTitle =
    page > 1 && !filtered ? `${title} (pagina ${page}) | ${SITE.name}` : `${title} | ${SITE.name}`

  const subcategorySlugs = found.leaf
    ? [found.leaf.slug]
    : found.child
      ? taxonomyDescendantSlugs(found.child)
      : undefined

  return (
    <main id="main" className="section-space">
      <SeoHead
        title={seoTitle}
        description={description}
        path={canonical}
        robots={robots}
        extraJsonLd={[
          {
            id: 'jsonld-breadcrumb',
            data: breadcrumbListJsonLd(
              crumbs.map((item) => ({ name: item.label, path: item.href ?? pathname })),
            ),
          },
          {
            id: 'jsonld-collection',
            data: collectionPageJsonLd({ name: title, path: pathname, description }),
          },
        ]}
      />
      <Container>
        <Breadcrumbs items={crumbs} />
        <h1 className="heading-display mt-4 text-ink">{title}</h1>
        <p className="text-body mt-3 max-w-3xl text-muted">{intro}</p>
        {childLinks.length > 0 ? (
          <ul className="mt-6 flex gap-3 overflow-x-auto hide-scrollbar pb-1 md:flex-wrap md:overflow-visible">
            {childLinks.map((item) => (
              <li key={item.href} className="shrink-0">
                <Link
                  to={item.href}
                  className="inline-flex min-h-11 items-center rounded-[4px] bg-surface px-3 text-[14px] ring-1 ring-line hover:ring-brand"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-8">
          <CatalogListing
            categorySlug={root?.slug}
            subcategorySlug={found.leaf?.slug ?? found.child?.slug}
            subcategorySlugs={subcategorySlugs}
            schemaId={schemaId}
            pathname={pathname}
            emptyTitle="Geen producten gevonden"
            emptyDescription="Pas uw filters aan of bekijk een andere categorie."
          />
        </div>

        {root?.slug === 'vloeren' ? (
          <p className="mt-10 text-[15px] text-ink">
            Hulp bij de keuze? Lees{' '}
            <Link to="/advies/pvc-of-laminaat-kiezen" className="text-brand hover:underline">
              PVC of laminaat kiezen
            </Link>{' '}
            of bereken{' '}
            <Link to="/advies/hoeveel-vloer-heb-ik-nodig" className="text-brand hover:underline">
              hoeveel vloer u nodig heeft
            </Link>
            . Voor leggen:{' '}
            <Link to="/montage" className="text-brand hover:underline">
              montage via AllRoundKlussenbedrijf
            </Link>
            .
          </p>
        ) : null}

        {root?.showBusinessCta ? (
          <p className="mt-6 text-[15px] text-ink">
            Grotere aantallen of horecainkoop?{' '}
            <Link to="/zakelijk/offerte" className="text-brand hover:underline">
              Vraag een zakelijke offerte aan
            </Link>
            .
          </p>
        ) : null}

        {body ? (
          <section className="mt-14 max-w-3xl border-t border-line pt-10">
            <h2 className="heading-section text-ink">{body.heading}</h2>
            <p className="text-body mt-3 text-muted">{body.body}</p>
          </section>
        ) : null}
      </Container>
    </main>
  )
}
