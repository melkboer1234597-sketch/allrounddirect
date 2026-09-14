import type { HTMLAttributes, ReactNode } from 'react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SeoHead } from '@/components/seo/SeoHead'
import { FreeShippingProgress } from '@/components/commerce/FreeShippingProgress'
import { Container } from '@/components/ui/Container'
import { apiFetch, ApiError } from '@/lib/api'
import { clearCart, useCart, type CartLine } from '@/lib/cart'
import { formatCentsNl } from '@/lib/format-cents'
import { cn } from '@/lib/cn'
import {
  isValidPostalCode,
  normalizePostalCode,
  type CheckoutCountry,
} from '../../shared/checkout'

type AddressForm = {
  firstName: string
  lastName: string
  street: string
  houseNumber: string
  houseAddition: string
  postalCode: string
  city: string
  country: CheckoutCountry
  company: string
  phone: string
}

type FieldErrors = Partial<Record<string, string>>

type CheckoutContext = {
  suggestedCountry: CheckoutCountry
  countries: Array<{ code: CheckoutCountry; label: string }>
  locale: string
  deliveryMethods: Array<{
    id: string
    label: string
    description: string
    amountCents: number | null
    priceKnown: boolean
  }>
  paymentMethods: Array<{
    id: string
    description: string
    image: { size1x?: string; size2x?: string; svg?: string }
  }>
  mollie: { label: string; mode: string; configured: boolean }
  prefill: {
    email?: string
    firstName?: string
    lastName?: string
    phone?: string
    shipping?: Partial<AddressForm>
    billing?: Partial<AddressForm>
  } | null
  loggedIn: boolean
}

type QuoteResult = {
  items: Array<{
    slug: string
    name: string
    quantity: number
    unitPriceCents: number
    lineTotalCents: number
    imageRef?: string | null
  }>
  subtotalCents: number
  vatCents: number
  shippingCents: number
  totalCents: number
  shippingPriceKnown: boolean
  freeShipping?: boolean
  deliveryMethod: { id: string; label: string; description: string }
}

const emptyAddress = (country: CheckoutCountry): AddressForm => ({
  firstName: '',
  lastName: '',
  street: '',
  houseNumber: '',
  houseAddition: '',
  postalCode: '',
  city: '',
  country,
  company: '',
  phone: '',
})

