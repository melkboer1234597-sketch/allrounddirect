import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Heart, Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react'
import { SeoHead } from '@/components/seo/SeoHead'
import { FreeShippingProgress } from '@/components/commerce/FreeShippingProgress'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { useAuthSession } from '@/hooks/useAccount'
import { addWishlistItem } from '@/lib/account-api'
import { cn } from '@/lib/cn'
import { formatMoney } from '@/lib/money'
import {
  CART_MAX_QTY,
  CART_MIN_QTY,
  useCart,
  type CartLine,
} from '@/lib/cart'
import { toggleGuestWishlist } from '@/lib/guest-wishlist'
import { eurosToCents } from '../../shared/money'
import {
  deliveryLabelShort,
  freeShippingProgress,
  qualifiesForFreeShipping,
} from '../../shared/commerce'
import { formatCentsNl } from '../../shared/money'

function lineTotal(line: CartLine): number | null {
  if (!line.price) return null
  return line.price.amount * line.quantity
}

function QuantityControl({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (next: number) => void
  label: string
}) {
  return (
    <div
      className="inline-flex h-10 items-stretch overflow-hidden rounded-[8px] ring-1 ring-line"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className="inline-flex w-10 items-center justify-center text-muted transition-colors hover:bg-surface hover:text-ink disabled:opacity-40"
        aria-label="Aantal verlagen"
        disabled={value <= CART_MIN_QTY}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={CART_MIN_QTY}
        max={CART_MAX_QTY}
        value={value}
        aria-label={label}
        className="w-11 border-x border-line bg-white text-center text-[14px] tabular-nums text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        onChange={(event) => {
          const raw = event.target.value
          if (raw === '') return
          const next = Number(raw)
          if (!Number.isFinite(next)) return
          onChange(next)
        }}
        onBlur={(event) => {
          const next = Number(event.target.value)
          if (!Number.isFinite(next) || next < CART_MIN_QTY) onChange(CART_MIN_QTY)
          else if (next > CART_MAX_QTY) onChange(CART_MAX_QTY)
        }}
      />
      <button
        type="button"
        className="inline-flex w-10 items-center justify-center text-muted transition-colors hover:bg-surface hover:text-ink disabled:opacity-40"
        aria-label="Aantal verhogen"
        disabled={value >= CART_MAX_QTY}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}

