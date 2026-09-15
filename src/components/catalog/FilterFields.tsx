import { FILTER_SCHEMAS, type FilterDefinition } from '@/data/filter-schemas'
import type { CatalogQuery, FacetValue } from '@/types/catalog'
import { cn } from '@/lib/cn'

type FilterFieldsProps = {
  schemaId: string
  query: CatalogQuery
  facets: Record<string, FacetValue[]>
  onChange: (next: CatalogQuery) => void
}

function upsertEnum(
  query: CatalogQuery,
  id: string,
  value: string,
  checked: boolean,
): CatalogQuery {
  const current = query.filters?.[id] ?? []
  const nextValues = checked
    ? [...new Set([...current, value])]
    : current.filter((item) => item !== value)
  const filters = { ...query.filters, [id]: nextValues }
  if (!nextValues.length) delete filters[id]
  return { ...query, page: 1, filters }
}

function resolveEnumOptions(
  filter: FilterDefinition,
  facets: Record<string, FacetValue[]>,
  selected: string[],
): FacetValue[] {
  const facetOptions = facets[filter.id]
  if (Array.isArray(facetOptions)) {
    return facetOptions.filter(
      (option) =>
        option.count == null || option.count > 0 || selected.includes(option.value),
    )
  }
  // Facets not loaded yet — show schema options so the sidebar isn't empty flash.
  if (Object.keys(facets).length === 0 && filter.options?.length) {
    return filter.options.map((option) => ({
      value: option.value,
      label: option.label,
    }))
  }
  return []
}

function EnumFilter({
  filter,
  query,
  facets,
  onChange,
}: {
  filter: FilterDefinition
  query: CatalogQuery
  facets: Record<string, FacetValue[]>
  onChange: (next: CatalogQuery) => void
}) {
  const selected = query.filters?.[filter.id] ?? []
  const options = resolveEnumOptions(filter, facets, selected)
  if (!options.length) return null

  return (
    <div className="mt-2 space-y-0.5">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex min-h-9 cursor-pointer items-center gap-2.5 text-[14px] text-ink"
        >
          <input
            type="checkbox"
            className="h-4 w-4 shrink-0 rounded-[3px] border-line accent-brand"
            checked={selected.includes(option.value)}
            onChange={(event) =>
              onChange(upsertEnum(query, filter.id, option.value, event.target.checked))
            }
          />
          <span className="min-w-0 flex-1 leading-snug">{option.label}</span>
          {typeof option.count === 'number' ? (
            <span className="shrink-0 text-[12px] tabular-nums text-muted">{option.count}</span>
          ) : null}
        </label>
      ))}
    </div>
  )
}

export function FilterFields({ schemaId, query, facets, onChange }: FilterFieldsProps) {
  const schema = FILTER_SCHEMAS[schemaId] ?? FILTER_SCHEMAS.generic

  return (
    <div className="space-y-5">
      {schema.map((filter) => {
        if (filter.type === 'range' && filter.id === 'price') {
          return (
            <fieldset key={filter.id} className="border-b border-line pb-5">
              <legend className="text-[13px] font-semibold tracking-wide text-ink">
                {filter.label}
              </legend>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <label className="text-[12px] text-muted">
                  Van
                  <span className="mt-1 flex h-10 items-center rounded-[8px] ring-1 ring-line focus-within:ring-brand">
                    <span className="pl-2.5 text-[13px] text-muted" aria-hidden>
                      €
                    </span>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="0"
                      value={query.priceMin ?? ''}
                      onChange={(event) => {
                        const raw = event.target.value
                        const next = raw === '' ? undefined : Number(raw)
                        onChange({
                          ...query,
                          page: 1,
                          priceMin:
                            next == null || Number.isNaN(next) || next < 0 ? undefined : next,
                        })
                      }}
                      className="h-10 w-full bg-transparent px-2 text-[14px] text-ink outline-none"
                    />
                  </span>
                </label>
                <label className="text-[12px] text-muted">
                  Tot
                  <span className="mt-1 flex h-10 items-center rounded-[8px] ring-1 ring-line focus-within:ring-brand">
                    <span className="pl-2.5 text-[13px] text-muted" aria-hidden>
                      €
                    </span>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="…"
                      value={query.priceMax ?? ''}
                      onChange={(event) => {
                        const raw = event.target.value
                        const next = raw === '' ? undefined : Number(raw)
                        onChange({
                          ...query,
                          page: 1,
                          priceMax:
                            next == null || Number.isNaN(next) || next < 0 ? undefined : next,
                        })
                      }}
                      className="h-10 w-full bg-transparent px-2 text-[14px] text-ink outline-none"
                    />
                  </span>
                </label>
              </div>
            </fieldset>
          )
        }

        if (filter.type === 'boolean') {
          return (
            <label
              key={filter.id}
              className="flex min-h-9 cursor-pointer items-center gap-2.5 border-b border-line pb-5 text-[14px]"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded-[3px] accent-brand"
                checked={
                  Boolean(query.outlet) || (query.filters?.[filter.id] ?? []).includes('true')
                }
                onChange={(event) =>
                  onChange(
                    filter.id === 'outlet'
                      ? { ...query, page: 1, outlet: event.target.checked }
                      : upsertEnum(query, filter.id, 'true', event.target.checked),
                  )
                }
              />
              {filter.label}
            </label>
          )
        }

        if (filter.type === 'enum') {
          const selected = query.filters?.[filter.id] ?? []
          const options = resolveEnumOptions(filter, facets, selected)
          if (!options.length) return null

          return (
            <details key={filter.id} open className={cn('border-b border-line pb-5')}>
              <summary className="cursor-pointer list-none text-[13px] font-semibold tracking-wide text-ink [&::-webkit-details-marker]:hidden">
                {filter.label}
              </summary>
              <EnumFilter filter={filter} query={query} facets={facets} onChange={onChange} />
            </details>
          )
        }

        return null
      })}
    </div>
  )
}