function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `chk_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function formatNlPostalInput(value: string): string {
  const raw = value.toUpperCase().replace(/[^0-9A-Z]/g, '')
  if (raw.length <= 4) return raw
  return `${raw.slice(0, 4)} ${raw.slice(4, 6)}`
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { lines } = useCart()
  const [country, setCountry] = useState<CheckoutCountry>('NL')
  const [countryReady, setCountryReady] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [customerType, setCustomerType] = useState<'consumer' | 'business'>('consumer')
  const [shipping, setShipping] = useState<AddressForm>(emptyAddress('NL'))
  const [billing, setBilling] = useState<AddressForm>(emptyAddress('NL'))
  const [sameBilling, setSameBilling] = useState(true)
  const [deliveryMethodId, setDeliveryMethodId] = useState('standard_nl_be')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [idempotencyKey] = useState(newIdempotencyKey)
  const [prefillApplied, setPrefillApplied] = useState(false)
  const formTopRef = useRef<HTMLDivElement>(null)

  const empty = lines.length === 0
  const cartImages = useMemo(() => {
    const map = new Map<string, string>()
    for (const line of lines) {
      if (line.image) map.set(line.slug, line.image)
    }
    return map
  }, [lines])

  const quote = useQuery({
    queryKey: ['checkout', 'quote', country, deliveryMethodId, lines],
    enabled: lines.length > 0,
    queryFn: () =>
      apiFetch<QuoteResult>('/checkout/quote', {
        method: 'POST',
        body: JSON.stringify({
          country,
          deliveryMethodId,
          lines: lines.map((line) => ({ slug: line.slug, quantity: line.quantity })),
        }),
      }),
  })

  const amountForMethods = quote.data?.totalCents ?? Math.round(
    lines.reduce((sum, line) => sum + (line.price?.amount ?? 0) * line.quantity * 100, 0),
  )

  const context = useQuery({
    queryKey: ['checkout', 'context', country, amountForMethods],
    queryFn: () =>
      apiFetch<CheckoutContext>(
        `/checkout/context?country=${country}&amountCents=${Math.max(100, amountForMethods || 10000)}`,
      ),
  })

  useEffect(() => {
    const data = context.data
    if (!data || countryReady) return
    setCountry(data.suggestedCountry)
    setShipping((prev) => ({ ...prev, country: data.suggestedCountry }))
    setBilling((prev) => ({ ...prev, country: data.suggestedCountry }))
    setCountryReady(true)
  }, [context.data, countryReady])

  useEffect(() => {
    const data = context.data
    if (!data || prefillApplied) return
    if (data.prefill) {
      setEmail((prev) => prev || data.prefill?.email || '')
      setPhone((prev) => prev || data.prefill?.phone || '')
      if (data.prefill.shipping) {
        setShipping((prev) => ({
          ...emptyAddress(data.suggestedCountry),
          ...prev,
          ...data.prefill?.shipping,
          country:
            (data.prefill?.shipping?.country as CheckoutCountry) || data.suggestedCountry,
          firstName: data.prefill?.shipping?.firstName || data.prefill?.firstName || prev.firstName,
          lastName: data.prefill?.shipping?.lastName || data.prefill?.lastName || prev.lastName,
        }))
      } else if (data.prefill.firstName) {
        setShipping((prev) => ({
          ...prev,
          firstName: prev.firstName || data.prefill?.firstName || '',
          lastName: prev.lastName || data.prefill?.lastName || '',
        }))
      }
    }
    setPrefillApplied(true)
  }, [context.data, prefillApplied])

  useEffect(() => {
    const data = context.data
    if (!data) return
    if (data.deliveryMethods[0]) {
      setDeliveryMethodId((prev) =>
        data.deliveryMethods.some((m) => m.id === prev) ? prev : data.deliveryMethods[0].id,
      )
    }
    if (data.paymentMethods.length) {
      setPaymentMethod((prev) =>
        data.paymentMethods.some((m) => m.id === prev) ? prev : data.paymentMethods[0].id,
      )
    }
  }, [context.data])

  function changeCountry(next: CheckoutCountry) {
    setCountry(next)
    setShipping((prev) => ({ ...prev, country: next, postalCode: '' }))
    setBilling((prev) => ({ ...prev, country: next }))
    setPaymentMethod('')
    setErrors((prev) => {
      const nextErrors = { ...prev }
      delete nextErrors.postalCode
      delete nextErrors.billingPostalCode
      return nextErrors
    })
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    if (!shipping.firstName.trim()) next.firstName = 'Vul uw voornaam in.'
    if (!shipping.lastName.trim()) next.lastName = 'Vul uw achternaam in.'
    if (!email.trim()) next.email = 'Vul uw e-mailadres in.'
    else if (!isEmail(email)) next.email = 'Dit e-mailadres lijkt niet geldig.'
    if (!phone.trim() && !shipping.phone.trim()) next.phone = 'Vul een telefoonnummer in.'
    if (!shipping.street.trim()) next.street = 'Vul de straat in.'
    if (!shipping.houseNumber.trim()) next.houseNumber = 'Vul het huisnummer in.'
    if (!shipping.postalCode.trim()) {
      next.postalCode = 'Vul de postcode in.'
    } else if (!isValidPostalCode(country, shipping.postalCode)) {
      next.postalCode =
        country === 'NL'
          ? 'Gebruik een Nederlandse postcode, bijvoorbeeld 1234 AB.'
          : 'Gebruik een Belgische postcode van 4 cijfers.'
    }
    if (!shipping.city.trim()) next.city = 'Vul de plaats in.'
    if (!sameBilling) {
      if (!billing.firstName.trim()) next.billingFirstName = 'Vul de voornaam in.'
      if (!billing.lastName.trim()) next.billingLastName = 'Vul de achternaam in.'
      if (!billing.street.trim()) next.billingStreet = 'Vul de straat in.'
      if (!billing.houseNumber.trim()) next.billingHouseNumber = 'Vul het huisnummer in.'
      if (!billing.postalCode.trim() || !isValidPostalCode(billing.country, billing.postalCode)) {
        next.billingPostalCode = 'Controleer de postcode van het factuuradres.'
      }
      if (!billing.city.trim()) next.billingCity = 'Vul de plaats in.'
    }
    if (!paymentMethod) next.paymentMethod = 'Kies een betaalmethode.'
    if (!accepted) next.accepted = 'Bevestig dat u akkoord gaat met de voorwaarden.'
    return next
  }

  function focusFirstError(nextErrors: FieldErrors) {
    const order = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'street',
      'houseNumber',
      'postalCode',
      'city',
      'billingFirstName',
      'paymentMethod',
      'accepted',
    ]
    const first = order.find((key) => nextErrors[key])
    if (!first) return
    const el = document.querySelector<HTMLElement>(`[data-field="${first}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const input = el?.querySelector<HTMLElement>('input, select, button, textarea')
    input?.focus()
  }

  async function placeOrder() {
    if (submitting) return
    const nextErrors = validate()
    setErrors(nextErrors)
    setSubmitError('')
    if (Object.keys(nextErrors).length) {
      focusFirstError(nextErrors)
      return
    }

    setSubmitting(true)
    try {
      const ship = {
        ...shipping,
        country,
        postalCode: normalizePostalCode(country, shipping.postalCode),
        phone: phone || shipping.phone,
      }
      const bill = sameBilling
        ? { ...ship }
        : {
            ...billing,
            postalCode: normalizePostalCode(billing.country, billing.postalCode),
          }
      const result = await apiFetch<{
        checkoutUrl: string | null
        orderNumber: string
        confirmationToken: string
      }>('/checkout/place', {
        method: 'POST',
        body: JSON.stringify({
          email,
          phone: phone || ship.phone || undefined,
          customerType,
          shipping: {
            ...ship,
            houseAddition: ship.houseAddition || undefined,
            company: ship.company || undefined,
          },
          billing: {
            ...bill,
            houseAddition: bill.houseAddition || undefined,
            company: bill.company || undefined,
          },
          lines: lines.map((line) => ({ slug: line.slug, quantity: line.quantity })),
          deliveryMethodId,
          paymentMethod: paymentMethod || undefined,
          locale: context.data?.locale,
          idempotencyKey,
          acceptedTerms: true,
        }),
      })
      clearCart()
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
        return
      }
      navigate(
        `/bestelling/bevestiging?order=${encodeURIComponent(result.orderNumber)}&token=${encodeURIComponent(result.confirmationToken)}`,
      )
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : 'Bestelling kon niet worden geplaatst. Probeer het opnieuw.',
      )
      setSubmitting(false)
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const totalLabel = formatCentsNl(quote.data?.totalCents ?? 0)
  const paymentLabel =
    context.data?.paymentMethods.find((m) => m.id === paymentMethod)?.description ?? paymentMethod

  const summaryItems =
    quote.data?.items ??
    lines.map((line) => ({
      slug: line.slug,
      name: line.name,
      quantity: line.quantity,
      unitPriceCents: Math.round((line.price?.amount ?? 0) * 100),
      lineTotalCents: Math.round((line.price?.amount ?? 0) * 100) * line.quantity,
      imageRef: line.image ?? null,
    }))

  return (
    <main id="main" className="pb-16 pt-6 sm:pb-20 sm:pt-8">
      <SeoHead
        title="Afrekenen | AllRound Direct"
        description="Rond uw bestelling veilig af bij AllRound Direct."
        path="/afrekenen"
        robots="noindex,nofollow"
      />
      <Container className="max-w-[1120px]">
        <div ref={formTopRef}>
          <h1 className="font-heading text-[1.75rem] font-semibold tracking-tight text-navy sm:text-[2rem]">
            Afrekenen
          </h1>
          {context.data?.loggedIn ? (
            <p className="mt-1.5 text-[14px] text-muted">Uw accountgegevens zijn vooringevuld.</p>
          ) : (
            <p className="mt-1.5 text-[14px] text-muted">
              Gastafrekenen · Levering in Nederland en België
            </p>
          )}
        </div>

        {empty ? (
          <div className="mt-10 rounded-[10px] bg-white px-5 py-8 ring-1 ring-line">
            <p className="text-[15px] text-muted">Uw winkelwagen is leeg.</p>
            <Link to="/assortiment" className="mt-4 inline-block text-[15px] font-medium text-brand hover:underline">
              Naar assortiment
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid items-start gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.95fr)] lg:gap-10">
            <div className="min-w-0 space-y-4 lg:space-y-5">
              {/* Mobile collapsible summary */}
              <div className="lg:hidden">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[10px] bg-white px-4 py-3.5 text-left ring-1 ring-line"
                  aria-expanded={summaryOpen}
                  onClick={() => setSummaryOpen((open) => !open)}
                >
                  <span className="text-[15px] font-medium text-ink">
                    Uw bestelling · {quote.isLoading ? '…' : totalLabel}
                  </span>
                  <span className="text-[13px] text-brand">{summaryOpen ? 'Verberg' : 'Toon'}</span>
                </button>
                {summaryOpen ? (
                  <div className="mt-2 rounded-[10px] bg-white p-4 ring-1 ring-line">
                    <OrderSummaryBody
                      items={summaryItems}
                      cartImages={cartImages}
                      quote={quote.data}
                      lines={lines}
                    />
                  </div>
                ) : null}
              </div>

              {submitError ? (
                <p className="rounded-[8px] bg-red-50 px-4 py-3 text-[14px] text-red-800" role="alert">
                  {submitError}
                </p>
              ) : null}

              <Section title="Contact">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="firstName"
                    label="Voornaam"
                    autoComplete="given-name"
                    value={shipping.firstName}
                    error={errors.firstName}
                    onChange={(v) => {
                      setShipping({ ...shipping, firstName: v })
                      setErrors((e) => ({ ...e, firstName: undefined }))
                    }}
                  />
                  <Field
                    id="lastName"
                    label="Achternaam"
                    autoComplete="family-name"
                    value={shipping.lastName}
                    error={errors.lastName}
                    onChange={(v) => {
                      setShipping({ ...shipping, lastName: v })
                      setErrors((e) => ({ ...e, lastName: undefined }))
                    }}
                  />
                </div>
                <Field
                  id="email"
                  label="E-mailadres"
                  type="email"
                  autoComplete="email"
                  value={email}
                  error={errors.email}
                  onChange={(v) => {
                    setEmail(v)
                    setErrors((e) => ({ ...e, email: undefined }))
                  }}
                />
                <Field
                  id="phone"
                  label="Telefoonnummer"
                  type="tel"
                  autoComplete="tel"
                  value={phone || shipping.phone}
                  error={errors.phone}
                  onChange={(v) => {
                    setPhone(v)
                    setShipping({ ...shipping, phone: v })
                    setErrors((e) => ({ ...e, phone: undefined }))
                  }}
                />
                <Field
                  id="company"
                  label="Bedrijfsnaam"
                  optional
                  autoComplete="organization"
                  value={shipping.company}
                  onChange={(v) => setShipping({ ...shipping, company: v })}
                />
                <fieldset className="pt-1">
                  <legend className="text-[13px] font-medium text-ink">U bestelt als</legend>
                  <div className="mt-2 flex flex-wrap gap-4 text-[15px]">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="customerType"
                        checked={customerType === 'consumer'}
                        onChange={() => setCustomerType('consumer')}
                      />
                      Particulier
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="customerType"
                        checked={customerType === 'business'}
                        onChange={() => setCustomerType('business')}
                      />
                      Zakelijk
                    </label>
                  </div>
                </fieldset>
              </Section>

              <Section title="Afleveradres">
                <label className="block" data-field="country">
                  <span className="text-[13px] font-medium text-ink">Land</span>
                  <select
                    className={inputClass()}
                    value={country}
                    autoComplete="country"
                    onChange={(e) => changeCountry(e.target.value as CheckoutCountry)}
                  >
                    {(context.data?.countries ?? [
                      { code: 'NL' as const, label: 'Nederland' },
                      { code: 'BE' as const, label: 'België' },
                    ]).map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <Field
                  id="street"
                  label="Straat"
                  autoComplete="address-line1"
                  value={shipping.street}
                  error={errors.street}
                  onChange={(v) => {
                    setShipping({ ...shipping, street: v })
                    setErrors((e) => ({ ...e, street: undefined }))
                  }}
                />
                <div className="grid grid-cols-[1fr_0.85fr] gap-3 sm:grid-cols-[140px_1fr]">
                  <Field
                    id="houseNumber"
                    label="Huisnr."
                    autoComplete="off"
                    value={shipping.houseNumber}
                    error={errors.houseNumber}
                    onChange={(v) => {
                      setShipping({ ...shipping, houseNumber: v })
                      setErrors((e) => ({ ...e, houseNumber: undefined }))
                    }}
                  />
                  <Field
                    id="houseAddition"
                    label="Toevoeging"
                    optional
                    autoComplete="off"
                    value={shipping.houseAddition}
                    onChange={(v) => setShipping({ ...shipping, houseAddition: v })}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    id="postalCode"
                    label="Postcode"
                    autoComplete="postal-code"
                    inputMode={country === 'BE' ? 'numeric' : 'text'}
                    value={shipping.postalCode}
                    error={errors.postalCode}
                    hint={country === 'NL' ? 'Bijvoorbeeld 1234 AB' : '4 cijfers'}
                    onChange={(v) => {
                      const next = country === 'NL' ? formatNlPostalInput(v) : v.replace(/\D/g, '').slice(0, 4)
                      setShipping({ ...shipping, postalCode: next })
                      setErrors((e) => ({ ...e, postalCode: undefined }))
                    }}
                    onBlur={() => {
                      if (country === 'NL' && shipping.postalCode.trim()) {
                        setShipping((prev) => ({
                          ...prev,
                          postalCode: normalizePostalCode('NL', prev.postalCode),
                        }))
                      }
                    }}
                  />
                  <Field
                    id="city"
                    label="Plaats"
                    autoComplete="address-level2"
                    value={shipping.city}
                    error={errors.city}
                    onChange={(v) => {
                      setShipping({ ...shipping, city: v })
                      setErrors((e) => ({ ...e, city: undefined }))
                    }}
                  />
                </div>

                <label className="mt-1 flex items-start gap-2.5 text-[14px] text-ink">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={sameBilling}
                    onChange={(e) => setSameBilling(e.target.checked)}
                  />
                  Factuuradres is hetzelfde als afleveradres
                </label>

                {!sameBilling ? (
                  <div className="mt-2 space-y-4 border-t border-line pt-4">
                    <h3 className="text-[15px] font-medium text-ink">Factuuradres</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        id="billingFirstName"
                        label="Voornaam"
                        autoComplete="billing given-name"
                        value={billing.firstName}
                        error={errors.billingFirstName}
                        onChange={(v) => setBilling({ ...billing, firstName: v })}
                      />
                      <Field
                        id="billingLastName"
                        label="Achternaam"
                        autoComplete="billing family-name"
                        value={billing.lastName}
                        error={errors.billingLastName}
                        onChange={(v) => setBilling({ ...billing, lastName: v })}
                      />
                    </div>
                    <Field
                      id="billingStreet"
                      label="Straat"
                      autoComplete="billing address-line1"
                      value={billing.street}
                      error={errors.billingStreet}
                      onChange={(v) => setBilling({ ...billing, street: v })}
                    />
                    <div className="grid grid-cols-[1fr_0.85fr] gap-3 sm:grid-cols-[140px_1fr]">
                      <Field
                        id="billingHouseNumber"
                        label="Huisnr."
                        value={billing.houseNumber}
                        error={errors.billingHouseNumber}
                        onChange={(v) => setBilling({ ...billing, houseNumber: v })}
                      />
                      <Field
                        id="billingAddition"
                        label="Toevoeging"
                        optional
                        value={billing.houseAddition}
                        onChange={(v) => setBilling({ ...billing, houseAddition: v })}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field
                        id="billingPostalCode"
                        label="Postcode"
                        autoComplete="billing postal-code"
                        value={billing.postalCode}
                        error={errors.billingPostalCode}
                        onChange={(v) =>
                          setBilling({
                            ...billing,
                            postalCode:
                              billing.country === 'NL' ? formatNlPostalInput(v) : v.replace(/\D/g, '').slice(0, 4),
                          })
                        }
                      />
                      <Field
                        id="billingCity"
                        label="Plaats"
                        autoComplete="billing address-level2"
                        value={billing.city}
                        error={errors.billingCity}
                        onChange={(v) => setBilling({ ...billing, city: v })}
                      />
                    </div>
                  </div>
                ) : null}
              </Section>

              <Section title="Bezorging">
                <div className="space-y-2">
                  {(context.data?.deliveryMethods ?? []).map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        'flex cursor-pointer gap-3 rounded-[9px] border px-3.5 py-3 transition-colors',
                        deliveryMethodId === method.id
                          ? 'border-brand bg-brand/[0.04]'
                          : 'border-line bg-white hover:border-navy/25',
                      )}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        className="mt-1"
                        checked={deliveryMethodId === method.id}
                        onChange={() => setDeliveryMethodId(method.id)}
                      />
                      <span className="min-w-0">
                        <span className="block text-[15px] font-medium text-ink">{method.label}</span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-muted">
                          {method.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </Section>

              <Section title="Betalen">
                <div className="space-y-2" data-field="paymentMethod">
                  {(context.data?.paymentMethods ?? []).map((method) => {
                    const selected = paymentMethod === method.id
                    return (
                      <label
                        key={method.id}
                        className={cn(
                          'flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[9px] border px-3.5 py-2.5 transition-colors',
                          selected
                            ? 'border-brand bg-brand/[0.04]'
                            : 'border-line bg-white hover:border-navy/25',
                        )}
                      >
                        <input
                          type="radio"
                          name="pay"
                          value={method.id}
                          checked={selected}
                          aria-label={method.description || method.id}
                          onChange={() => {
                            setPaymentMethod(method.id)
                            setErrors((e) => ({ ...e, paymentMethod: undefined }))
                          }}
                        />
                        {method.image.svg || method.image.size2x || method.image.size1x ? (
                          <img
                            src={method.image.svg || method.image.size2x || method.image.size1x}
                            alt=""
                            width={40}
                            height={28}
                            className="h-7 w-10 object-contain"
                          />
                        ) : (
                          <span className="flex h-7 w-10 items-center justify-center rounded bg-surface text-[10px] text-muted">
                            {method.id.slice(0, 3).toUpperCase()}
                          </span>
                        )}
                        <span className="text-[15px] text-ink">{method.description}</span>
                      </label>
                    )
                  })}
                  {!context.data?.paymentMethods?.length && !context.isLoading ? (
                    <p className="text-[14px] text-muted">
                      Er zijn momentieel geen betaalmethoden beschikbaar voor dit land.
                    </p>
                  ) : null}
                  {errors.paymentMethod ? (
                    <p className="text-[13px] text-red-700">{errors.paymentMethod}</p>
                  ) : null}
                </div>
              </Section>

              <Section title="Controleren">
                <div className="space-y-4 text-[14px]">
                  <ReviewBlock
                    title="Contact"
                    onEdit={() =>
                      document.querySelector<HTMLElement>('[data-field="email"]')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      })
                    }
                  >
                    <p>
                      {shipping.firstName} {shipping.lastName}
                    </p>
                    <p className="text-muted">{email}</p>
                    <p className="text-muted">{phone || shipping.phone}</p>
                  </ReviewBlock>
                  <ReviewBlock
                    title="Afleveradres"
                    onEdit={() =>
                      document.querySelector<HTMLElement>('[data-field="street"]')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      })
                    }
                  >
                    <p>
                      {shipping.street} {shipping.houseNumber}
                      {shipping.houseAddition ? ` ${shipping.houseAddition}` : ''}
                    </p>
                    <p>
                      {shipping.postalCode} {shipping.city}
                    </p>
                    <p>{country === 'BE' ? 'België' : 'Nederland'}</p>
                  </ReviewBlock>
                  <ReviewBlock
                    title="Betaling"
                    onEdit={() =>
                      document
                        .querySelector<HTMLElement>('[data-field="paymentMethod"]')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                  >
                    <p>{paymentLabel || 'Nog niet gekozen'}</p>
                  </ReviewBlock>
                </div>

                <label
                  className="mt-5 flex items-start gap-2.5 text-[14px] leading-snug text-ink"
                  data-field="accepted"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={accepted}
                    onChange={(e) => {
                      setAccepted(e.target.checked)
                      setErrors((err) => ({ ...err, accepted: undefined }))
                    }}
                  />
                  <span>
                    Ik ga akkoord met de voorwaarden en begrijp dat ik een betaalverplichting aanga.
                  </span>
                </label>
                {errors.accepted ? (
                  <p className="mt-1 text-[13px] text-red-700">{errors.accepted}</p>
                ) : null}

                <p className="mt-3 text-[12px] leading-relaxed text-muted">
                  <Link to="/algemene-voorwaarden" className="underline-offset-2 hover:text-ink hover:underline">
                    Algemene voorwaarden
                  </Link>
                  {' · '}
                  <Link to="/privacy" className="underline-offset-2 hover:text-ink hover:underline">
                    Privacy
                  </Link>
                  {' · '}
                  <Link to="/retourneren" className="underline-offset-2 hover:text-ink hover:underline">
                    Retourneren / herroeping
                  </Link>
                </p>

                <div className="mt-6">
                  <button
                    type="button"
                    disabled={submitting || quote.isError}
                    onClick={() => void placeOrder()}
                    className="inline-flex h-[50px] w-full items-center justify-center rounded-[9px] bg-brand px-6 text-[15px] font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:min-w-[280px]"
                  >
                    {submitting ? 'Betaling voorbereiden...' : 'Bestelling plaatsen en betalen'}
                  </button>
                  <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted">
                    <LockIcon />
                    Veilig betalen via Mollie
                  </p>
                </div>
              </Section>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-6 rounded-[10px] bg-white p-5 ring-1 ring-line xl:p-6">
                <h2 className="font-heading text-[17px] font-semibold text-navy">Uw bestelling</h2>
                <div className="mt-4">
                  <OrderSummaryBody
                    items={summaryItems}
                    cartImages={cartImages}
                    quote={quote.data}
                    lines={lines}
                  />
                </div>
                {quote.isError ? (
                  <p className="mt-3 text-[13px] text-red-700">
                    Totalen konden niet worden berekend. Vernieuw de pagina of pas de winkelwagen aan.
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        )}
      </Container>
    </main>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[10px] bg-white px-4 py-5 ring-1 ring-line sm:px-5 sm:py-6">
      <h2 className="font-heading text-[17px] font-semibold text-navy">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: ReactNode
}) {
  return (
    <div className="rounded-[8px] bg-surface/80 px-3.5 py-3">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <h3 className="text-[13px] font-medium text-muted">{title}</h3>
        <button type="button" onClick={onEdit} className="text-[13px] text-brand hover:underline">
          Wijzigen
        </button>
      </div>
      <div className="space-y-0.5 text-ink">{children}</div>
    </div>
  )
}

