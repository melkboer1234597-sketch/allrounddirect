import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { apiFetch } from '@/lib/api'

type Status = {
  orderNumber: string
  status: string
  paymentStatus: string
  totalCents: number
  currency: string
}

export function OrderConfirmationPage() {
  const [params] = useSearchParams()
  const order = params.get('order') ?? ''
  const token = params.get('token') ?? ''
  const [data, setData] = useState<Status | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!order || !token) {
      setError('Deze bevestigingslink is onvolledig.')
      return
    }
    let cancelled = false
    async function load() {
      try {
        const result = await apiFetch<Status>(
          `/checkout/status?order=${encodeURIComponent(order)}&token=${encodeURIComponent(token)}`,
        )
        if (!cancelled) setData(result)
      } catch {
        if (!cancelled) setError('We kunnen de status nu niet ophalen.')
      }
    }
    void load()
    const timer = window.setInterval(() => void load(), 4000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [order, token])

  const paid = data?.paymentStatus === 'paid'

  return (
    <main id="main" className="section-space">
      <SeoHead
        title="Bestelling bevestigen | AllRound Direct"
        description="Status van uw betaling bij AllRound Direct."
        path="/bestelling/bevestiging"
        robots="noindex,nofollow"
      />
      <Container>
        <div className="mx-auto max-w-[42rem]">
          <h1 className="heading-display text-navy">Bedankt</h1>
          <p className="text-body mt-4 text-ink">
            We bevestigen de betaling via onze betaaldienst, niet alleen omdat u terugkomt in de
            browser. Deze pagina vraagt de actuele status op bij de server.
          </p>
          {error ? (
            <p className="mt-6 text-[15px] text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          {data ? (
            <section className="mt-8 rounded-[12px] bg-surface p-5">
              <p className="font-heading text-[20px] font-semibold text-navy">{data.orderNumber}</p>
              <p className="mt-2 text-[15px]">
                Betaling: {paid ? 'bevestigd' : 'nog niet bevestigd'} ({data.paymentStatus})
              </p>
              <p className="mt-1 text-[14px] text-muted">Orderstatus: {data.status}</p>
            </section>
          ) : !error ? (
            <p className="mt-8 text-muted">Status ophalen…</p>
          ) : null}
          <p className="mt-8 text-[14px]">
            <Link to="/bestelling-volgen" className="text-brand underline">
              Bestelling volgen
            </Link>
          </p>
          <p className="mt-4">
            <Button to="/" variant="secondary">
              Naar homepage
            </Button>
          </p>
        </div>
      </Container>
    </main>
  )
}
