import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
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
      label: `Prijs: €${query.priceMin ?? 0}–€${query.priceMax ?? '…'}`,
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
      const optionLabel = def?.options?.find((item) => item.value === value)?.label ?? value
      chips.push({
        key: `${id}-${value}`,
        label: def?.label ? `${def.label}: ${optionLabel}` : optionLabel,
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
    <div className="mb-4 flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.remove())}
          className="inline-flex h-8 max-w-full items-center gap-1 rounded-[6px] bg-surface px-2 text-[12px] text-ink ring-1 ring-line hover:ring-navy/20"
        >
          <span className="truncate">{chip.label}</span>
          <X className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
          <span className="sr-only">Filter verwijderen</span>
        </button>
      ))}
      <Link to={clearHref} className="ml-1 text-[12px] font-medium text-brand hover:underline">
        Filters wissen
      </Link>
    </div>
  )
}
