import { useCallback, useState } from 'react'
import { SeoHead } from '@/components/seo/SeoHead'
import { AuthCard } from '@/components/account/AuthCard'
import { TextField } from '@/components/account/Fields'
import { TurnstileField } from '@/components/account/TurnstileField'
import { Button } from '@/components/ui/Button'
import { formatCents, formatDateTime, lookupGuestOrder, type OrderDetail } from '@/lib/account-api'
import { ApiError } from '@/lib/api'

export function GuestOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [turnstile, setTurnstile] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const onToken = useCallback((token: string) => setTurnstile(token), [])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      const result = await lookupGuestOrder(orderNumber, email, turnstile || undefined)
      setOrder(result)
    } catch (err) {
      setOrder(null)
      setError(err instanceof ApiError ? err.message : 'Opzoeken is niet gelukt.')
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <SeoHead
        title="Bestelling volgen | AllRound Direct"
        description="Volg een bestelling met ordernummer en e-mailadres, zonder account."
        path="/bestelling-volgen"
        robots="noindex,nofollow"
      />
      <AuthCard
        title="Bestelling volgen"
        description="Voer het ordernummer en het e-mailadres van de bestelling in. Er is geen account nodig."
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <TextField
            label="Ordernummer"
            name="order-number"
            autoComplete="off"
            required
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
          />
          <TextField
            label="E-mailadres"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TurnstileField onToken={onToken} />
          {error ? (
            <p className="text-[14px] text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Bezig…' : 'Status bekijken'}
          </Button>
        </form>
        {order ? (
          <div className="mt-6 border-t border-line pt-5 text-[14px]">
            <p className="font-heading text-[18px] font-semibold text-navy">{order.orderNumber}</p>
            <p className="text-muted">
              {formatDateTime(order.placedAt)} · {order.statusLabel}
            </p>
            <p className="mt-2">Totaal {formatCents(order.totalCents, order.currency)}</p>
            <ol className="mt-4 space-y-3">
              {order.shipments.map((shipment) => (
                <li key={shipment.id} className="border-l-2 border-brand pl-3">
                  <p className="font-medium">{shipment.label}</p>
                  <p>{shipment.statusLabel}</p>
                  <ul className="text-muted">
                    {shipment.items.map((item) => (
                      <li key={`${shipment.id}-${item.name}`}>
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </AuthCard>
    </>
  )
}
