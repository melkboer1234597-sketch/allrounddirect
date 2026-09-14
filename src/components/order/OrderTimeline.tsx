import { formatDateTime } from '@/lib/account-api'
import { cn } from '@/lib/cn'
import type { TimelineStep } from '../../../shared/order-timeline'

type OrderTimelineProps = {
  steps: TimelineStep[]
  className?: string
}

export function OrderTimeline({ steps, className }: OrderTimelineProps) {
  if (!steps.length) return null
  return (
    <ol className={cn('space-y-0', className)}>
      {steps.map((step, index) => {
        const last = index === steps.length - 1
        return (
          <li key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'mt-0.5 flex h-3 w-3 shrink-0 rounded-full',
                  step.reached ? 'bg-brand' : 'bg-line',
                )}
                aria-hidden
              />
              {!last ? <span className="my-1 w-px flex-1 bg-line" aria-hidden /> : null}
            </div>
            <div className={cn('min-w-0 pb-4', last && 'pb-0')}>
              <p className="text-[14px] font-medium text-ink">{step.label}</p>
              {step.at ? (
                <p className="mt-0.5 text-[12px] text-muted">{formatDateTime(step.at)}</p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
