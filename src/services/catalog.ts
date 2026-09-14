/**
 * Cataloguslaag. Vervang DEMO_CATALOG later door Worker/D1-calls.
 */
import { DEMO_CATALOG, SEARCH_SYNONYMS } from '@/data/demo-catalog'
import { DEMO_FEATURED_PRODUCTS } from '@/data/demo-products'
import { FILTER_SCHEMAS } from '@/data/filter-schemas'
import { apiFetch } from '@/lib/api'
import { DEFAULT_PAGE_SIZE } from '@/lib/catalog-url'
import { CATALOG_TAXONOMY } from '@/data/taxonomy'
import type {
  CatalogProduct,
  CatalogQuery,
  CatalogQueryResult,
  CatalogSort,
  FacetValue,
} from '@/types/catalog'

const USE_LIVE_API = true

function expandQuery(q: string): string[] {
  const normalized = q.toLowerCase().trim()
  const extra = SEARCH_SYNONYMS[normalized] ?? []
  return [normalized, ...extra]
}

function textBlob(product: CatalogProduct): string {
  return [
    product.name,
    product.sku,
    product.brand,
    product.category,
    product.subcategoryName,
    ...(product.synonyms ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function productPrice(product: CatalogProduct): number | null {
  return product.price?.amount ?? null
}

function matchesFilters(product: CatalogProduct, query: CatalogQuery): boolean {
  if (query.categorySlug && product.categorySlug !== query.categorySlug) return false
  if (query.subcategorySlugs?.length) {
    if (!query.subcategorySlugs.includes(product.subcategorySlug)) return false
  } else if (query.subcategorySlug && product.subcategorySlug !== query.subcategorySlug) {
    return false
  }
  if (query.outlet && !product.isOutlet) return false

  const amount = productPrice(product)
  if (query.priceMin != null && (amount == null || amount < query.priceMin)) return false
  if (query.priceMax != null && (amount == null || amount > query.priceMax)) return false

  if (query.q) {
    const terms = expandQuery(query.q)
    const blob = textBlob(product)
    if (!terms.some((term) => blob.includes(term))) return false
  }

  for (const [key, values] of Object.entries(query.filters ?? {})) {
    if (!values.length) continue
    const raw =
      key === 'brand'
        ? product.brand
        : key === 'availability'
          ? product.stockStatus
          : key === 'leadTime'
            ? product.leadTime
            : product.attributes[key]
    const asString = raw == null ? '' : String(raw)
    if (!values.includes(asString)) return false
  }

  return true
}

function sortProducts(items: CatalogProduct[], sort: CatalogSort | undefined): CatalogProduct[] {
  const copy = [...items]
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => (productPrice(a) ?? Infinity) - (productPrice(b) ?? Infinity))
    case 'price-desc':
      return copy.sort((a, b) => (productPrice(b) ?? -1) - (productPrice(a) ?? -1))
    case 'newest':
      return copy.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    case 'popularity':
      return copy.sort((a, b) => (b.rankingScore ?? 0) - (a.rankingScore ?? 0))
    default:
      return copy.sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)))
  }
}

function buildFacets(items: CatalogProduct[], schemaId: string): Record<string, FacetValue[]> {
  const schema = FILTER_SCHEMAS[schemaId] ?? FILTER_SCHEMAS.generic
  const facets: Record<string, FacetValue[]> = {}

  for (const filter of schema) {
    if (filter.type !== 'enum') continue
    const counts = new Map<string, number>()
    for (const product of items) {
      const raw =
        filter.id === 'brand'
          ? product.brand
          : filter.id === 'availability'
            ? product.stockStatus
            : filter.id === 'leadTime'
              ? product.leadTime
              : product.attributes[filter.id]
      if (raw == null || raw === '') continue
      const value = String(raw)
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
    const options = filter.options
    facets[filter.id] = [...counts.entries()]
      .map(([value, count]) => ({
        value,
        count,
        label: options?.find((item) => item.value === value)?.label ?? value,
      }))
      .sort((a, b) => b.count - a.count)
  }

  return facets
}

function liveQueryPath(query: CatalogQuery) {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.categorySlug) params.set('categorySlug', query.categorySlug)
  if (query.subcategorySlug) params.set('subcategorySlug', query.subcategorySlug)
  if (query.subcategorySlugs?.length)
    params.set('subcategorySlugs', query.subcategorySlugs.join(','))
  if (query.sort) params.set('sort', query.sort)
  if (query.page) params.set('page', String(query.page))
  if (query.pageSize) params.set('pageSize', String(Math.min(48, query.pageSize)))
  if (query.priceMin != null) params.set('priceMin', String(query.priceMin))
  if (query.priceMax != null) params.set('priceMax', String(query.priceMax))
  if (query.outlet) params.set('outlet', '1')
  return `/catalog/query?${params.toString()}`
}

