import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SeoHead } from '@/components/seo/SeoHead'
import { TextField } from '@/components/account/Fields'
import { Button } from '@/components/ui/Button'
import { adminFetch, formatCents } from '@/lib/admin-api'
import { ApiError } from '@/lib/api'
import { ORDER_STATUS_LABELS, type OrderStatus } from '../../../shared/order-status'

function Head({ title, path }: { title: string; path: string }) {
  return (
    <SeoHead
      title={`${title} | Beheer`}
      description={title}
      path={path}
      robots="noindex,nofollow"
    />
  )
}

export function AdminOrdersPage() {
  const { data } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () =>
      adminFetch<{
        orders: Array<{
          id: string
          orderNumber: string
          customer: string
          placedAt: string
          paymentStatus: string
          statusLabel: string
          totalCents: number
        }>
      }>('/orders'),
  })
  return (
    <>
      <Head title="Bestellingen" path="/scotdejewish/orders" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Bestellingen</h1>
      <div className="mt-4 overflow-x-auto rounded-[8px] bg-white ring-1 ring-line">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-3 py-2">Nummer</th>
              <th className="px-3 py-2">Klant</th>
              <th className="px-3 py-2">Datum</th>
              <th className="px-3 py-2">Betaling</th>
              <th className="px-3 py-2">Fulfilment</th>
              <th className="px-3 py-2">Totaal</th>
            </tr>
          </thead>
          <tbody>
            {(data?.orders ?? []).length === 0 ? (
              <tr>
                <td className="px-3 py-4" colSpan={6}>
                  0
                </td>
              </tr>
            ) : (
              data?.orders.map((order) => (
                <tr key={order.id} className="border-t border-line">
                  <td className="px-3 py-2">
                    <Link
                      className="text-brand hover:underline"
                      to={`/scotdejewish/orders/${order.id}`}
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{order.customer}</td>
                  <td className="px-3 py-2">{new Date(order.placedAt).toLocaleString('nl-NL')}</td>
                  <td className="px-3 py-2">{order.paymentStatus}</td>
                  <td className="px-3 py-2">{order.statusLabel}</td>
                  <td className="px-3 py-2">{formatCents(order.totalCents)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function AdminOrderDetailPage() {
  const { id = '' } = useParams()
  const client = useQueryClient()
  const { data } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => adminFetch<Record<string, unknown>>(`/orders/${id}`),
    enabled: Boolean(id),
  })
  const [refundMode, setRefundMode] = useState<'full' | 'partial'>('full')
  const [partialEuros, setPartialEuros] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [confirmStep, setConfirmStep] = useState(false)
  const [idempotencyKey, setIdempotencyKey] = useState('')
  const [refundBusy, setRefundBusy] = useState(false)
  const [refundError, setRefundError] = useState('')
  const [refundOk, setRefundOk] = useState('')

  const order = data?.order as
    | {
        id: string
        orderNumber: string
        status: string
        statusLabel: string
        paymentStatus: string
        paymentMethod?: string | null
        molliePaymentId: string | null
        guestEmail: string
        guestPhone?: string | null
        userId?: string | null
        shippingCountry?: string
        billing: Record<string, string>
        shipping: Record<string, string>
        totalCents: number
        subtotalCents?: number
        shippingCents?: number
        vatCents?: number
        placedAt?: string
        paidAt?: string | null
      }
    | undefined
  const items = (data?.items as Array<{
    name: string
    quantity: number
    unitPriceCents: number
    lineTotalCents: number
    sku?: string | null
  }>) ?? []
  const history = (data?.history as Array<{ toStatus: string; note?: string | null; createdAt: string; source?: string }>) ?? []
  const timeline = (data?.timeline as Array<{ id: string; label: string; at?: string | null }>) ?? []
  const shipments = (data?.shipments as Array<{
    id: string
    label?: string
    publicLabel?: string
    status: string
    carrier?: string | null
    trackingCode?: string | null
    supplierCode?: string | null
    supplierPublicName?: string | null
  }>) ?? []
  const paymentRows = (data?.payments as Array<{
    id: string
    providerPaymentId: string
    status: string
    method?: string | null
    amountCents: number
    currency: string
    mode?: string
    paidAt?: string | null
    createdAt: string
  }>) ?? []
  const emailEvents = (data?.emailEvents as Array<{
    id: string
    template: string
    recipient: string
    status: string
    providerMessageId?: string | null
    errorCode?: string | null
    createdAt: string
  }>) ?? []
  const refundRows = (data?.refunds as Array<{
    id: string
    amountCents: number
    status: string
    reason?: string | null
    providerRefundId?: string | null
    createdAt: string
  }>) ?? []
  const refundContext = data?.refundContext as
    | {
        paidAmountCents: number
        refundedCents: number
        remainingCents: number
        refundable: boolean
        customerEmail: string
        orderNumber: string
        mollieMode: string
        paymentMode: string | null
        previousRefunds: Array<{
          id: string
          amountCents: number
          status: string
          reason: string | null
        }>
      }
    | undefined
  const transitions = (data?.allowedTransitions as OrderStatus[]) ?? []

  function euro(cents: number) {
    return (cents / 100).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })
  }

  function addressLines(addr: Record<string, string>) {
    const street = [addr.street, addr.houseNumber, addr.houseAddition].filter(Boolean).join(' ')
    return [addr.name, addr.company, street, `${addr.postalCode ?? ''} ${addr.city ?? ''}`.trim(), addr.country]
      .filter(Boolean)
      .join('\n')
  }

  function plannedRefundCents() {
    if (!refundContext) return 0
    if (refundMode === 'full') return refundContext.remainingCents
    const euros = Number(partialEuros.replace(',', '.'))
    if (!Number.isFinite(euros) || euros <= 0) return 0
    return Math.round(euros * 100)
  }

  async function executeRefund() {
    if (!order || !refundContext || !confirmChecked || !idempotencyKey) return
    const amountCents = plannedRefundCents()
    if (refundMode === 'partial' && (amountCents <= 0 || amountCents > refundContext.remainingCents)) {
      setRefundError('Ongeldig deelbedrag.')
      return
    }
    setRefundBusy(true)
    setRefundError('')
    setRefundOk('')
    try {
      const result = await adminFetch<{
        id: string
        status: string
        amountCents: number
        reused?: boolean
      }>(`/orders/${order.id}/refunds`, {
        method: 'POST',
        body: JSON.stringify({
          mode: refundMode,
          amountCents: refundMode === 'partial' ? amountCents : undefined,
          reason: refundReason.trim() || undefined,
          idempotencyKey,
          confirmed: true,
        }),
      })
      setRefundOk(
        result.reused
          ? `Reeds verwerkt (${euro(result.amountCents)}).`
          : `Terugbetaling uitgevoerd: ${euro(result.amountCents)}.`,
      )
      setConfirmStep(false)
      setConfirmChecked(false)
      setPartialEuros('')
      setRefundReason('')
      await client.invalidateQueries({ queryKey: ['admin', 'order', id] })
    } catch (err) {
      setRefundError(err instanceof ApiError ? err.message : 'Terugbetaling mislukt.')
    } finally {
      setRefundBusy(false)
    }
  }

  return (
    <>
      <Head title="Order" path={`/scotdejewish/orders/${id}`} />
      {!order ? (
        <p>Laden of niet gevonden.</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="font-heading text-[24px] font-semibold text-navy">{order.orderNumber}</h1>
            <p className="mt-2 text-[14px]">
              {order.statusLabel} · betaling {order.paymentStatus}
              {order.paymentMethod ? ` · ${order.paymentMethod}` : ''}
              {order.shippingCountry ? ` · land ${order.shippingCountry}` : ''}
            </p>
            <p className="mt-2 text-[16px] font-semibold">{euro(order.totalCents)}</p>
          </div>

          <section className="rounded-[8px] bg-white p-4 ring-1 ring-line">
            <h2 className="font-heading text-[16px] font-semibold text-navy">Klant</h2>
            <dl className="mt-2 space-y-1 text-[14px]">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">E-mail</dt>
                <dd>{order.guestEmail}</dd>
              </div>
              {order.guestPhone ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Telefoon</dt>
                  <dd>{order.guestPhone}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Account</dt>
                <dd>{order.userId ? order.userId : 'Gast'}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[8px] bg-white p-4 ring-1 ring-line">
            <h2 className="font-heading text-[16px] font-semibold text-navy">Betaling / Mollie</h2>
            <dl className="mt-2 space-y-1 text-[14px]">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Order payment status</dt>
                <dd>{order.paymentStatus}</dd>
              </div>
              {order.molliePaymentId ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Mollie payment ID</dt>
                  <dd className="break-all font-mono text-[12px]">{order.molliePaymentId}</dd>
                </div>
              ) : null}
            </dl>
            {paymentRows.length ? (
              <ul className="mt-3 space-y-2 border-t border-line pt-3 text-[13px]">
                {paymentRows.map((payment) => (
                  <li key={payment.id} className="rounded-[6px] bg-surface px-3 py-2">
                    <p className="font-medium">
                      {payment.status} · {euro(payment.amountCents)}
                      {payment.method ? ` · ${payment.method}` : ''}
                      {payment.mode ? ` · ${payment.mode}` : ''}
                    </p>
                    <p className="mt-0.5 break-all font-mono text-[11px] text-muted">
                      {payment.providerPaymentId}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[13px] text-muted">Geen payment-records.</p>
            )}
          </section>

          {items.length ? (
            <section className="rounded-[8px] bg-white p-4 ring-1 ring-line">
              <h2 className="font-heading text-[16px] font-semibold text-navy">Regels</h2>
              <ul className="mt-2 space-y-1 text-[14px]">
                {items.map((item, index) => (
                  <li key={`${item.name}-${index}`} className="flex justify-between gap-4">
                    <span>
                      {item.name} × {item.quantity}
                      {item.sku ? ` · ${item.sku}` : ''}
                    </span>
                    <span>{euro(item.lineTotalCents)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rounded-[8px] bg-white p-4 ring-1 ring-line">
            <h2 className="font-heading text-[16px] font-semibold text-navy">Zendingen</h2>
            {shipments.length === 0 ? (
              <p className="mt-2 text-[13px] text-muted">Nog geen zendingen.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-[14px]">
                {shipments.map((shipment, index) => (
                  <li key={shipment.id} className="rounded-[6px] border border-line px-3 py-2">
                    <p className="font-medium">
                      {shipment.label || shipment.publicLabel || `Zending ${index + 1}`} · {shipment.status}
                    </p>
                    <p className="text-[13px] text-muted">
                      {[shipment.carrier, shipment.trackingCode, shipment.supplierCode, shipment.supplierPublicName]
                        .filter(Boolean)
                        .join(' · ') || 'Geen tracking'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-[8px] bg-white p-4 ring-1 ring-line">
              <h2 className="font-heading text-[16px] font-semibold text-navy">Afleveradres</h2>
              <p className="mt-2 whitespace-pre-line text-[13px] text-ink">
                {addressLines(order.shipping)}
              </p>
            </section>
            <section className="rounded-[8px] bg-white p-4 ring-1 ring-line">
              <h2 className="font-heading text-[16px] font-semibold text-navy">Factuuradres</h2>
              <p className="mt-2 whitespace-pre-line text-[13px] text-ink">
                {addressLines(order.billing)}
              </p>
            </section>
          </div>

          <section className="rounded-[8px] bg-white p-4 ring-1 ring-line">
            <h2 className="font-heading text-[16px] font-semibold text-navy">Tijdlijn</h2>
            {timeline.length ? (
              <ol className="mt-2 space-y-1 text-[13px]">
                {timeline.map((step) => (
                  <li key={step.id}>
                    {step.label}
                    {step.at ? ` — ${new Date(step.at).toLocaleString('nl-NL')}` : ''}
                  </li>
                ))}
              </ol>
            ) : null}
            {history.length ? (
              <ul className="mt-3 space-y-1 border-t border-line pt-3 text-[12px] text-muted">
                {history.map((entry, index) => (
                  <li key={`${entry.toStatus}-${index}`}>
                    {entry.toStatus}
                    {entry.source ? ` (${entry.source})` : ''}
                    {entry.note ? ` — ${entry.note}` : ''}
                    {entry.createdAt ? ` · ${new Date(entry.createdAt).toLocaleString('nl-NL')}` : ''}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="rounded-[8px] bg-white p-4 ring-1 ring-line">
            <h2 className="font-heading text-[16px] font-semibold text-navy">E-mail events</h2>
            {emailEvents.length === 0 ? (
              <p className="mt-2 text-[13px] text-muted">Geen e-mail events.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-[13px]">
                {emailEvents.map((event) => (
                  <li key={event.id} className="rounded-[6px] bg-surface px-3 py-2">
                    <p className="font-medium">
                      {event.template} · {event.status}
                    </p>
                    <p className="text-muted">
                      {event.recipient}
                      {event.createdAt ? ` · ${new Date(event.createdAt).toLocaleString('nl-NL')}` : ''}
                    </p>
                    {event.errorCode ? (
                      <p className="text-red-700">Fout: {event.errorCode}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[8px] bg-white p-4 ring-1 ring-line">
            <h2 className="font-heading text-[16px] font-semibold text-navy">Terugbetalingen</h2>
            {refundContext ? (
              <dl className="mt-2 space-y-1 text-[14px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Betaald</dt>
                  <dd>{euro(refundContext.paidAmountCents)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Reeds terugbetaald</dt>
                  <dd>{euro(refundContext.refundedCents)}</dd>
                </div>
                <div className="flex justify-between gap-4 font-semibold">
                  <dt>Nog terugbetaalbaar</dt>
                  <dd>{euro(refundContext.remainingCents)}</dd>
                </div>
                <div className="flex justify-between gap-4 text-[13px] text-muted">
                  <dt>Mollie-modus</dt>
                  <dd>
                    {refundContext.mollieMode}
                    {refundContext.paymentMode ? ` · payment ${refundContext.paymentMode}` : ''}
                  </dd>
                </div>
              </dl>
            ) : null}

            {refundRows.length === 0 ? (
              <p className="mt-3 text-[13px] text-muted">Geen eerdere refunds.</p>
            ) : (
              <ul className="mt-3 space-y-1 border-t border-line pt-3 text-[14px]">
                {refundRows.map((refund) => (
                  <li key={refund.id}>
                    {euro(refund.amountCents)} · {refund.status}
                    {refund.reason ? ` — ${refund.reason}` : ''}
                    {refund.providerRefundId ? (
                      <span className="ml-1 font-mono text-[11px] text-muted">
                        {refund.providerRefundId}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            {refundContext?.refundable ? (
              <div className="mt-4 border-t border-line pt-4">
                {!confirmStep ? (
                  <div className="space-y-3">
                    <p className="text-[13px] text-muted">
                      Kies volledige of gedeeltelijke terugbetaling. Het bedrag wordt server-side
                      gevalideerd.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={refundMode === 'full' ? 'primary' : 'secondary'}
                        onClick={() => setRefundMode('full')}
                      >
                        Volledige terugbetaling
                      </Button>
                      <Button
                        type="button"
                        variant={refundMode === 'partial' ? 'primary' : 'secondary'}
                        onClick={() => setRefundMode('partial')}
                      >
                        Gedeeltelijke terugbetaling
                      </Button>
                    </div>
                    {refundMode === 'partial' ? (
                      <TextField
                        label="Bedrag (EUR)"
                        value={partialEuros}
                        onChange={(event) => setPartialEuros(event.target.value)}
                        placeholder="bijv. 12,50"
                      />
                    ) : null}
                    <TextField
                      label="Reden (optioneel)"
                      value={refundReason}
                      onChange={(event) => setRefundReason(event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setRefundError('')
                        setRefundOk('')
                        setConfirmChecked(false)
                        setIdempotencyKey(crypto.randomUUID())
                        setConfirmStep(true)
                      }}
                    >
                      Naar bevestiging…
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 rounded-[8px] border-2 border-red-200 bg-red-50/60 p-4">
                    <p className="font-heading text-[16px] font-semibold text-navy">
                      Bevestig terugbetaling
                    </p>
                    <dl className="space-y-1 text-[14px]">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">Order</dt>
                        <dd>{refundContext.orderNumber}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">Klant</dt>
                        <dd>{refundContext.customerEmail}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">Betaald bedrag</dt>
                        <dd>{euro(refundContext.paidAmountCents)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">Eerdere refunds</dt>
                        <dd>{euro(refundContext.refundedCents)}</dd>
                      </div>
                      <div className="flex justify-between gap-4 font-semibold text-red-800">
                        <dt>Dit terugbetalingsbedrag</dt>
                        <dd>{euro(plannedRefundCents())}</dd>
                      </div>
                    </dl>
                    {refundContext.previousRefunds.length ? (
                      <ul className="text-[12px] text-muted">
                        {refundContext.previousRefunds.map((row) => (
                          <li key={row.id}>
                            {euro(row.amountCents)} · {row.status}
                            {row.reason ? ` — ${row.reason}` : ''}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <label className="flex items-start gap-2 text-[14px]">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={confirmChecked}
                        onChange={(event) => setConfirmChecked(event.target.checked)}
                      />
                      <span>
                        Ik bevestig dat ik {euro(plannedRefundCents())} wil terugbetalen voor{' '}
                        {refundContext.orderNumber}. Dit kan niet ongedaan worden gemaakt via deze
                        knop.
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        disabled={!confirmChecked || refundBusy || plannedRefundCents() <= 0}
                        onClick={() => void executeRefund()}
                      >
                        {refundBusy ? 'Bezig…' : 'Terugbetaling uitvoeren'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={refundBusy}
                        onClick={() => {
                          setConfirmStep(false)
                          setConfirmChecked(false)
                        }}
                      >
                        Annuleren
                      </Button>
                    </div>
                  </div>
                )}
                {refundError ? (
                  <p className="mt-3 text-[14px] text-red-700" role="alert">
                    {refundError}
                  </p>
                ) : null}
                {refundOk ? (
                  <p className="mt-3 text-[14px] text-green-800" role="status">
                    {refundOk}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-muted">
                Geen terugbetaling mogelijk (niet betaald, geen restbedrag, of ongeldige
                orderstatus).
              </p>
            )}
          </section>

          <div className="flex flex-wrap gap-2">
            {transitions.map((status) => (
              <Button
                key={status}
                type="button"
                variant="secondary"
                onClick={() =>
                  adminFetch(`/orders/${order.id}/status`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status }),
                  }).then(() => client.invalidateQueries({ queryKey: ['admin', 'order', id] }))
                }
              >
                {ORDER_STATUS_LABELS[status]}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function SimpleFormList({
  title,
  path,
  fetchPath,
  fields,
}: {
  title: string
  path: string
  fetchPath: string
  fields: Array<{ key: string; label: string }>
}) {
  const client = useQueryClient()
  const { data } = useQuery({
    queryKey: ['admin', fetchPath],
    queryFn: () => adminFetch<{ items: Array<Record<string, unknown>> }>(fetchPath),
  })
  const [form, setForm] = useState<Record<string, string>>({})
  return (
    <>
      <Head title={title} path={path} />
      <h1 className="font-heading text-[24px] font-semibold text-navy">{title}</h1>
      <ul className="mt-4 divide-y divide-line rounded-[8px] bg-white ring-1 ring-line">
        {(data?.items ?? []).length === 0 ? <li className="p-4 text-muted">0</li> : null}
        {(data?.items ?? []).map((item) => (
          <li key={String(item.id)} className="p-3 text-[14px]">
            {String(
              item.name ?? item.code ?? item.companyName ?? item.filename ?? item.email ?? item.id,
            )}
          </li>
        ))}
      </ul>
      <form
        className="mt-4 max-w-lg space-y-3 rounded-[8px] bg-white p-4 ring-1 ring-line"
        onSubmit={(event) => {
          event.preventDefault()
          adminFetch(fetchPath, { method: 'POST', body: JSON.stringify(form) }).then(() => {
            setForm({})
            void client.invalidateQueries({ queryKey: ['admin', fetchPath] })
          })
        }}
      >
        {fields.map((field) => (
          <TextField
            key={field.key}
            label={field.label}
            value={form[field.key] ?? ''}
            onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
          />
        ))}
        <Button type="submit">Opslaan</Button>
      </form>
    </>
  )
}

export function AdminCategoriesPage() {
  return (
    <SimpleFormList
      title="Categorieën"
      path="/scotdejewish/categories"
      fetchPath="/categories"
      fields={[
        { key: 'name', label: 'Naam' },
        { key: 'slug', label: 'Slug' },
      ]}
    />
  )
}

export function AdminBrandsPage() {
  return (
    <SimpleFormList
      title="Merken"
      path="/scotdejewish/brands"
      fetchPath="/brands"
      fields={[
        { key: 'name', label: 'Naam' },
        { key: 'slug', label: 'Slug' },
      ]}
    />
  )
}

export function AdminSuppliersPage() {
  return (
    <SimpleFormList
      title="Leveranciers"
      path="/scotdejewish/suppliers"
      fetchPath="/suppliers"
      fields={[
        { key: 'name', label: 'Naam' },
        { key: 'internalCode', label: 'Interne code' },
        { key: 'contactName', label: 'Contactpersoon' },
        { key: 'email', label: 'E-mail' },
        { key: 'phone', label: 'Telefoon' },
        { key: 'website', label: 'Website' },
        { key: 'orderEmail', label: 'Order e-mail' },
        { key: 'notes', label: 'Notities' },
        { key: 'defaultLeadTime', label: 'Standaard levertijd' },
      ]}
    />
  )
}

export function AdminCustomersPage() {
  const { data } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: () =>
      adminFetch<{
        customers: Array<{ id: string; email: string; name: string; createdAt: string }>
      }>('/customers'),
  })
  return (
    <>
      <Head title="Klanten" path="/scotdejewish/customers" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Klanten</h1>
      <ul className="mt-4 rounded-[8px] bg-white ring-1 ring-line">
        {(data?.customers ?? []).length === 0 ? <li className="p-4">0</li> : null}
        {(data?.customers ?? []).map((customer) => (
          <li key={customer.id} className="border-b border-line p-3 text-[14px]">
            <Link
              className="text-brand hover:underline"
              to={`/scotdejewish/customers/${customer.id}`}
            >
              {customer.name}
            </Link>
            <span className="ml-2 text-muted">{customer.email}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

export function AdminCustomerDetailPage() {
  const { id = '' } = useParams()
  const { data } = useQuery({
    queryKey: ['admin', 'customer', id],
    queryFn: () => adminFetch<Record<string, unknown>>(`/customers/${id}`),
  })
  const customer = data?.customer as { name?: string; email?: string } | undefined
  return (
    <>
      <Head title="Klant" path={`/scotdejewish/customers/${id}`} />
      <h1 className="font-heading text-[24px] font-semibold text-navy">{customer?.name}</h1>
      <p className="text-[14px]">{customer?.email}</p>
    </>
  )
}

export function AdminReturnsPage() {
  const { data } = useQuery({
    queryKey: ['admin', 'returns'],
    queryFn: () =>
      adminFetch<{ items: Array<{ id: string; status: string; reason: string | null }> }>(
        '/returns',
      ),
  })
  return (
    <>
      <Head title="Retouren" path="/scotdejewish/returns" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Retouren</h1>
      <ul className="mt-4 rounded-[8px] bg-white p-4 ring-1 ring-line">
        {(data?.items ?? []).length === 0
          ? '0'
          : data?.items.map((item) => <li key={item.id}>{item.status}</li>)}
      </ul>
    </>
  )
}

export function AdminQuotesPage() {
  const { data } = useQuery({
    queryKey: ['admin', 'quotes'],
    queryFn: () =>
      adminFetch<{
        items: Array<{
          id: string
          companyName: string
          contactName: string
          status: string
          products: unknown[]
        }>
      }>('/quotes'),
  })
  return (
    <>
      <Head title="Offertes" path="/scotdejewish/quotes" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Offertes</h1>
      <p className="text-[13px] text-muted">PDF-generatie volgt later.</p>
      <ul className="mt-4 rounded-[8px] bg-white p-4 ring-1 ring-line">
        {(data?.items ?? []).length === 0
          ? '0'
          : data?.items.map((item) => (
              <li key={item.id}>
                {item.companyName} · {item.contactName} · {item.status}
              </li>
            ))}
      </ul>
    </>
  )
}

export function AdminCouponsPage() {
  return (
    <SimpleFormList
      title="Kortingscodes"
      path="/scotdejewish/coupons"
      fetchPath="/coupons"
      fields={[
        { key: 'code', label: 'Code' },
        { key: 'type', label: 'Type (percent of fixed)' },
      ]}
    />
  )
}

export function AdminContentPage() {
  const client = useQueryClient()
  const { data } = useQuery({
    queryKey: ['admin', 'content'],
    queryFn: () => adminFetch<{ content: Record<string, string> }>('/content'),
  })
  const [form, setForm] = useState<Record<string, string>>({})
  const content = { ...data?.content, ...form }
  return (
    <>
      <Head title="Content" path="/scotdejewish/content" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Content</h1>
      <form
        className="mt-4 max-w-xl space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          adminFetch('/content', { method: 'PUT', body: JSON.stringify(content) }).then(() =>
            client.invalidateQueries({ queryKey: ['admin', 'content'] }),
          )
        }}
      >
        {['heroText', 'announcementBar', 'businessSection', 'outletSection'].map((key) => (
          <TextField
            key={key}
            label={key}
            value={String(content[key] ?? '')}
            onChange={(event) => setForm({ ...form, [key]: event.target.value })}
          />
        ))}
        <Button type="submit">Opslaan</Button>
      </form>
    </>
  )
}

export function AdminSeoPage() {
  const [entityType, setEntityType] = useState('page')
  const [entityId, setEntityId] = useState('/')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  return (
    <>
      <Head title="SEO" path="/scotdejewish/seo" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">SEO</h1>
      <p className="text-[13px] text-muted">
        Defaults: product gebruikt naam en korte omschrijving tot u iets overschrijft.
      </p>
      <form
        className="mt-4 max-w-xl space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          void adminFetch('/seo', {
            method: 'PUT',
            body: JSON.stringify({ entityType, entityId, seoTitle, seoDescription }),
          })
        }}
      >
        <label className="block text-[14px]">
          Type
          <select
            className="mt-1 h-11 w-full rounded-[4px] border border-line px-3"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
          >
            <option value="page">Pagina</option>
            <option value="product">Product</option>
            <option value="category">Categorie</option>
          </select>
        </label>
        <TextField
          label="Entity id / pad"
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
        />
        <TextField
          label="SEO-titel"
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
        />
        <TextField
          label="Meta description"
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
        />
        <Button type="submit">Opslaan</Button>
      </form>
    </>
  )
}

export function AdminMediaPage() {
  return (
    <SimpleFormList
      title="Media"
      path="/scotdejewish/media"
      fetchPath="/media"
      fields={[
        { key: 'url', label: 'URL' },
        { key: 'filename', label: 'Bestandsnaam' },
        { key: 'alt', label: 'Alt' },
      ]}
    />
  )
}

export function AdminImportsPage() {
  const [filename, setFilename] = useState('feed.csv')
  const [csv, setCsv] = useState('name,sku,price\n')
  const [job, setJob] = useState<{
    id: string
    headers: string[]
    preview: string[][]
    rowCount: number
  } | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [report, setReport] = useState<string>('')
  return (
    <>
      <Head title="Importeren" path="/scotdejewish/imports" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Importcenter</h1>
      <ol className="mt-2 list-decimal pl-5 text-[14px] text-muted">
        <li>Bestand uploaden</li>
        <li>Kolommen detecteren en mappen</li>
        <li>Validatie</li>
        <li>Dry-run</li>
        <li>Bevestigen</li>
      </ol>
      <textarea
        className="mt-4 min-h-32 w-full max-w-3xl rounded-[8px] border border-line p-3 font-mono text-[13px]"
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
      />
      <div className="mt-2 flex gap-2">
        <TextField
          label="Bestandsnaam"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
        />
      </div>
      <Button
        className="mt-3"
        type="button"
        onClick={() =>
          adminFetch<{ id: string; headers: string[]; preview: string[][]; rowCount: number }>(
            '/imports',
            {
              method: 'POST',
              body: JSON.stringify({ filename, csv }),
            },
          ).then(setJob)
        }
      >
        Uploaden en kolommen detecteren
      </Button>
      {job ? (
        <div className="mt-4 space-y-3">
          <p className="text-[14px]">{job.rowCount} rijen. Preview max. 25.</p>
          <table className="text-[12px]">
            <thead>
              <tr>
                {job.headers.map((header) => (
                  <th key={header} className="px-2">
                    {header}
                    <select
                      className="ml-1 border"
                      onChange={(event) => setMapping({ ...mapping, [header]: event.target.value })}
                    >
                      <option value="">negeren</option>
                      <option value="name">naam</option>
                      <option value="sku">sku</option>
                      <option value="slug">slug</option>
                      <option value="price">prijs</option>
                    </select>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {job.preview.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              adminFetch<{ errors: string[] }>(`/imports/${job.id}/validate`, {
                method: 'POST',
                body: JSON.stringify({ mapping }),
              }).then((result) =>
                setReport(result.errors.join(' ') || 'Validatie ok. Voer dry-run uit.'),
              )
            }
          >
            Valideren
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              adminFetch<{ message: string }>(`/imports/${job.id}/dry-run`, {
                method: 'POST',
                body: '{}',
              }).then((result) => setReport(result.message))
            }
          >
            Dry-run
          </Button>
          <Button
            type="button"
            onClick={() =>
              adminFetch<{ note: string }>(`/imports/${job.id}/confirm`, {
                method: 'POST',
                body: '{}',
              }).then((result) => setReport(result.note))
            }
          >
            Bevestigen
          </Button>
          {report ? <p className="text-[14px]">{report}</p> : null}
        </div>
      ) : null}
    </>
  )
}

export function AdminUsersPage() {
  const client = useQueryClient()
  const { data, error } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () =>
      adminFetch<{ users: Array<{ id: string; email: string; name: string; role: string }> }>(
        '/users',
      ),
    retry: false,
  })
  if (error) return <p>Geen toegang tot gebruikersbeheer.</p>
  return (
    <>
      <Head title="Gebruikers" path="/scotdejewish/users" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Gebruikers</h1>
      <ul className="mt-4 rounded-[8px] bg-white ring-1 ring-line">
        {(data?.users ?? []).map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between border-b border-line p-3 text-[14px]"
          >
            <span>
              {item.email} · {item.role}
            </span>
            <select
              className="h-10 rounded border px-2"
              value={item.role}
              onChange={(event) =>
                adminFetch(`/users/${item.id}/role`, {
                  method: 'PATCH',
                  body: JSON.stringify({ role: event.target.value }),
                }).then(() => client.invalidateQueries({ queryKey: ['admin', 'users'] }))
              }
            >
              {[
                'customer',
                'support',
                'catalog_manager',
                'order_manager',
                'admin',
                'super_admin',
              ].map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </>
  )
}

export function AdminAuditPage() {
  const { data } = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: () =>
      adminFetch<{
        items: Array<{
          id: string
          actorEmail: string
          action: string
          summary: string
          createdAt: string
        }>
      }>('/audit-log'),
    retry: false,
  })
  return (
    <>
      <Head title="Auditlog" path="/scotdejewish/audit-log" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Auditlog</h1>
      <ul className="mt-4 rounded-[8px] bg-white p-4 text-[13px] ring-1 ring-line">
        {(data?.items ?? []).length === 0
          ? '0'
          : data?.items.map((item) => (
              <li key={item.id} className="border-b border-line py-2">
                {item.actorEmail} · {item.action} · {item.summary}
              </li>
            ))}
      </ul>
    </>
  )
}

export function AdminSettingsPage() {
  const { data } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () =>
      adminFetch<{ settings: { twoFactor: { enabled: boolean; note: string } } }>('/settings'),
    retry: false,
  })
  return (
    <>
      <Head title="Instellingen" path="/scotdejewish/settings" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Instellingen</h1>
      <p className="mt-3 max-w-xl text-[14px]">{data?.settings.twoFactor.note}</p>
    </>
  )
}

export function AdminIndexRedirect() {
  return <Navigate to="/scotdejewish/dashboard" replace />
}
