import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  secondary?: ReactNode
  className?: string
}

/**
 * Deliberate ecommerce empty state — compact, left-aligned on desktop,
 * no giant illustration or vast vertical void.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondary,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'max-w-lg rounded-[10px] border border-line bg-white px-5 py-6 sm:px-6 sm:py-7',
        className,
      )}
      role="status"
    >
      {icon ? (
        <div
          className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-surface text-muted"
          aria-hidden
        >
          {icon}
        </div>
      ) : null}
      <h2 className="font-heading text-[18px] font-semibold leading-snug text-ink sm:text-[19px]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{description}</p>
      ) : null}
      {action || secondary ? (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
          {action}
          {secondary}
        </div>
      ) : null}
    </div>
  )
}
