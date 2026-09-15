const KEY = 'allround-direct.wishlist.v1'
const EVENT = 'allround-wishlist-change'
const EMPTY: string[] = []

let cachedRaw: string | null | undefined
let cachedSlugs: string[] = EMPTY

function emit() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT))
  }
}

export function readGuestWishlist(): string[] {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === cachedRaw) return cachedSlugs
    cachedRaw = raw
    if (!raw) {
      cachedSlugs = EMPTY
      return cachedSlugs
    }
    const parsed = JSON.parse(raw) as unknown
    cachedSlugs = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : EMPTY
    return cachedSlugs
  } catch {
    cachedSlugs = EMPTY
    return EMPTY
  }
}

export function writeGuestWishlist(slugs: string[]) {
  const next = [...new Set(slugs)]
  const raw = JSON.stringify(next)
  localStorage.setItem(KEY, raw)
  cachedRaw = raw
  cachedSlugs = next
  emit()
}

export function toggleGuestWishlist(slug: string): string[] {
  const current = readGuestWishlist()
  const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
  writeGuestWishlist(next)
  return next
}

export function subscribeGuestWishlist(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}
