import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { adminFetch, formatCents } from '@/lib/admin-api'

type Dashboard = {
  cards: {
    revenueCents: number
    orders: number
    openOrders: number
    newCustomers: number
    openReturns: number
    openQuotes: number
  }
  recentOrders: Array<{
    id: string
    orderNumber: string
    placedAt: string
    totalCents: number
    statusLabel: string
    customer: string
  }>
  attention: {
    failedPayments: Array<{ orderNumber: string }>
    productsWithoutImage: Array<{ id: string; name: string }>
    productsWithoutPrice: Array<{ id: string; name: string }>
    lowOrUnknownStock: Array<{ id: string; name: string }>
    openReturns: Array<{ id: string; status: string }>
  }
  chart: Array<{ date: string; orders: number; revenueCents: number }> | null
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <section className="rounded-[8px] bg-white p-4 ring-1 ring-line">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-1 font-heading text-[22px] font-semibold text-navy">{value}</p>
    </section>
  )
}

function CatalogImportButton() {
  const ingest = useMutation({
    mutationFn: () =>
      adminFetch<{
        ok: boolean
        imported?: number
        offset?: number
        total?: number
        done?: boolean
        error?: string
      }>('/catalog-import/process', { method: 'POST', body: '{}' }),
  })
  return (
    <div className="mt-3 rounded-[8px] bg-white p-4 ring-1 ring-line">
      <p className="text-[14px] font-medium text-navy">Catalogusimport (R2 → D1)</p>
      <p className="mt-1 text-[13px] text-muted">
        Verwerkt de lokale bulkimport die als payload in bucket piccas staat. Producten blijven
        concept tot u publiceert.
      </p>
      <button
        type="button"
        className="mt-3 h-10 rounded-[4px] bg-navy px-4 text-[14px] text-white"
        onClick={() => ingest.mutate()}
        disabled={ingest.isPending}
      >
        {ingest.isPending ? 'Bezig…' : 'Verwerk importbatch'}
      </button>
      {ingest.data ? (
        <p className="mt-2 text-[13px] text-muted">{JSON.stringify(ingest.data)}</p>
      ) : null}
    </div>
  )
}

export function AdminDashboardPage() {
  const { data, isPending } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminFetch<Dashboard>('/dashboard'),
  })

  return (
    <>
      <SeoHead
        title="Dashboard | Beheer"
        description="Beheerdashboard."
        path="/scotdejewish/dashboard"
        robots="noindex,nofollow"
      />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Overzicht</h1>
      <CatalogImportButton />
      {isPending || !data ? (
        <p className="mt-4 text-muted">Laden…</p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Card label="Omzet huidige periode" value={formatCents(data.cards.revenueCents)} />
            <Card label="Bestellingen" value={String(data.cards.orders)} />
            <Card label="Openstaande bestellingen" value={String(data.cards.openOrders)} />
            <Card label="Nieuwe klanten" value={String(data.cards.newCustomers)} />
            <Card label="Open retouren" value={String(data.cards.openReturns)} />
            <Card label="Open zakelijke aanvragen" value={String(data.cards.openQuotes)} />
          </div>
          {data.chart ? (
            <section className="mt-6 rounded-[8px] bg-white p-4 ring-1 ring-line">
              <h2 className="font-heading text-[16px] font-semibold">
                Bestellingen laatste 7 dagen
              </h2>
              <ul className="mt-3 grid grid-cols-7 gap-2 text-center text-[12px]">
                {data.chart.map((day) => (
                  <li key={day.date}>
                    <p className="text-muted">{day.date.slice(5)}</p>
                    <p className="font-semibold">{day.orders}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="mt-6 rounded-[8px] bg-white p-4 ring-1 ring-line">
            <h2 className="font-heading text-[16px] font-semibold">Recente bestellingen</h2>
            {data.recentOrders.length === 0 ? (
              <p className="mt-2 text-[14px] text-muted">0</p>
            ) : (
              <ul className="mt-2 divide-y divide-line text-[14px]">
                {data.recentOrders.map((order) => (
                  <li key={order.id} className="flex justify-between py-2">
                    <Link
                      to={`/scotdejewish/orders/${order.id}`}
                      className="text-brand hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <span>
                      {order.statusLabel} · {formatCents(order.totalCents)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="mt-6 rounded-[8px] bg-white p-4 ring-1 ring-line">
            <h2 className="font-heading text-[16px] font-semibold">Aandacht vereist</h2>
            <ul className="mt-2 space-y-1 text-[14px]">
              <li>Mislukte betalingen: {data.attention.failedPayments.length}</li>
              <li>Producten zonder afbeelding: {data.attention.productsWithoutImage.length}</li>
              <li>Producten zonder prijs: {data.attention.productsWithoutPrice.length}</li>
              <li>Lage/onbekende voorraad: {data.attention.lowOrUnknownStock.length}</li>
              <li>Openstaande retouren: {data.attention.openReturns.length}</li>
            </ul>
          </section>
        </>
      )}
    </>
  )
}
