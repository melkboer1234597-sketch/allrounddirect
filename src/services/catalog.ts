/**
 * Cataloguslaag. Vervang de implementatie later door Worker/D1-calls.
 * Geen secrets, geen Mollie-sleutels.
 */
import { DEMO_FEATURED_PRODUCTS } from '@/data/demo-products'
import { apiFetch } from '@/lib/api'
import type { CatalogProduct } from '@/types/catalog'

const USE_LIVE_API = false

export async function getFeaturedProducts(): Promise<CatalogProduct[]> {
  if (USE_LIVE_API) {
    return apiFetch<CatalogProduct[]>('/products/featured')
  }
  return DEMO_FEATURED_PRODUCTS
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  if (USE_LIVE_API) {
    try {
      return await apiFetch<CatalogProduct>(`/products/${slug}`)
    } catch {
      return null
    }
  }
  return DEMO_FEATURED_PRODUCTS.find((item) => item.slug === slug) ?? null
}

export function productPath(product: Pick<CatalogProduct, 'slug'>): string {
  return `/product/${product.slug}`
}
