import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { useAuthSession } from '@/hooks/useAccount'
import { apiFetch, ApiError } from '@/lib/api'
import { formatCentsNl } from '@/lib/format-cents'

type UiState = 'CHECKING' | 'PAID' | 'PENDING' | 'FAILED' | 'CANCELED' | 'EXPIRED'

type Status = {
  orderNumber: string
  status: string
  paymentStatus: string
  uiState: Exclude<UiState, 'CHECKING'>
  paymentMethod?: string | null
  totalCents: number
  currency: string
  email?: string
  shippingAddress?: string[]
  estimatedDelivery?: string | null
  hasAccount?: boolean
  canRetry?: boolean
}

const COPY: Record<
  UiState,
  { heading: string; detail: string }
> = {
  CHECKING: {
    heading: 'Wij controleren uw betaling.',
    detail: 'Even geduld — we vragen de actuele status op bij onze betaaldienst.',
  },
  PAID: {
    heading: 'Bedankt voor uw bestelling',
    detail: 'We hebben uw betaling ontvangen.',
  },
  PENDING: {
    heading: 'Uw betaling wordt verwerkt',
    detail:
      'We wachten op bevestiging van de betaaldienst. Een terugkeer in de browser is geen bewijs van betaling.',
  },
  FAILED: {
    heading: 'De betaling is niet afgerond',
    detail: 'U kunt opnieuw betalen zonder een nieuwe bestelling te plaatsen.',
  },
  CANCELED: {
    heading: 'De betaling is geannuleerd',
    detail: 'Uw bestelling wacht nog op betaling. U kunt opnieuw een betaalsessie starten.',
  },
  EXPIRED: {
    heading: 'De betaling is verlopen',
    detail: 'Start een nieuwe betaling voor dezelfde bestelling.',
  },
}

function methodLabel(method?: string | null) {
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

function SuccessIcon() {
  return (
    <span
      className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand"
      aria-hidden
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12.5 9.5 17 19 7.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function OrderConfirmationPage() {
  const [params] = useSearchParams()
  const order = params.get('order') ?? ''
  const token = params.get('token') ?? ''
  const session = useAuthSession()
  const loggedIn = Boolean(session.data?.user)
  const [data, setData] = useState<Status | null>(null)
  const [error, setError] = useState('')
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    if (!order || !token) {
      setError('Deze bevestigingslink is onvolledig.')
      return
    }
    let cancelled = false
    let terminal = false
    async function load() {
      try {
        const result = await apiFetch<Status>(
          `/checkout/status?order=${encodeURIComponent(order)}&token=${encodeURIComponent(token)}`,
        )
        if (cancelled) return
        setData(result)
        setError('')
        if (
          result.uiState === 'PAID' ||
          result.uiState === 'FAILED' ||
          result.uiState === 'CANCELED' ||
          result.uiState === 'EXPIRED'
        ) {
          terminal = true
        }
      } catch {
        if (!cancelled) setError('We kunnen de status nu niet ophalen.')
      }
    }
    void load()
    const timer = window.setInterval(() => {
      if (!terminal) void load()
    }, 3500)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [order, token])

  const uiState: UiState = error && !data ? 'CHECKING' : data?.uiState ?? 'CHECKING'
  const copy = COPY[uiState]
  const viewOrderHref = loggedIn
      ? `/account/bestellingen/${encodeURIComponent(order)}`
      : `/bestelling-volgen?order=${encodeURIComponent(order)}&token=${encodeURIComponent(token)}`

  async function retry() {
    if (!order || !token || retrying) return
    setRetrying(true)
    try {
      const result = await apiFetch<{ checkoutUrl: string | null }>('/checkout/retry-payment', {
        method: 'POST',
        body: JSON.stringify({ orderNumber: order, confirmationToken: token }),
      })
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
        return
      }
      setError('Kon geen nieuwe betaalsessie starten.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Opnieuw betalen mislukt.')
    } finally {
      setRetrying(false)
    }
  }

  return (
    <main id="main" className="section-space">
      <SeoHead
        title="Bestelling | AllRound Direct"
        description="Status van uw betaling bij AllRound Direct."
        path="/bestelling/bevestiging"
        robots="noindex,nofollow"
      />
      <Container>
        <div className="mx-auto max-w-[40rem]">
          {uiState === 'PAID' ? <SuccessIcon /> : null}

          <h1 className="heading-display text-navy">{copy.heading}</h1>
          <p className="text-body mt-3 text-ink">{copy.detail}</p>

          {error ? (
            <p className="mt-6 text-[15px] text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          {uiState === 'CHECKING' && !error ? (
            <p className="mt-8 text-[15px] text-muted" aria-live="polite">
              Status ophalen…
            </p>
          ) : null}

          {data && uiState === 'PAID' ? (
            <section className="mt-8 space-y-5">
              <p className="font-heading text-[18px] font-semibold text-navy">
                Ordernummer {data.orderNumber}
              </p>

              <dl className="divide-y divide-line rounded-[12px] bg-surface text-[14px]">
                {data.email ? (
                  <div className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-muted">E-mail</dt>
                    <dd className="text-right text-ink">{data.email}</dd>
                  </div>
                ) : null}
                {data.shippingAddress?.length ? (
                  <div className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-muted">Afleveradres</dt>
                    <dd className="whitespace-pre-line text-right text-ink">
                      {data.shippingAddress.join('\n')}
                    </dd>
                  </div>
                ) : null}
                {data.estimatedDelivery ? (
                  <div className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-muted">Geschatte levering</dt>
                    <dd className="text-right text-ink">{data.estimatedDelivery}</dd>
                  </div>
                ) : null}
                {methodLabel(data.paymentMethod) ? (
                  <div className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-muted">Betaalmethode</dt>
                    <dd className="text-right text-ink">{methodLabel(data.paymentMethod)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-muted">Totaal</dt>
                  <dd className="text-right font-semibold text-ink">
                    {formatCentsNl(data.totalCents, data.currency)}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-3 pt-1">
                <Button to={viewOrderHref}>Bekijk bestelling</Button>
                <Button to="/" variant="secondary">
                  Verder winkelen
                </Button>
              </div>
            </section>
          ) : null}

          {data && uiState !== 'PAID' && uiState !== 'CHECKING' ? (
            <section className="mt-8 rounded-[12px] bg-surface p-5">
              <p className="font-heading text-[18px] font-semibold text-navy">{data.orderNumber}</p>
              <p className="mt-2 text-[15px]">
                Totaal {formatCentsNl(data.totalCents, data.currency)}
              </p>
              {data.canRetry ? (
                <div className="mt-5">
                  <Button type="button" onClick={() => void retry()} disabled={retrying}>
                    {retrying ? 'Bezig…' : 'Opnieuw betalen'}
                  </Button>
                </div>
              ) : null}
              {uiState === 'PENDING' ? (
                <p className="mt-4 text-[13px] text-muted" aria-live="polite">
                  Deze pagina vernieuwt automatisch.
                </p>
              ) : null}
            </section>
          ) : null}

          {uiState !== 'PAID' ? (
            <p className="mt-8 text-[14px]">
              <Link to="/" className="text-brand underline">
                Verder winkelen
              </Link>
            </p>
          ) : null}
        </div>
      </Container>
    </main>
  )
}
