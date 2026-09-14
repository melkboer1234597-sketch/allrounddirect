import { useEffect } from 'react'
import { canonicalUrl } from '@/config/site'

function setRel(rel: 'prev' | 'next', href: string | null) {
  const el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!href) {
    el?.remove()
    return
  }
  let link = el
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', rel)
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

/** rel=prev/next voor crawlbare paginatie. Niet gebruiken op gefilterde URL’s. */
export function PaginationRelLinks({
  pathname,
  page,
  pageCount,
  enabled,
}: {
  pathname: string
  page: number
  pageCount: number
  enabled: boolean
}) {
  useEffect(() => {
    if (!enabled || pageCount <= 1) {
      setRel('prev', null)
      setRel('next', null)
      return
    }
    const prev = page > 1 ? (page === 2 ? pathname : `${pathname}?page=${page - 1}`) : null
    const next = page < pageCount ? `${pathname}?page=${page + 1}` : null
    setRel('prev', prev ? canonicalUrl(prev) : null)
    setRel('next', next ? canonicalUrl(next) : null)
    return () => {
      setRel('prev', null)
      setRel('next', null)
    }
  }, [pathname, page, pageCount, enabled])
  return null
}
