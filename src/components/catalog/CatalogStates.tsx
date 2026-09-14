import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

type CatalogEmptyProps = {
  title: string
  description: string
  resetHref?: string
  resetLabel?: string
}

export function CatalogEmpty({
  title,
  description,
  resetHref,
  resetLabel = 'Filters wissen',
}: CatalogEmptyProps) {
  return (
    <div className="rounded-[8px] border border-line px-5 py-10 text-center">
      <p className="font-heading text-[18px] font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">{description}</p>
      {resetHref ? (
        <div className="mt-6">
          <Button to={resetHref} variant="secondary">
            {resetLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function CatalogLoading() {
  return (
    <div
      className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[4/3] rounded-[12px] bg-surface" />
          <div className="mt-3 h-3 w-1/3 rounded bg-surface" />
          <div className="mt-2 h-4 w-2/3 rounded bg-surface" />
        </div>
      ))}
      <span className="sr-only">Producten laden</span>
    </div>
  )
}

export function CatalogError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="rounded-[8px] border border-line px-5 py-10 text-center">
      <p className="font-heading text-[18px] font-semibold text-ink">
        Assortiment tijdelijk niet beschikbaar
      </p>
      <p className="mt-2 text-[15px] text-muted">
        Probeer het later opnieuw of ga naar de homepage.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 items-center rounded-[4px] bg-brand px-5 text-[15px] font-medium text-white"
          >
            Opnieuw proberen
          </button>
        ) : null}
        <Link
          to="/"
          className="inline-flex min-h-11 items-center px-3 text-[15px] text-brand hover:underline"
        >
          Naar homepage
        </Link>
      </div>
    </div>
  )
}
