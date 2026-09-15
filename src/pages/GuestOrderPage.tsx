import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { AuthCard } from '@/components/account/AuthCard'
import { TextField } from '@/components/account/Fields'
import { TurnstileField } from '@/components/account/TurnstileField'
import { OrderDetailView } from '@/components/order/OrderDetailView'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import {
  accessGuestOrder,
  lookupGuestOrder,
  type OrderDetail,
} from '@/lib/account-api'
import { ApiError } from '@/lib/api'

export function GuestOrderPage() {
  const [params] = useSearchParams()
  const queryOrder = params.get('order') ?? ''
  const queryToken = params.get('token') ?? ''

  const [orderNumber, setOrderNumber] = useState(queryOrder)
  const [email, setEmail] = useState('')
  const [turnstile, setTurnstile] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [tokenLoading, setTokenLoading] = useState(Boolean(queryOrder && queryToken))
  const onToken = useCallback((token: string) => setTurnstile(token), [])

  useEffect(() => {
    if (!queryOrder || !queryToken) return
    let cancelled = false
    setTokenLoading(true)
    setError('')
    void accessGuestOrder(queryOrder, queryToken)
      .then((result) => {
        if (!cancelled) setOrder(result)
      })
      .catch((err) => {
        if (!cancelled) {
          setOrder(null)
          setError(err instanceof ApiError ? err.message : 'Toegangslink is ongeldig of verlopen.')
        }
      })
      .finally(() => {
        if (!cancelled) setTokenLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [queryOrder, queryToken])

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

  if (order) {
    return (
      <>
        <SeoHead
          title={`Bestelling ${order.orderNumber} | AllRound Direct`}
          description="Status van uw bestelling bij AllRound Direct."
          path="/bestelling-volgen"
          robots="noindex,nofollow"
        />
        <main id="main" className="section-space">
          <Container>
            <div className="mx-auto max-w-[48rem]">
              <p className="mb-4 text-[14px]">
                <Link
                  to="/bestelling-volgen"
                  className="text-brand hover:underline"
                  onClick={() => {
                    setOrder(null)
                    setError('')
                  }}
                >
                  Andere bestelling opzoeken
                </Link>
              </p>
              <OrderDetailView order={order} />
            </div>
          </Container>
        </main>
      </>
    )
  }

  return (
    <>
      <SeoHead
        title="Bestelling volgen | AllRound Direct"
        description="Volg een bestelling met ordernummer en e-mailadres, of via een beveiligde link."
        path="/bestelling-volgen"
        robots="noindex,nofollow"
      />
      {tokenLoading ? (
        <main id="main" className="section-space">
          <Container>
            <p className="text-muted">Bestelling laden…</p>
            {error ? (
              <p className="mt-4 text-[14px] text-red-700" role="alert">
                {error}
              </p>
            ) : null}
          </Container>
        </main>
      ) : (
        <AuthCard
          title="Bestelling volgen"
          description="Voer het ordernummer en het e-mailadres van de bestelling in. Alleen die combinatie geeft toegang, niet alleen het ordernummer."
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
        </AuthCard>
      )}
    </>
  )
}
