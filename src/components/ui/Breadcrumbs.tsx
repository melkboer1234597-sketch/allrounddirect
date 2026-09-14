import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Kruimelpad" className={cn('text-[13px] text-muted', className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 ? <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
              {last || !item.href ? (
                <span className="truncate text-ink" aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.href} className="truncate hover:text-ink">
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
