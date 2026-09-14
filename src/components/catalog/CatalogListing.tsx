import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { ActiveFilters } from '@/components/catalog/ActiveFilters'
import { CatalogEmpty, CatalogError, CatalogLoading } from '@/components/catalog/CatalogStates'
import { FilterFields } from '@/components/catalog/FilterFields'
import { Pagination } from '@/components/catalog/Pagination'
import { PaginationRelLinks } from '@/components/seo/PaginationRelLinks'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { Button } from '@/components/ui/Button'
import { queryCatalog } from '@/services/catalog'
import {
  catalogQueryToSearchParams,
  hasUncuratedFacetParams,
  parseCatalogSearchParams,
  SORT_OPTIONS,
} from '@/lib/catalog-url'
import type { CatalogQuery } from '@/types/catalog'
import { cn } from '@/lib/cn'
import { useFocusTrap } from '@/lib/a11y'

type CatalogListingProps = {
  categorySlug?: string
  subcategorySlug?: string
  subcategorySlugs?: string[]
  schemaId: string
  pathname: string
  searchQuery?: string
  emptyTitle: string
  emptyDescription: string
}

export function CatalogListing({
  categorySlug,
  subcategorySlug,
  subcategorySlugs,
  schemaId,
  pathname,
  searchQuery,
  emptyTitle,
  emptyDescription,
}: CatalogListingProps) {
  const [params, setParams] = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draft, setDraft] = useState<CatalogQuery | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  useFocusTrap(drawerOpen, drawerRef, closeDrawer)

  const parsed = useMemo(() => parseCatalogSearchParams(params), [params])
  const query: CatalogQuery = useMemo(
    () => ({
      ...parsed,
      q: searchQuery ?? parsed.q,
      categorySlug,
      subcategorySlug,
      subcategorySlugs,
    }),
    [parsed, searchQuery, categorySlug, subcategorySlug, subcategorySlugs],
  )

  const result = useQuery({
    queryKey: ['catalog', query],
    queryFn: () => queryCatalog(query),
  })

  const activeCount =
    Object.values(query.filters ?? {}).reduce((sum, values) => sum + values.length, 0) +
    (query.priceMin != null || query.priceMax != null ? 1 : 0) +
    (query.outlet ? 1 : 0)

  function commit(next: CatalogQuery) {
    const search = catalogQueryToSearchParams({ ...next, q: searchQuery ?? next.q })
    if (searchQuery) search.set('q', searchQuery)
    setParams(search, { replace: false })
  }

  function hrefForPage(page: number) {
    const search = catalogQueryToSearchParams({ ...query, page })
    const qs = search.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  useEffect(() => {
    if (drawerOpen) setDraft(query)
  }, [drawerOpen, query])

  return (
    <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
      <aside className="hidden lg:block">
        <p className="mb-4 text-[13px] font-semibold tracking-wide text-ink uppercase">Filters</p>
        <FilterFields
          schemaId={schemaId}
          query={query}
          facets={result.data?.facets ?? {}}
          onChange={commit}
        />
      </aside>

      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-[4px] px-3 text-[14px] ring-1 ring-line lg:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Filteren
            {activeCount ? (
              <span className="rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">
                {activeCount}
              </span>
            ) : null}
          </button>
          <label className="ml-auto flex min-h-11 items-center gap-2 text-[14px]">
            <span className="text-muted">Sorteren</span>
            <select
              className="h-11 rounded-[4px] bg-white px-2 ring-1 ring-line outline-none focus:ring-brand"
              value={query.sort ?? 'recommended'}
              onChange={(event) =>
                commit({ ...query, page: 1, sort: event.target.value as CatalogQuery['sort'] })
              }
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ActiveFilters schemaId={schemaId} query={query} onChange={commit} clearHref={pathname} />

        {result.isLoading ? <CatalogLoading /> : null}
        {result.isError ? <CatalogError onRetry={() => result.refetch()} /> : null}
        {result.data && result.data.total === 0 ? (
          <CatalogEmpty title={emptyTitle} description={emptyDescription} resetHref={pathname} />
        ) : null}
        {result.data && result.data.total > 0 ? (
          <>
            <p className="mb-4 text-[14px] text-muted">{result.data.total} producten</p>
            <ProductGrid products={result.data.items} />
            <Pagination
              page={result.data.page}
              pageCount={result.data.pageCount}
              hrefFor={hrefForPage}
            />
            <PaginationRelLinks
              pathname={pathname}
              page={result.data.page}
              pageCount={result.data.pageCount}
              enabled={!hasUncuratedFacetParams(params)}
            />
          </>
        ) : null}
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-navy/40"
            aria-label="Filters sluiten"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-title"
            className="absolute inset-y-0 right-0 flex w-[min(100%,400px)] flex-col bg-white shadow-lg"
          >
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <p id="filter-title" className="font-heading font-semibold">
                Filters
              </p>
              <button type="button" className="h-11 px-2" onClick={() => setDrawerOpen(false)}>
                Sluiten
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {draft ? (
                <FilterFields
                  schemaId={schemaId}
                  query={draft}
                  facets={result.data?.facets ?? {}}
                  onChange={setDraft}
                />
              ) : null}
            </div>
            <div className="flex gap-2 border-t border-line p-4">
              <Button
                to={pathname}
                variant="secondary"
                className="flex-1"
                onClick={() => setDrawerOpen(false)}
              >
                Filters wissen
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => {
                  if (draft) commit(draft)
                  setDrawerOpen(false)
                }}
              >
                Toon {result.data?.total ?? ''} producten
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <span className={cn('sr-only')}>
        {hasUncuratedFacetParams(params) ? 'Gefilterde weergave' : ''}
      </span>
    </div>
  )
}
