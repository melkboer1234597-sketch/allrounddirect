import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react'
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
import type { CatalogQuery, FacetValue } from '@/types/catalog'
import { useFocusTrap } from '@/lib/a11y'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { scrollToElement } from '@/lib/scroll'

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
  const { pathname: routePathname } = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [draft, setDraft] = useState<CatalogQuery | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const searchKeyRef = useRef(params.toString())
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const closeSort = useCallback(() => setSortOpen(false), [])
  useFocusTrap(drawerOpen, drawerRef, closeDrawer)
  useFocusTrap(sortOpen, sortRef, closeSort)
  useBodyScrollLock(drawerOpen || sortOpen)

  useEffect(() => {
    setDrawerOpen(false)
    setSortOpen(false)
  }, [routePathname])

  useEffect(() => {
    const next = params.toString()
    if (searchKeyRef.current === next) return
    searchKeyRef.current = next
    requestAnimationFrame(() => {
      scrollToElement(resultsRef.current, { behavior: 'auto' })
    })
  }, [params])

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

  const [facetCache, setFacetCache] = useState<Record<string, FacetValue[]>>({})
  useEffect(() => {
    const next = result.data?.facets
    if (next && Object.keys(next).length > 0) setFacetCache(next)
  }, [result.data?.facets])

  const facets =
    result.data?.facets && Object.keys(result.data.facets).length > 0
      ? result.data.facets
      : facetCache

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

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === (query.sort ?? 'recommended'))?.label ??
    'Aanbevolen'

  const isPending = result.isLoading || result.isFetching
  const showProducts = result.data && result.data.total > 0 && !result.isError
  const showEmpty = result.data && result.data.total === 0 && !result.isLoading && !result.isError

  return (
    <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-10">
      <aside className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-offset,72px)+12px)]">
          <p className="mb-3 text-[13px] font-semibold tracking-wide text-ink">Filters</p>
          <FilterFields
            schemaId={schemaId}
            query={query}
            facets={facets}
            onChange={commit}
          />
        </div>
      </aside>

      <div id="catalog-results" ref={resultsRef} className="scroll-mt-header min-w-0">
        {/* Mobile controls */}
        <div className="mb-3 grid grid-cols-2 gap-2 lg:hidden">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-white text-[14px] font-medium text-ink ring-1 ring-line"
            onClick={() => setDrawerOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4 text-muted" aria-hidden />
            {activeCount > 0 ? `Filter (${activeCount})` : 'Filter'}
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-white text-[14px] font-medium text-ink ring-1 ring-line"
            onClick={() => setSortOpen(true)}
          >
            <ArrowUpDown className="h-4 w-4 text-muted" aria-hidden />
            Sorteren
          </button>
        </div>

        {/* Result header */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="text-[14px] tabular-nums text-muted">
            {result.isLoading && !result.data ? (
              <span className="inline-block h-4 w-24 animate-pulse rounded bg-surface" />
            ) : (
              <>
                <span className="font-medium text-ink">{result.data?.total ?? 0}</span> producten
              </>
            )}
          </p>
          <label className="hidden items-center gap-2 text-[14px] lg:flex">
            <span className="text-muted">Sorteren:</span>
            <select
              className="h-9 rounded-[8px] bg-white px-2.5 text-[14px] text-ink ring-1 ring-line outline-none focus:ring-brand"
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
          <p className="text-[13px] text-muted lg:hidden">
            {sortLabel}
          </p>
        </div>

        <ActiveFilters schemaId={schemaId} query={query} onChange={commit} clearHref={pathname} />

        {result.isLoading && !result.data ? <CatalogLoading /> : null}
        {result.isError ? <CatalogError onRetry={() => result.refetch()} /> : null}
        {showEmpty ? (
          <CatalogEmpty
            title={emptyTitle}
            description={emptyDescription}
            resetHref={pathname}
            secondaryHref="/assortiment"
            secondaryLabel="Bekijk assortiment"
          />
        ) : null}
        {showProducts ? (
          <>
            <ProductGrid products={result.data!.items} />
            {isPending && !result.isLoading ? (
              <p className="sr-only" aria-live="polite">
                Resultaten bijwerken
              </p>
            ) : null}
            <Pagination
              page={result.data!.page}
              pageCount={result.data!.pageCount}
              hrefFor={hrefForPage}
            />
            <PaginationRelLinks
              pathname={pathname}
              page={result.data!.page}
              pageCount={result.data!.pageCount}
              enabled={!hasUncuratedFacetParams(params)}
            />
          </>
        ) : null}
      </div>

      {/* Filter drawer */}
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
              <p id="filter-title" className="font-heading font-semibold text-ink">
                Filters
                {activeCount > 0 ? (
                  <span className="ml-2 text-[13px] font-normal text-muted">({activeCount})</span>
                ) : null}
              </p>
              <button
                type="button"
                className="h-11 px-2 text-[14px] text-muted"
                onClick={() => setDrawerOpen(false)}
              >
                Sluiten
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {draft ? (
                <FilterFields
                  schemaId={schemaId}
                  query={draft}
                  facets={facets}
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
                Toepassen
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Sort sheet */}
      {sortOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-navy/40"
            aria-label="Sorteren sluiten"
            onClick={() => setSortOpen(false)}
          />
          <div
            ref={sortRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sort-title"
            className="absolute inset-x-0 bottom-0 rounded-t-[14px] bg-white pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg"
          >
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <p id="sort-title" className="font-heading font-semibold text-ink">
                Sorteren
              </p>
              <button
                type="button"
                className="h-11 px-2 text-[14px] text-muted"
                onClick={() => setSortOpen(false)}
              >
                Sluiten
              </button>
            </div>
            <ul className="py-2">
              {SORT_OPTIONS.map((option) => {
                const active = (query.sort ?? 'recommended') === option.value
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      className={`flex h-12 w-full items-center px-4 text-left text-[15px] ${
                        active ? 'font-semibold text-brand' : 'text-ink'
                      }`}
                      onClick={() => {
                        commit({ ...query, page: 1, sort: option.value })
                        setSortOpen(false)
                      }}
                    >
                      {option.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      ) : null}

    </div>
  )
}
