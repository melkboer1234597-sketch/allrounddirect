import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SeoHead } from '@/components/seo/SeoHead'
import { formatCents, formatDateTime, getOrder } from '@/lib/account-api'

function AddressBlock({ title, data }: { title: string; data: Record<string, string> }) {
  return (
    <section>
      <h2 className="font-heading text-[16px] font-semibold text-navy">{title}</h2>
      <p className="mt-2 whitespace-pre-line text-[14px] text-ink">
        {[
          data.name,
          data.company,
          data.street,
          `${data.postalCode ?? ''} ${data.city ?? ''}`.trim(),
          data.country,
        ]
          .filter(Boolean)
          .join('\n')}
      </p>
    </section>
  )
}

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
        <div className="mt-4 space-y-5">
          <header className="rounded-[12px] bg-white p-5 ring-1 ring-line">
            <h1 className="font-heading text-[26px] font-semibold text-navy">
              Bestelling {data.orderNumber}
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              {formatDateTime(data.placedAt)} · {data.statusLabel}
            </p>
            {data.paymentMethod ? (
              <p className="mt-1 text-[14px]">Betaalmethode: {data.paymentMethod}</p>
            ) : null}
          </header>

          <section className="rounded-[12px] bg-white p-5 ring-1 ring-line">
            <h2 className="font-heading text-[18px] font-semibold text-navy">Artikelen</h2>
            <ul className="mt-3 divide-y divide-line">
              {data.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-3 text-[14px]">
                  <span>
                    {item.name}
                    <span className="block text-muted">
                      {item.quantity} × {formatCents(item.unitPriceCents, data.currency)}
                    </span>
                  </span>
                  <span>{formatCents(item.quantity * item.unitPriceCents, data.currency)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 text-[14px]">
              <div className="flex justify-between">
                <dt>Subtotaal</dt>
                <dd>{formatCents(data.subtotalCents, data.currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>BTW</dt>
                <dd>{formatCents(data.vatCents, data.currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Verzendkosten</dt>
                <dd>{formatCents(data.shippingCents, data.currency)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Totaal</dt>
                <dd>{formatCents(data.totalCents, data.currency)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[12px] bg-white p-5 ring-1 ring-line">
            <h2 className="font-heading text-[18px] font-semibold text-navy">Leveringen</h2>
            <p className="mt-1 text-[13px] text-muted">
              Een bestelling kan uit meerdere zendingen bestaan.
            </p>
            <ol className="mt-4 space-y-4">
              {data.shipments.length === 0 ? (
                <li className="text-[14px] text-muted">Nog geen zendingen.</li>
              ) : (
                data.shipments.map((shipment) => (
                  <li key={shipment.id} className="border-l-2 border-brand pl-4">
                    <p className="font-medium">{shipment.label}</p>
                    <p className="text-[14px]">{shipment.statusLabel}</p>
                    {shipment.supplierName ? (
                      <p className="text-[13px] text-muted">{shipment.supplierName}</p>
                    ) : null}
                    <ul className="mt-1 text-[13px] text-muted">
                      {shipment.items.map((item) => (
                        <li key={`${shipment.id}-${item.name}`}>
                          {item.name} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                    {shipment.trackingUrl ? (
                      <a
                        className="mt-1 inline-block text-[14px] text-brand underline"
                        href={shipment.trackingUrl}
                      >
                        Zending volgen
                      </a>
                    ) : null}
                  </li>
                ))
              )}
            </ol>
          </section>

          <p className="text-[14px]">
            <Link to="/herroepen" className="text-brand hover:underline">
              Overeenkomst herroepen
            </Link>
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[12px] bg-white p-5 ring-1 ring-line">
              <AddressBlock title="Factuuradres" data={data.billing} />
            </div>
            <div className="rounded-[12px] bg-white p-5 ring-1 ring-line">
              <AddressBlock title="Afleveradres" data={data.shipping} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
