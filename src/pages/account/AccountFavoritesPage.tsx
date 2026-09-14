import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { ProductCard } from '@/components/ui/ProductCard'
import { getWishlist } from '@/lib/account-api'
import { getProductBySlug } from '@/services/catalog'
import { useQueries } from '@tanstack/react-query'

export function AccountFavoritesPage() {
  const list = useQuery({ queryKey: ['account', 'wishlist'], queryFn: getWishlist })
  const slugs = list.data?.items.map((item) => item.productSlug) ?? []
  const products = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: ['catalog', 'product', slug],
      queryFn: () => getProductBySlug(slug),
    })),
  })

  return (
    <>
      <SeoHead
        title="Favorieten | AllRound Direct"
        description="Opgeslagen producten in uw account."
        path="/account/favorieten"
        robots="noindex,nofollow"
      />
      <h1 className="font-heading text-[26px] font-semibold text-navy">Favorieten</h1>
      <p className="mt-2 text-[14px] text-muted">
        Producten die u zonder account opslaat blijven lokaal staan. Samenvoegen na inloggen volgt
        later.
      </p>
      {list.isPending ? (
        <p className="mt-4 text-muted">Laden…</p>
      ) : slugs.length === 0 ? (
        <p className="mt-4 text-[15px]">
          Nog geen favorieten.{' '}
          <Link to="/assortiment" className="text-brand underline">
            Naar assortiment
          </Link>
        </p>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((query, index) =>
            query.data ? <ProductCard key={slugs[index]} product={query.data} /> : null,
          )}
        </div>
      )}
    </>
  )
}
