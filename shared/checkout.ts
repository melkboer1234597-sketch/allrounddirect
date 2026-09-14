export const CHECKOUT_COUNTRIES = ['NL', 'BE'] as const
export type CheckoutCountry = (typeof CHECKOUT_COUNTRIES)[number]

export const CHECKOUT_COUNTRY_LABELS: Record<CheckoutCountry, string> = {
  NL: 'Nederland',
  BE: 'België',
}

export function isCheckoutCountry(value: string): value is CheckoutCountry {
  return (CHECKOUT_COUNTRIES as readonly string[]).includes(value)
}

/** Dutch postcode: 1234 AB (space optional). */
export function isValidNlPostalCode(value: string): boolean {
  return /^\d{4}\s?[A-Za-z]{2}$/.test(value.trim())
}

/** Belgian postcode: 4 digits 1000–9999. */
export function isValidBePostalCode(value: string): boolean {
  const n = Number(value.trim())
  return /^\d{4}$/.test(value.trim()) && n >= 1000 && n <= 9999
}

export function isValidPostalCode(country: CheckoutCountry, value: string): boolean {
  if (country === 'NL') return isValidNlPostalCode(value)
  return isValidBePostalCode(value)
}

export function normalizePostalCode(country: CheckoutCountry, value: string): string {
  const trimmed = value.trim().toUpperCase()
  if (country === 'NL') {
    const m = trimmed.match(/^(\d{4})\s*([A-Z]{2})$/)
    return m ? `${m[1]} ${m[2]}` : trimmed
  }
  return trimmed
}

export type MollieLocale = 'nl_NL' | 'nl_BE' | 'fr_BE'

export function checkoutLocale(country: CheckoutCountry, storefrontLang: 'nl' | 'fr' = 'nl'): MollieLocale {
  if (country === 'NL') return 'nl_NL'
  if (storefrontLang === 'fr') return 'fr_BE'
  return 'nl_BE'
}

/** Preferred display order — still filtered by Mollie availability. */
export const PAYMENT_METHOD_PRIORITY: Record<CheckoutCountry, string[]> = {
  NL: ['ideal', 'creditcard', 'paypal', 'banktransfer', 'bancontact', 'applepay', 'klarna'],
  BE: ['bancontact', 'creditcard', 'paypal', 'banktransfer', 'kbc', 'belfius', 'ideal', 'applepay'],
}

export function sortPaymentMethods<T extends { id: string }>(
  country: CheckoutCountry,
  methods: T[],
): T[] {
  const priority = PAYMENT_METHOD_PRIORITY[country]
  return [...methods].sort((a, b) => {
    const ai = priority.indexOf(a.id)
    const bi = priority.indexOf(b.id)
    const av = ai === -1 ? 999 : ai
    const bv = bi === -1 ? 999 : bi
    return av - bv
  })
}
