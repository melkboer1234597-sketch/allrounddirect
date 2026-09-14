import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SeoHead } from '@/components/seo/SeoHead'
import { formatCents, formatDateTime, getOrders } from '@/lib/account-api'

export function OrdersPage() {
  const { data, isPending } = useQuery({ queryKey: ['account', 'orders'], queryFn: getOrders })
  const orders = data?.orders ?? []

  return (
    <>
      <SeoHead
        title="Bestellingen | AllRound Direct"
        description="Uw bestellingen bij AllRound Direct."
        path="/account/bestellingen"
        robots="noindex,nofollow"
      />
      <h1 className="font-heading text-[26px] font-semibold text-navy">Bestellingen</h1>
      <div className="mt-4 overflow-x-auto rounded-[12px] bg-white ring-1 ring-line">
        {isPending ? (
          <p className="p-5 text-muted">Laden…</p>
        ) : orders.length === 0 ? (
          <p className="p-5 text-[15px] text-muted">U heeft nog geen bestellingen.</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead className="border-b border-line bg-surface text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Ordernummer</th>
                <th className="px-4 py-3 font-medium">Datum</th>
                <th className="px-4 py-3 font-medium">Totaal</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Artikelen</th>
                <th className="px-4 py-3 font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderNumber} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">{formatDateTime(order.placedAt)}</td>
                  <td className="px-4 py-3">{formatCents(order.totalCents, order.currency)}</td>
                  <td className="px-4 py-3">{order.statusLabel}</td>
                  <td className="px-4 py-3">{order.itemCount}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/account/bestellingen/${encodeURIComponent(order.orderNumber)}`}
                      className="text-brand hover:underline"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
