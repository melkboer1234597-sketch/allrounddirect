import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { Container } from '@/components/ui/Container'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { useAuthSession } from '@/hooks/useAccount'
import { readGuestWishlist } from '@/lib/guest-wishlist'
import { getProductBySlug } from '@/services/catalog'
import { useQueries } from '@tanstack/react-query'

export function FavoritesPage() {
  const session = useAuthSession()
  const [guestSlugs] = useState(() => (typeof window === 'undefined' ? [] : readGuestWishlist()))
  const products = useQueries({
    queries: guestSlugs.map((slug) => ({
      queryKey: ['catalog', 'product', slug],
      queryFn: () => getProductBySlug(slug),
    })),
  })
  const found = useMemo(() => products.map((item) => item.data).filter(Boolean), [products])

  return (
    <main id="main" className="section-space">
      <SeoHead
        title="Favorieten | AllRound Direct"
        description="Tijdelijk opgeslagen producten bij AllRound Direct."
        path="/favorieten"
        robots="noindex,nofollow"
      />
      <Container>
        <h1 className="heading-display text-ink">Favorieten</h1>
        {session.data?.user ? (
          <p className="mt-2 text-[15px] text-muted">
            Accountfavorieten staan onder{' '}
            <Link to="/account/favorieten" className="text-brand underline">
              Mijn account
            </Link>
            . Lokale favorieten worden later samengevoegd.
          </p>
        ) : (
          <p className="mt-2 text-[15px] text-muted">
            Zonder account bewaren we favorieten alleen in deze browser.
          </p>
        )}
        {guestSlugs.length === 0 ? (
          <p className="mt-6 text-[15px]">
            Nog geen lokale favorieten.{' '}
            <Link to="/assortiment" className="text-brand underline">
              Naar assortiment
            </Link>
          </p>
        ) : (
          <div className="mt-6">
            <ProductGrid
              products={found.filter((product): product is NonNullable<typeof product> => Boolean(product))}
            />
          </div>
        )}
      </Container>
    </main>
  )
}
