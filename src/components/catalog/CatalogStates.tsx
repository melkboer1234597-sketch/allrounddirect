import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductGrid } from '@/components/catalog/ProductGrid'

type CatalogEmptyProps = {
  title: string
  description: string
  resetHref?: string
  resetLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
}

export function CatalogEmpty({
  title,
  description,
  resetHref,
  resetLabel = 'Filters wissen',
  secondaryHref = '/assortiment',
  secondaryLabel = 'Bekijk assortiment',
}: CatalogEmptyProps) {
  return (
    <EmptyState
      icon={<SearchX className="h-5 w-5" strokeWidth={1.75} />}
      title={title}
      description={description}
      action={
        resetHref ? (
          <Button to={resetHref} variant="secondary" size="sm">
            {resetLabel}
          </Button>
        ) : undefined
      }
      secondary={
        <Link to={secondaryHref} className="text-[14px] font-medium text-brand hover:underline">
          {secondaryLabel}
        </Link>
      }
      className="border-0 bg-transparent px-0 py-8 shadow-none sm:py-10"
    />
  )
}

export function CatalogLoading() {
  return <ProductGrid products={[]} loading skeletonCount={8} />
}

export function CatalogError({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      title="Producten konden niet worden geladen."
      description="Er ging iets mis bij het ophalen van het assortiment. Probeer het opnieuw."
      action={
        onRetry ? (
          <Button type="button" size="sm" onClick={onRetry}>
            Opnieuw proberen
          </Button>
        ) : undefined
      }
      secondary={
        <Link to="/" className="text-[14px] font-medium text-brand hover:underline">
          Naar homepage
        </Link>
      }
      className="border-0 bg-transparent px-0 py-8 shadow-none sm:py-10"
    />
  )
}
