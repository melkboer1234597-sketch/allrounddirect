import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { getWishlist } from '@/lib/account-api'
import { getProductBySlug } from '@/services/catalog'
import type { CatalogProduct } from '@/types/catalog'

export function AccountFavoritesPage() {
  const list = useQuery({ queryKey: ['account', 'wishlist'], queryFn: getWishlist })
  const slugs = list.data?.items.map((item) => item.productSlug) ?? []
  const productQueries = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: ['catalog', 'product', slug] as const,
      queryFn: () => getProductBySlug(slug),
      enabled: Boolean(slug),
    })),
  })
  const products = useMemo(
    () =>
      productQueries
        .map((query) => query.data)
        .filter((item): item is CatalogProduct => Boolean(item)),
    [productQueries],
  )
  const loading = list.isPending || (slugs.length > 0 && productQueries.some((q) => q.isPending))

  return (
    <>
      <SeoHead
        title="Favorieten | AllRound Direct"
        description="Opgeslagen producten in uw account."
        path="/account/favorieten"
        robots="noindex,nofollow"
      />
      {slugs.length === 0 && !loading ? (
        <div
          className="mt-2 max-w-md rounded-[12px] bg-white px-5 py-6 ring-1 ring-line sm:px-6"
          role="status"
        >
          <div
            className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-surface text-muted"
            aria-hidden
          >
            <Heart className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h1 className="font-heading text-[22px] font-semibold text-ink">Nog geen favorieten</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Bewaar producten die u later wilt bekijken.
          </p>
          <div className="mt-5">
            <Button to="/assortiment" size="sm">
              Bekijk assortiment
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="font-heading text-[26px] font-semibold text-ink">Favorieten</h1>
          <p className="mt-1.5 text-[14px] text-muted">
            Producten die u in uw account hebt bewaard.
            {slugs.length > 0 ? (
              <>
                {' '}
                Ook beschikbaar via{' '}
                <Link to="/favorieten" className="text-brand hover:underline">
                  Favorieten
                </Link>
                .
              </>
            ) : null}
          </p>
          <div className="mt-5">
            {loading ? (
              <ProductGrid products={[]} loading skeletonCount={8} />
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        </>
      )}
    </>
  )
}
