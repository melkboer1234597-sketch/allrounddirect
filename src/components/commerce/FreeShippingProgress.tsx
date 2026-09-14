import { Link } from 'react-router-dom'
import { freeShippingProgress } from '../../../shared/commerce'
import { cn } from '@/lib/cn'

type FreeShippingProgressProps = {
  /** Eligible merchandise subtotal in cents (client estimate OK for UX; checkout revalidates). */
  eligibleSubtotalCents: number
  className?: string
  compact?: boolean
}

export function FreeShippingProgress({
  eligibleSubtotalCents,
  className,
  compact = false,
}: FreeShippingProgressProps) {
  if (eligibleSubtotalCents <= 0) return null
  const progress = freeShippingProgress(eligibleSubtotalCents)

  return (
    <div className={cn('rounded-[8px] bg-surface px-3 py-2.5', className)}>
      <p
        className={cn(
          'text-ink',
          compact ? 'text-[12px] leading-snug' : 'text-[13px] leading-snug',
          progress.reached && 'font-medium',
        )}
      >
        {progress.reached ? 'U profiteert van gratis verzending' : progress.message}
      </p>
      {!progress.reached ? (
        <div
          className="mt-2 h-1 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress.progress * 100)}
          aria-label="Voortgang naar gratis verzending"
        >
          <div
            className="h-full rounded-full bg-brand/80 transition-[width] duration-300"
            style={{ width: `${Math.round(progress.progress * 100)}%` }}
          />
        </div>
      ) : (
        <p className="mt-1 text-[12px] text-muted">
          <Link to="/bezorgen" className="text-brand hover:underline">
            Meer over levering
          </Link>
        </p>
      )}
    </div>
  )
}