function OrderSummaryBody({
  items,
  cartImages,
  quote,
  lines,
}: {
  items: Array<{
    slug: string
    name: string
    quantity: number
    lineTotalCents: number
    imageRef?: string | null
  }>
  cartImages: Map<string, string>
  quote?: QuoteResult
  lines: CartLine[]
}) {
  return (
    <>
      <ul className="space-y-3">
        {items.map((item) => {
          const image = item.imageRef || cartImages.get(item.slug) || lines.find((l) => l.slug === item.slug)?.image
          return (
            <li key={item.slug} className="flex gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[8px] bg-surface">
                {image ? (
                  <img src={image} alt="" width={56} height={56} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[13px] leading-snug text-ink">{item.name}</p>
                <p className="mt-0.5 text-[12px] text-muted">Aantal {item.quantity}</p>
              </div>
              <p className="shrink-0 text-[13px] font-medium text-ink">
                {formatCentsNl(item.lineTotalCents)}
              </p>
            </li>
          )
        })}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[14px]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Subtotaal</dt>
          <dd>{formatCentsNl(quote?.subtotalCents ?? 0)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Bezorging</dt>
          <dd>
            {quote?.freeShipping
              ? 'Gratis verzending'
              : quote?.shippingPriceKnown
                ? formatCentsNl(quote.shippingCents)
                : 'Wordt berekend'}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Waarvan btw</dt>
          <dd>{formatCentsNl(quote?.vatCents ?? 0)}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-line pt-3 text-[17px] font-semibold text-navy">
          <dt>Totaal</dt>
          <dd>{formatCentsNl(quote?.totalCents ?? 0)}</dd>
        </div>
      </dl>
      {quote ? (
        <FreeShippingProgress
          eligibleSubtotalCents={quote.subtotalCents}
          className="mt-3"
          compact
        />
      ) : null}
      <p className="mt-2 text-[12px] text-muted">Prijzen incl. btw</p>
    </>
  )
}

function inputClass(hasError?: boolean) {
  return cn(
    'mt-1.5 h-12 w-full rounded-[9px] border bg-white px-3.5 text-[15px] text-ink outline-none transition-shadow',
    'focus:border-brand focus:ring-2 focus:ring-brand/20',
    hasError ? 'border-red-400' : 'border-line',
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  optional,
  type = 'text',
  autoComplete,
  inputMode,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  hint?: string
  optional?: boolean
  type?: string
  autoComplete?: string
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  const uid = useId()
  const errorId = `${uid}-error`
  return (
    <label className="block" data-field={id}>
      <span className="text-[13px] font-medium text-ink">
        {label}
        {optional ? <span className="font-normal text-muted"> (optioneel)</span> : null}
      </span>
      <input
        id={uid}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={inputClass(Boolean(error))}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-[13px] text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[12px] text-muted">{hint}</p>
      ) : null}
    </label>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}
