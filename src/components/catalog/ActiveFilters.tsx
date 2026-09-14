import { X } from 'lucide-react'
import type { CatalogQuery } from '@/types/catalog'
import { FILTER_SCHEMAS } from '@/data/filter-schemas'

type ActiveFiltersProps = {
  schemaId: string
  query: CatalogQuery
  onChange: (next: CatalogQuery) => void
  clearHref: string
}

export function ActiveFilters({ schemaId, query, onChange, clearHref }: ActiveFiltersProps) {
  const schema = FILTER_SCHEMAS[schemaId] ?? FILTER_SCHEMAS.generic
  const chips: Array<{ key: string; label: string; remove: () => CatalogQuery }> = []

  if (query.priceMin != null || query.priceMax != null) {
    chips.push({
      key: 'price',
      label: `€${query.priceMin ?? 0} - €${query.priceMax ?? '…'}`,
      remove: () => ({ ...query, page: 1, priceMin: undefined, priceMax: undefined }),
    })
  }
  if (query.outlet) {
    chips.push({
      key: 'outlet',
      label: 'Outlet',
      remove: () => ({ ...query, page: 1, outlet: false }),
    })
  }
  Object.entries(query.filters ?? {}).forEach(([id, values]) => {
    const def = schema.find((item) => item.id === id)
    values.forEach((value) => {
      chips.push({
        key: `${id}-${value}`,
        label: def?.options?.find((item) => item.value === value)?.label ?? value,
        remove: () => {
          const next = { ...(query.filters ?? {}) }
          next[id] = (next[id] ?? []).filter((item) => item !== value)
          if (!next[id].length) delete next[id]
          return { ...query, page: 1, filters: next }
        },
      })
    })
  })

  if (!chips.length) return null

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="text-[13px] text-muted">Actieve filters:</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.remove())}
          className="inline-flex min-h-8 items-center gap-1 rounded-[4px] bg-surface px-2 text-[13px] text-ink ring-1 ring-line"
        >
          {chip.label}
          <X className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only">Filter verwijderen</span>
        </button>
      ))}
      <a href={clearHref} className="text-[13px] text-brand hover:underline">
        Alles wissen
      </a>
    </div>
  )
}
