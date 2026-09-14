import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import {
  createScrollPositionStore,
  focusMainContent,
  isCatalogQueryOnlyChange,
  scrollToHash,
  scrollToTop,
  unlockAllBodyScroll,
} from '@/lib/scroll'

const store = createScrollPositionStore()

/**
 * History-aware scroll restoration for BrowserRouter:
 * - PUSH/REPLACE to a new pathname → top (or hash target)
 * - POP (back/forward) → restore saved window scroll
 * - Same-path search-param updates → leave document scroll (catalog handles grid)
 */
export function ScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const prevRef = useRef({
    key: location.key,
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  })
  const readyRef = useRef(false)

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const previous = window.history.scrollRestoration
      window.history.scrollRestoration = 'manual'
      return () => {
        window.history.scrollRestoration = previous
      }
    }
    return undefined
  }, [])

  // Persist scroll for the active history entry.
  useEffect(() => {
    let frame = 0
    function persist() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        store.save(location.key, {
          y: window.scrollY,
          pathname: location.pathname,
        })
      })
    }
    persist()
    window.addEventListener('scroll', persist, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', persist)
      store.save(location.key, {
        y: window.scrollY,
        pathname: location.pathname,
      })
    }
  }, [location.key, location.pathname])

  useLayoutEffect(() => {
    const prev = prevRef.current
    const next = {
      key: location.key,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    }

    // Always clear sticky body locks on route changes.
    unlockAllBodyScroll()

    const queryOnly = isCatalogQueryOnlyChange(
      prev.pathname,
      next.pathname,
      prev.search,
      next.search,
    )

    if (!readyRef.current) {
      readyRef.current = true
      if (next.hash) {
        requestAnimationFrame(() => {
          if (!scrollToHash(next.hash, 'auto')) scrollToTop('auto')
        })
      }
      prevRef.current = next
      return
    }

    if (navigationType === 'POP') {
      const saved = store.get(next.key)
      const y = saved?.y ?? 0
      // Restore after layout paints; do not animate from prior page Y.
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, left: 0, behavior: 'auto' })
        if (next.hash) scrollToHash(next.hash, 'auto')
      })
      prevRef.current = next
      return
    }

    // PUSH / REPLACE
    if (queryOnly && !next.hash) {
      // Catalog filter/sort/page — listing component scrolls to grid.
      prevRef.current = next
      return
    }

    if (next.hash) {
      // Second frame allows pages (e.g. PDP tabs) to reveal hash targets.
      requestAnimationFrame(() => {
        if (scrollToHash(next.hash, 'smooth')) return
        requestAnimationFrame(() => {
          if (!scrollToHash(next.hash, 'smooth')) {
            scrollToTop('auto')
            focusMainContent()
          }
        })
      })
    } else if (prev.pathname !== next.pathname || prev.key !== next.key) {
      scrollToTop('auto')
      // Defer focus so screen readers announce new page without fighting scroll.
      requestAnimationFrame(() => focusMainContent())
    }

    prevRef.current = next
  }, [location.key, location.pathname, location.search, location.hash, navigationType])

  return null
}
