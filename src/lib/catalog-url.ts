import type { CatalogQuery, CatalogSort } from '@/types/catalog'

export const DEFAULT_PAGE_SIZE = 24

const SORTS: CatalogSort[] = ['recommended', 'price-asc', 'price-desc', 'newest', 'popularity']

const RESERVED = new Set(['q', 'sort', 'page', 'min', 'max', 'outlet'])

/** Querykeys die geen duizenden landings mogen worden. `page` is hier bewust uitgezonderd. */
export function hasUncuratedFacetParams(params: URLSearchParams): boolean {
  return [...params.keys()].some((key) => key !== 'page')
}

export function catalogCanonicalPath(pathname: string, params: URLSearchParams): string {
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)
  if (hasUncuratedFacetParams(params) || page <= 1) return pathname
  return `${pathname}?page=${page}`
}

export function parseCatalogSearchParams(params: URLSearchParams): CatalogQuery {
  const sortParam = params.get('sort')
  const sort = SORTS.includes(sortParam as CatalogSort) ? (sortParam as CatalogSort) : 'recommended'
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)
  const min = params.get('min')
  const max = params.get('max')
  const filters: Record<string, string[]> = {}

  params.forEach((value, key) => {
    if (RESERVED.has(key) || !value) return
    filters[key] = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  })

  return {
    q: params.get('q')?.trim() || undefined,
    sort,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    priceMin: min ? Number(min) : undefined,
    priceMax: max ? Number(max) : undefined,
    outlet: params.get('outlet') === '1',
    filters,
  }
}

export function catalogQueryToSearchParams(
  query: CatalogQuery,
  extras?: { categorySlug?: string; subcategorySlug?: string },
): URLSearchParams {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.sort && query.sort !== 'recommended') params.set('sort', query.sort)
  if (query.page && query.page > 1) params.set('page', String(query.page))
  if (query.priceMin != null) params.set('min', String(query.priceMin))
  if (query.priceMax != null) params.set('max', String(query.priceMax))
  if (query.outlet) params.set('outlet', '1')
  Object.entries(query.filters ?? {}).forEach(([key, values]) => {
    if (values.length) params.set(key, values.join(','))
  })
  void extras
  return params
}

export const SORT_OPTIONS: Array<{ value: CatalogSort; label: string }> = [
  { value: 'recommended', label: 'Aanbevolen' },
  { value: 'price-asc', label: 'Prijs laag - hoog' },
  { value: 'price-desc', label: 'Prijs hoog - laag' },
  { value: 'newest', label: 'Nieuwste' },
  { value: 'popularity', label: 'Populariteit' },
]
