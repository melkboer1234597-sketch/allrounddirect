import { useEffect, useState } from 'react'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { getProductBySlug } from '@/services/catalog'
import type { CatalogProduct } from '@/types/catalog'
import { useQueries } from '@tanstack/react-query'

const STORAGE_KEY = 'ard-recently-viewed'
const MAX = 6

export function trackRecentlyViewed(slug: string) {
  if (typeof window === 'undefined' || !slug) return
  try {
    const current = readRecentlyViewed().filter((item) => item !== slug)
    current.unshift(slug)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(0, MAX)))
  } catch {
    /* ignore */
  }
}

export function readRecentlyViewed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const [slugs, setSlugs] = useState<string[]>([])
  useEffect(() => {
    setSlugs(readRecentlyViewed().filter((slug) => slug !== excludeSlug).slice(0, MAX))
  }, [excludeSlug])

  const queries = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: ['catalog', 'product', slug],
      queryFn: () => getProductBySlug(slug),
    })),
  })
  const products = queries
    .map((item) => item.data)
    .filter((item): item is CatalogProduct => Boolean(item))

  if (!products.length) return null

  return (
    <section aria-labelledby="recent-heading" className="mt-12 md:mt-14">
      <h2 id="recent-heading" className="font-heading text-[20px] font-semibold text-ink md:text-[22px]">
        Recent bekeken
      </h2>
      <div className="mt-4">
        <ProductGrid
          products={products.slice(0, 4)}
          className="md:grid-cols-4 xl:grid-cols-4"
        />
      </div>
    </section>
  )
}