export async function queryCatalog(query: CatalogQuery): Promise<CatalogQueryResult> {
  if (USE_LIVE_API) {
    try {
      return await apiFetch<CatalogQueryResult>(liveQueryPath(query))
    } catch {
      // Worker niet bereikbaar: val terug op demo tot de API live is.
    }
  }

  const filtered = DEMO_CATALOG.filter((item) => matchesFilters(item, query))
  const sorted = sortProducts(filtered, query.sort)
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE
  const page = query.page ?? 1
  const start = (page - 1) * pageSize
  const schemaId =
    CATALOG_TAXONOMY.find((item) => item.slug === query.categorySlug)?.filterSchema ?? 'generic'

  return {
    items: sorted.slice(start, start + pageSize),
    total: sorted.length,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(sorted.length / pageSize)),
    facets: buildFacets(filtered, schemaId),
  }
}

export async function getFeaturedProducts(): Promise<CatalogProduct[]> {
  if (USE_LIVE_API) {
    try {
      const live = await apiFetch<CatalogProduct[]>('/products/featured')
      if (live.length) return live
    } catch {
      /* demo fallback */
    }
  }
  const featured = DEMO_CATALOG.filter((item) => item.isFeatured).slice(0, 8)
  return featured.length ? featured : DEMO_FEATURED_PRODUCTS
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  if (USE_LIVE_API) {
    try {
      return await apiFetch<CatalogProduct>(`/products/${encodeURIComponent(slug)}`)
    } catch {
      /* demo fallback */
    }
  }
  return (
    DEMO_CATALOG.find((item) => item.slug === slug) ??
    DEMO_FEATURED_PRODUCTS.find((item) => item.slug === slug) ??
    null
  )
}

export async function suggestSearch(q: string): Promise<{
  categories: Array<{ name: string; href: string }>
  products: CatalogProduct[]
  brands: string[]
}> {
  const term = q.trim().toLowerCase()
  if (term.length < 2) return { categories: [], products: [], brands: [] }

  const categories = CATALOG_TAXONOMY.flatMap((root) => [
    { name: root.name, href: `/${root.slug}` },
    ...root.children.map((child) => ({
      name: `${child.name} in ${root.name}`,
      href: `/${root.slug}/${child.slug}`,
    })),
  ])
    .filter((item) => item.name.toLowerCase().includes(term))
    .slice(0, 5)

  if (USE_LIVE_API) {
    try {
      const live = await apiFetch<{ items: CatalogProduct[] }>(
        `/search?q=${encodeURIComponent(term)}&limit=8`,
      )
      const products = live.items.slice(0, 5)
      const brands = [...new Set(products.map((item) => item.brand).filter(Boolean) as string[])]
      return { categories, products, brands }
    } catch {
      /* demo fallback */
    }
  }

  const products = DEMO_CATALOG.filter((item) => textBlob(item).includes(term)).slice(0, 5)
  const brands = [...new Set(DEMO_CATALOG.map((item) => item.brand).filter(Boolean) as string[])]
    .filter((brand) => brand.toLowerCase().includes(term))
    .slice(0, 5)

  return { categories, products, brands }
}

export function productPath(product: Pick<CatalogProduct, 'slug'>): string {
  return `/product/${product.slug}`
}
