import { useMemo, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { SeoHead } from '@/components/seo/SeoHead'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { useAuthSession } from '@/hooks/useAccount'
import { getWishlist } from '@/lib/account-api'
import {
  readGuestWishlist,
  subscribeGuestWishlist,
} from '@/lib/guest-wishlist'
import { getProductBySlug } from '@/services/catalog'
import type { CatalogProduct } from '@/types/catalog'

const EMPTY_SLUGS: string[] = []

function useGuestWishlistSlugs() {
  return useSyncExternalStore(
    subscribeGuestWishlist,
    readGuestWishlist,
    () => EMPTY_SLUGS,
  )
}

export function FavoritesPage() {
  const session = useAuthSession()
  const loggedIn = Boolean(session.data?.user)
  const guestSlugs = useGuestWishlistSlugs()

  const accountList = useQuery({
    queryKey: ['account', 'wishlist'],
    queryFn: getWishlist,
    enabled: loggedIn,
  })

  const accountSlugs = accountList.data?.items.map((item) => item.productSlug) ?? []
  const slugs = loggedIn ? accountSlugs : guestSlugs

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

  const loading =
    (loggedIn && accountList.isPending) ||
    (slugs.length > 0 && productQueries.some((query) => query.isPending))

  return (
    <main
      id="main"
      className="page-shell flex min-h-[calc(100dvh-var(--app-header-offset))] flex-col bg-surface pb-16 md:pb-20"
    >
      <SeoHead
        title="Favorieten | AllRound Direct"
        description="Bewaarde producten bij AllRound Direct."
        path="/favorieten"
        robots="noindex,nofollow"
      />
      <Container className="flex-1">
        {slugs.length === 0 && !loading ? (
          <div className="mx-auto flex max-w-md flex-col justify-center py-10 md:min-h-[440px] md:py-14">
            <div
              className="rounded-[12px] bg-white px-5 py-7 ring-1 ring-line sm:px-7 sm:py-8"
              role="status"
            >
              <div
                className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-surface text-muted"
                aria-hidden
              >
                <Heart className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h1 className="font-heading text-[22px] font-semibold leading-snug text-ink sm:text-[24px]">
                Nog geen favorieten
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Bewaar producten die u later wilt bekijken.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
                <Button to="/assortiment" size="sm">
                  Bekijk assortiment
                </Button>
                {!loggedIn ? (
                  <Link
                    to="/account/registreren"
                    className="text-[14px] font-medium text-brand hover:underline"
                  >
                    Account aanmaken
                  </Link>
                ) : null}
              </div>
              {!loggedIn ? (
                <p className="mt-5 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">
                  Uw favorieten worden op dit apparaat bewaard. Met een account kunt u ze ook later
                  terugvinden.
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 md:mb-6">
              <h1 className="heading-page text-ink">Favorieten</h1>
              <p className="mt-1.5 text-[14px] text-muted">
                {loggedIn
                  ? 'Producten die u in uw account hebt bewaard.'
                  : 'Producten die u op dit apparaat hebt bewaard.'}
              </p>
            </div>

            {loading ? (
              <ProductGrid products={[]} loading skeletonCount={8} />
            ) : (
              <ProductGrid products={products} />
            )}
          </>
        )}
      </Container>
    </main>
  )
}
