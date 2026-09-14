import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { useAccount } from '@/hooks/useAccount'
import { formatCents, formatDateTime, getOrders, getWishlist } from '@/lib/account-api'

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[12px] bg-white p-5 ring-1 ring-line">
      <h2 className="font-heading text-[18px] font-semibold text-navy">{title}</h2>
      <div className="mt-3 text-[14px] text-ink">{children}</div>
    </section>
  )
}

export function OverviewPage() {
  const { user } = useAccount()
  const orders = useQuery({ queryKey: ['account', 'orders'], queryFn: getOrders })
  const wishlist = useQuery({ queryKey: ['account', 'wishlist'], queryFn: getWishlist })
  const list = orders.data?.orders ?? []
  const latest = list[0]
  const open = list.filter((item) => !['delivered', 'cancelled', 'refunded'].includes(item.status))

  return (
    <>
      <SeoHead
        title="Accountoverzicht | AllRound Direct"
        description="Overzicht van uw AllRound Direct-account."
        path="/account/overzicht"
        robots="noindex,nofollow"
      />
      <h1 className="font-heading text-[28px] font-semibold text-navy">
        Welkom terug, {user.firstName || 'klant'}.
      </h1>
      <p className="mt-1 text-[15px] text-muted">{user.email}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card title="Lopende bestellingen">
          {orders.isPending
            ? 'Laden…'
            : open.length
              ? `${open.length} openstaand`
              : 'Geen lopende bestellingen.'}
        </Card>
        <Card title="Laatste bestelling">
          {latest ? (
            <>
              <p>{latest.orderNumber}</p>
              <p className="text-muted">{formatDateTime(latest.placedAt)}</p>
              <p>{formatCents(latest.totalCents, latest.currency)}</p>
            </>
          ) : (
            'Nog geen bestellingen.'
          )}
        </Card>
        <Card title="Favorieten">
          {wishlist.isPending
            ? 'Laden…'
            : `${wishlist.data?.items.length ?? 0} opgeslagen ${
                (wishlist.data?.items.length ?? 0) === 1 ? 'product' : 'producten'
              }.`}
        </Card>
      </div>
      <section className="mt-6 rounded-[12px] bg-white p-5 ring-1 ring-line">
        <h2 className="font-heading text-[18px] font-semibold text-navy">Snelle links</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button to="/account/bestellingen" variant="secondary">
            Bestellingen bekijken
          </Button>
          <Button to="/account/adressen" variant="secondary">
            Adres wijzigen
          </Button>
          <Button to="/bestelling-volgen" variant="secondary">
            Bestelling volgen
          </Button>
          <Button to="/account/retouren" variant="secondary">
            Retour aanmelden
          </Button>
        </div>
      </section>
      {!user.emailVerified ? (
        <p className="mt-4 rounded-[8px] bg-white p-4 text-[14px] ring-1 ring-line">
          Bevestig uw e-mailadres om het account volledig te activeren.{' '}
          <Link to="/account/beveiliging" className="text-brand underline">
            Naar beveiliging
          </Link>
        </p>
      ) : null}
    </>
  )
}
