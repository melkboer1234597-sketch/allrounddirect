/** Publieke media-URL's. Geen r2.dev. Worker streamt objecten uit de MEDIA-binding. */

export function mediaKeyFromPath(pathname: string): string | null {
  const raw = pathname.replace(/^\/media\/?/i, '').replace(/^\/+/, '')
  if (!raw || raw.includes('..') || raw.includes('\\')) return null
  return decodeURIComponent(raw)
}

export function mediaPublicPath(key: string): string {
  return `/media/${key.replace(/^\/+/, '')}`
}

export function mediaVariantPath(key: string, variant: 'full' | 'card' | 'thumb'): string {
  return mediaPublicPath(key.replace(/\/(full|card|thumb)(\/|\.webp)/, `/${variant}$2`))
}

export function r2KeysForHash(contentHash: string) {
  const prefix = `products/by-hash/${contentHash.slice(0, 2)}/${contentHash}`
  return {
    full: `${prefix}/full.webp`,
    card: `${prefix}/card.webp`,
    thumb: `${prefix}/thumb.webp`,
  }
}
