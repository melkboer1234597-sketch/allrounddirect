import { Link } from 'react-router-dom'
import { OrderShipments } from '@/components/order/OrderShipments'
import { OrderTimeline } from '@/components/order/OrderTimeline'
import { formatCents, formatDateTime, type OrderDetail } from '@/lib/account-api'
import type { TimelineStep } from '../../../shared/order-timeline'

function formatAddress(data: Record<string, string>) {
  const street = [data.street, data.houseNumber, data.houseAddition].filter(Boolean).join(' ').trim()
  const cityLine = `${data.postalCode ?? ''} ${data.city ?? ''}`.trim()
  return [data.name, data.company, street || data.street, cityLine, data.country]
    .filter(Boolean)
    .join('\n')
}

function paymentStatusLabel(status?: string) {
  switch ((status ?? '').toLowerCase()) {
    case 'paid':
      return 'Betaald'
    case 'failed':
      return 'Mislukt'
    case 'canceled':
    case 'cancelled':
      return 'Geannuleerd'
    case 'expired':
      return 'Verlopen'
    case 'open':
    case 'pending':
      return 'In behandeling'
    default:
      return status || 'Onbekend'
  }
}

function paymentMethodLabel(method?: string | null) {
  if (!method) return null
  const labels: Record<string, string> = {
    ideal: 'iDEAL',
    bancontact: 'Bancontact',
    creditcard: 'Creditcard',
    paypal: 'PayPal',
    banktransfer: 'Overboeking',
    klarna: 'Klarna',
    applepay: 'Apple Pay',
  }
  return labels[method.toLowerCase()] ?? method
}

type OrderDetailViewProps = {
  order: OrderDetail
  showReturnLink?: boolean
}

export function OrderDetailView({ order, showReturnLink = true }: OrderDetailViewProps) {
  const timeline = (order.timeline ?? []) as TimelineStep[]
  const method = paymentMethodLabel(order.paymentMethod)

  return (
    <div className="space-y-5">
      <header className="rounded-[12px] bg-white p-5 ring-1 ring-line">
        <h1 className="font-heading text-[26px] font-semibold text-navy">
          Bestelling {order.orderNumber}
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          {formatDateTime(order.placedAt)} · {order.statusLabel}
        </p>
        <p className="mt-1 text-[14px]">
          Betaling: {paymentStatusLabel(order.paymentStatus)}
          {method ? ` · ${method}` : ''}
        </p>
        {order.email ? <p className="mt-1 text-[14px] text-muted">{order.email}</p> : null}
      </header>

      {timeline.length ? (
        <section className="rounded-[12px] bg-white p-5 ring-1 ring-line">
          <h2 className="font-heading text-[18px] font-semibold text-navy">Voortgang</h2>
          <div className="mt-4">
            <OrderTimeline steps={timeline} />
          </div>
        </section>
      ) : null}

      <section className="rounded-[12px] bg-white p-5 ring-1 ring-line">
        <h2 className="font-heading text-[18px] font-semibold text-navy">Artikelen</h2>
        <ul className="mt-3 divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3 text-[14px]">
              <span>
                {item.name}
                <span className="block text-muted">
                  {item.quantity} × {formatCents(item.unitPriceCents, order.currency)}
                </span>
              </span>
              <span>
                {formatCents(item.lineTotalCents ?? item.quantity * item.unitPriceCents, order.currency)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 text-[14px]">
          <div className="flex justify-between">
            <dt>Subtotaal</dt>
            <dd>{formatCents(order.subtotalCents, order.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>BTW</dt>
            <dd>{formatCents(order.vatCents, order.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Verzendkosten</dt>
            <dd>{formatCents(order.shippingCents, order.currency)}</dd>
          </div>
          <div className="flex justify-between font-semibold">
            <dt>Totaal</dt>
            <dd>{formatCents(order.totalCents, order.currency)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-[12px] bg-white p-5 ring-1 ring-line">
        <h2 className="font-heading text-[18px] font-semibold text-navy">Zendingen</h2>
        <p className="mt-1 text-[13px] text-muted">
          Een bestelling kan uit meerdere zendingen bestaan.
        </p>
        <div className="mt-4">
          <OrderShipments shipments={order.shipments} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[12px] bg-white p-5 ring-1 ring-line">
          <h2 className="font-heading text-[16px] font-semibold text-navy">Afleveradres</h2>
          <p className="mt-2 whitespace-pre-line text-[14px] text-ink">
            {formatAddress(order.shipping)}
          </p>
        </div>
        <div className="rounded-[12px] bg-white p-5 ring-1 ring-line">
          <h2 className="font-heading text-[16px] font-semibold text-navy">Factuuradres</h2>
          <p className="mt-2 whitespace-pre-line text-[14px] text-ink">
            {formatAddress(order.billing)}
          </p>
        </div>
      </div>

      {showReturnLink ? (
        <p className="text-[14px]">
          <Link to="/herroepen" className="text-brand hover:underline">
            Retour of herroeping
          </Link>
          <span className="text-muted">
            {' '}
            (beschikbaar wanneer uw bestelling daarvoor in aanmerking komt)
          </span>
        </p>
      ) : null}

      <p className="text-[14px] text-muted">Factuur volgt zodra deze beschikbaar is.</p>
    </div>
  )
}
