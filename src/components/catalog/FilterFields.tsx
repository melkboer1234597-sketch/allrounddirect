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
  const options =
    (facets[filter.id]?.length
      ? facets[filter.id]
      : filter.options?.map((item) => ({ ...item, count: 0 }))) ?? []
  if (!options.length) return null

  return (
    <div className="mt-2 space-y-1.5">
      {options.map((option) => (
        <label key={option.value} className="flex min-h-11 items-center gap-2 text-[14px] text-ink">
          <input
            type="checkbox"
            className="h-4 w-4 accent-brand"
            checked={selected.includes(option.value)}
            onChange={(event) =>
              onChange(upsertEnum(query, filter.id, option.value, event.target.checked))
            }
          />
          <span className="flex-1">{option.label}</span>
          {option.count ? <span className="text-[12px] text-muted">{option.count}</span> : null}
        </label>
      ))}
    </div>
  )
}

export function FilterFields({ schemaId, query, facets, onChange }: FilterFieldsProps) {
  const schema = FILTER_SCHEMAS[schemaId] ?? FILTER_SCHEMAS.generic

  return (
    <div className="space-y-6">
      {schema.map((filter) => {
        if (filter.type === 'range' && filter.id === 'price') {
          return (
            <fieldset key={filter.id}>
              <legend className="text-[13px] font-semibold text-ink">{filter.label}</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="text-[12px] text-muted">
                  Van
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={query.priceMin ?? ''}
                    onChange={(event) =>
                      onChange({
                        ...query,
                        page: 1,
                        priceMin: event.target.value ? Number(event.target.value) : undefined,
                      })
                    }
                    className="mt-1 h-11 w-full rounded-[4px] px-2 text-[14px] text-ink ring-1 ring-line outline-none focus:ring-brand"
                  />
                </label>
                <label className="text-[12px] text-muted">
                  Tot
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={query.priceMax ?? ''}
                    onChange={(event) =>
                      onChange({
                        ...query,
                        page: 1,
                        priceMax: event.target.value ? Number(event.target.value) : undefined,
                      })
                    }
                    className="mt-1 h-11 w-full rounded-[4px] px-2 text-[14px] text-ink ring-1 ring-line outline-none focus:ring-brand"
                  />
                </label>
              </div>
            </fieldset>
          )
        }

        if (filter.type === 'boolean') {
          return (
            <label key={filter.id} className="flex min-h-11 items-center gap-2 text-[14px]">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand"
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
          return (
            <details key={filter.id} open className={cn('border-b border-line pb-4')}>
              <summary className="cursor-pointer list-none text-[13px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {filter.label}
              </summary>
              <div className="mt-2">
                <EnumFilter filter={filter} query={query} facets={facets} onChange={onChange} />
              </div>
            </details>
          )
        }

        return null
      })}
    </div>
  )
}
