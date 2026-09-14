const KEY = 'allround-direct.wishlist.v1'

export function readGuestWishlist(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function writeGuestWishlist(slugs: string[]) {
  localStorage.setItem(KEY, JSON.stringify([...new Set(slugs)]))
}

export function toggleGuestWishlist(slug: string): string[] {
  const current = readGuestWishlist()
  const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
  writeGuestWishlist(next)
  return next
}
