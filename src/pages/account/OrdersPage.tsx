import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
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
      {isPending ? (
        <p className="mt-4 text-muted">Laden…</p>
      ) : orders.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<Package className="h-5 w-5" strokeWidth={1.75} />}
            title="Nog geen bestellingen"
            description="Als u een bestelling plaatst, ziet u die hier terug met status en details."
            action={<Button to="/assortiment" size="sm">Naar assortiment</Button>}
          />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-[10px] bg-white ring-1 ring-line">
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
        </div>
      )}
    </>
  )
}
