/**
 * Centralized scroll helpers for ecommerce navigation.
 * Prefer these over ad-hoc window.scrollTo / magic pixel offsets.
 */

export const HEADER_SCROLL_CSS_VAR = '--app-header-offset'

/** Sticky header + topbar approximate height (CSS can refine via var). */
export function getHeaderOffset(): number {
  if (typeof window === 'undefined') return 96
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(HEADER_SCROLL_CSS_VAR)
    .trim()
  const parsed = Number.parseFloat(raw)
  if (Number.isFinite(parsed) && parsed > 0) return parsed
  // Fallback: topbar (~32) + header bar (~56–72) + mobile search row (~52)
  return window.matchMedia('(min-width: 1024px)').matches ? 112 : 140
}

export function scrollWindowTo(y: number, behavior: ScrollBehavior = 'auto') {
  const top = Math.max(0, y)
  window.scrollTo({ top, left: 0, behavior })
}

export function scrollToTop(behavior: ScrollBehavior = 'auto') {
  scrollWindowTo(0, behavior)
}

export function scrollToElement(
  element: Element | null | undefined,
  options?: { behavior?: ScrollBehavior; extraOffset?: number },
) {
  if (!element || typeof window === 'undefined') return
  const behavior = options?.behavior ?? 'auto'
  const rect = element.getBoundingClientRect()
  const y = window.scrollY + rect.top - getHeaderOffset() - (options?.extraOffset ?? 0)
  scrollWindowTo(y, behavior)
}

export function scrollToHash(hash: string, behavior: ScrollBehavior = 'smooth') {
  const id = hash.replace(/^#/, '')
  if (!id) return false
  const target = document.getElementById(id)
  if (!target) return false
  scrollToElement(target, { behavior })
  return true
}

export function focusMainContent() {
  const main =
    document.getElementById('main') ??
    document.querySelector<HTMLElement>('main') ??
    document.querySelector<HTMLElement>('[role="main"]')
  if (!main) return
  if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1')
  main.focus({ preventScroll: true })
}

/** Reference-counted body scroll lock for drawers/modals. */
let bodyLockCount = 0
let previousOverflow = ''

export function lockBodyScroll(): () => void {
  if (typeof document === 'undefined') return () => undefined
  if (bodyLockCount === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.dataset.scrollLock = '1'
  }
  bodyLockCount += 1
  let released = false
  return () => {
    if (released) return
    released = true
    bodyLockCount = Math.max(0, bodyLockCount - 1)
    if (bodyLockCount === 0) {
      document.body.style.overflow = previousOverflow
      delete document.documentElement.dataset.scrollLock
      previousOverflow = ''
    }
  }
}

export function unlockAllBodyScroll() {
  bodyLockCount = 0
  if (typeof document === 'undefined') return
  document.body.style.overflow = ''
  delete document.documentElement.dataset.scrollLock
}

/** Location keys that should restore scroll on POP. */
export type ScrollEntry = { y: number; pathname: string }

export function createScrollPositionStore(limit = 40) {
  const map = new Map<string, ScrollEntry>()
  const order: string[] = []

  return {
    save(key: string, entry: ScrollEntry) {
      if (!key) return
      if (!map.has(key)) order.push(key)
      map.set(key, entry)
      while (order.length > limit) {
        const oldest = order.shift()
        if (oldest) map.delete(oldest)
      }
    },
    get(key: string) {
      return map.get(key)
    },
    clear() {
      map.clear()
      order.length = 0
    },
  }
}

/** Same-path query updates that should NOT force document top. */
export function isCatalogQueryOnlyChange(
  prevPathname: string,
  nextPathname: string,
  prevSearch: string,
  nextSearch: string,
): boolean {
  if (prevPathname !== nextPathname) return false
  if (prevSearch === nextSearch) return false
  return true
}
