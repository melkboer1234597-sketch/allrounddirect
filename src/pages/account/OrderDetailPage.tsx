import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SeoHead } from '@/components/seo/SeoHead'
import { OrderDetailView } from '@/components/order/OrderDetailView'
import { getOrder } from '@/lib/account-api'

export function OrderDetailPage() {
  const { orderNumber = '' } = useParams()
  const { data, isPending, error } = useQuery({
    queryKey: ['account', 'order', orderNumber],
    queryFn: () => getOrder(orderNumber),
    enabled: Boolean(orderNumber),
  })

  return (
    <>
      <SeoHead
        title={`Bestelling ${orderNumber} | AllRound Direct`}
        description="Details van uw bestelling bij AllRound Direct."
        path={`/account/bestellingen/${orderNumber}`}
        robots="noindex,nofollow"
      />
      <p className="text-[14px]">
        <Link to="/account/bestellingen" className="text-brand hover:underline">
          Terug naar bestellingen
        </Link>
      </p>
      {isPending ? (
        <p className="mt-4 text-muted">Laden…</p>
      ) : error || !data ? (
        <p className="mt-4 text-[15px]">Deze bestelling is niet gevonden.</p>
      ) : (
        <div className="mt-4">
          <OrderDetailView order={data} />
        </div>
      )}
    </>
  )
}