function CartItemRow({
  line,
  onQuantity,
  onRemove,
  onMoveFavorite,
}: {
  line: CartLine
  onQuantity: (qty: number) => void
  onRemove: () => void
  onMoveFavorite: () => void
}) {
  const total = lineTotal(line)
  const fit = line.imageFit === 'contain' ? 'object-contain' : 'object-cover'

  return (
    <li className="flex gap-3 border-b border-line py-5 first:pt-0 last:border-b-0 sm:gap-4 md:gap-5 md:py-6">
      <Link
        to={line.href}
        className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[10px] bg-surface ring-1 ring-line sm:h-[110px] sm:w-[110px] md:h-[120px] md:w-[120px]"
      >
        {line.image ? (
          <img
            src={line.image}
            alt=""
            width={120}
            height={120}
            className={cn('h-full w-full p-1.5', fit)}
            loading="lazy"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted">
            <ShoppingBag className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {line.brand ? (
              <p className="text-[12px] font-medium tracking-wide text-muted uppercase">
                {line.brand}
              </p>
            ) : null}
            <Link
              to={line.href}
              className="mt-0.5 block font-heading text-[15px] font-semibold leading-snug text-ink hover:text-brand sm:text-[16px]"
            >
              {line.name}
            </Link>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] text-muted">
              <Truck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
              {deliveryLabelShort()}
            </p>
          </div>
          <p className="shrink-0 text-right text-[15px] font-semibold tabular-nums text-ink sm:text-[16px]">
            {total != null
              ? formatMoney({ amount: total, currency: line.price!.currency })
              : '—'}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-3">
          <div className="flex flex-wrap items-center gap-3">
            <QuantityControl
              value={line.quantity}
              onChange={onQuantity}
              label={`Aantal voor ${line.name}`}
            />
            {line.price ? (
              <p className="text-[13px] text-muted">
                {formatMoney(line.price)}
                <span className="text-muted/80"> / stuk</span>
              </p>
            ) : (
              <p className="text-[13px] text-muted">Prijs op aanvraag</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveFavorite}
              className="inline-flex h-9 items-center gap-1.5 rounded-[8px] px-2 text-[13px] text-muted hover:bg-surface hover:text-ink"
            >
              <Heart className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              Favoriet
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex h-9 items-center gap-1.5 rounded-[8px] px-2 text-[13px] text-muted hover:bg-surface hover:text-ink"
              aria-label={`${line.name} verwijderen`}
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              Verwijderen
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}

export function CartPage() {
  const { lines, setQuantity, remove, subtotal, count } = useCart()
  const session = useAuthSession()
  const queryClient = useQueryClient()
  const subtotalCents = eurosToCents(subtotal)
  const freeShip = freeShippingProgress(subtotalCents)
  const hasFreeShipping = qualifiesForFreeShipping(subtotalCents)

  const moveFavorite = useMutation({
    mutationFn: async (slug: string) => {
      if (session.data?.user) {
        await addWishlistItem(slug)
      } else {
        toggleGuestWishlist(slug)
      }
      remove(slug)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['account', 'wishlist'] })
      void queryClient.invalidateQueries({ queryKey: ['guest-wishlist'] })
    },
  })

  return (
    <main
      id="main"
      className="page-shell flex min-h-[calc(100dvh-var(--app-header-offset))] flex-col bg-surface pb-16 md:pb-20"
    >
      <SeoHead
        title="Winkelwagen | AllRound Direct"
        description="Uw winkelwagen bij AllRound Direct."
        path="/winkelwagen"
        robots="noindex,nofollow"
      />
      <Container className="flex-1">
        {lines.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col justify-center py-10 md:min-h-[440px] md:py-14">
            <div
              className="rounded-[12px] bg-white px-5 py-7 ring-1 ring-line sm:px-7 sm:py-8"
              role="status"
            >
              <div
                className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-surface text-muted"
                aria-hidden
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h1 className="font-heading text-[22px] font-semibold leading-snug text-ink sm:text-[24px]">
                Uw winkelwagen is leeg
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Bekijk het assortiment en voeg producten toe om verder te gaan.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
                <Button to="/assortiment" size="sm">
                  Bekijk assortiment
                </Button>
                <Link
                  to="/favorieten"
                  className="text-[14px] font-medium text-brand hover:underline"
                >
                  Bekijk favorieten
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 md:mb-7">
              <h1 className="heading-page text-ink">Winkelwagen</h1>
              <p className="mt-1.5 text-[14px] text-muted">
                {count} {count === 1 ? 'artikel' : 'artikelen'}
              </p>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
              <section className="rounded-[12px] bg-white px-4 py-1 ring-1 ring-line sm:px-5 md:px-6">
                <ul>
                  {lines.map((line) => (
                    <CartItemRow
                      key={line.slug}
                      line={line}
                      onQuantity={(qty) => setQuantity(line.slug, qty)}
                      onRemove={() => remove(line.slug)}
                      onMoveFavorite={() => moveFavorite.mutate(line.slug)}
                    />
                  ))}
                </ul>
              </section>

              <aside className="lg:sticky lg:top-[calc(var(--app-header-offset)+12px)]">
                <div className="rounded-[12px] bg-white p-5 ring-1 ring-line sm:p-6">
                  <h2 className="font-heading text-[17px] font-semibold text-ink">Overzicht</h2>

                  <dl className="mt-4 space-y-2.5 text-[14px]">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted">Subtotaal</dt>
                      <dd className="font-medium tabular-nums text-ink">
                        {formatCentsNl(subtotalCents)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted">Verzendkosten</dt>
                      <dd className="tabular-nums text-ink">
                        {hasFreeShipping ? (
                          <span className="font-medium text-brand">Gratis</span>
                        ) : (
                          <span className="text-muted">Bij afrekenen</span>
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                      <dt className="font-semibold text-ink">Totaal</dt>
                      <dd className="text-right">
                        <p className="text-[18px] font-semibold tabular-nums text-ink">
                          {formatCentsNl(subtotalCents)}
                          {!hasFreeShipping ? (
                            <span className="text-[13px] font-normal text-muted"> + verzending</span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-[12px] text-muted">incl. btw</p>
                      </dd>
                    </div>
                  </dl>

                  <FreeShippingProgress
                    eligibleSubtotalCents={subtotalCents}
                    className="mt-4"
                    compact
                  />
                  {!freeShip.reached && subtotalCents > 0 ? (
                    <p className="sr-only">{freeShip.message}</p>
                  ) : null}

                  <div className="mt-5 flex flex-col gap-2.5">
                    <Button to="/afrekenen" className="w-full justify-center">
                      Doorgaan naar afrekenen
                    </Button>
                    <Button
                      to="/assortiment"
                      variant="secondary"
                      className="w-full justify-center"
                    >
                      Verder winkelen
                    </Button>
                  </div>

                  <ul className="mt-5 space-y-2 border-t border-line pt-4 text-[12px] leading-snug text-muted">
                    <li>Veilig betalen via Mollie</li>
                    <li>Levering binnen {deliveryLabelShort()}</li>
                  </ul>
                </div>
              </aside>
            </div>
          </>
        )}
      </Container>
    </main>
  )
}
