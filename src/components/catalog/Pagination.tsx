import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type PaginationProps = {
  page: number
  pageCount: number
  hrefFor: (page: number) => string
}

export function Pagination({ page, pageCount, hrefFor }: PaginationProps) {
  if (pageCount <= 1) return null
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter((item) => {
    return item === 1 || item === pageCount || Math.abs(item - page) <= 2
  })

  return (
    <nav aria-label="Paginering" className="mt-10 flex flex-wrap items-center justify-center gap-1">
      <Link
        to={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          'inline-flex min-h-11 items-center px-3 text-[14px]',
          page === 1 && 'pointer-events-none text-muted',
        )}
      >
        Vorige
      </Link>
      {pages.map((item, index) => {
        const prev = pages[index - 1]
        return (
          <span key={item} className="flex items-center">
            {prev && item - prev > 1 ? <span className="px-1 text-muted">…</span> : null}
            <Link
              to={hrefFor(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'inline-flex h-11 min-w-11 items-center justify-center rounded-[4px] text-[14px]',
                item === page ? 'bg-navy text-white' : 'hover:bg-surface',
              )}
            >
              {item}
            </Link>
          </span>
        )
      })}
      <Link
        to={hrefFor(Math.min(pageCount, page + 1))}
        className={cn(
          'inline-flex min-h-11 items-center px-3 text-[14px]',
          page === pageCount && 'pointer-events-none text-muted',
        )}
      >
        Volgende
      </Link>
    </nav>
  )
}
