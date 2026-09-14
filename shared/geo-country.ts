import type { CheckoutCountry } from './checkout'
import { isCheckoutCountry } from './checkout'

/** Cloudflare `cf.country` is a suggestion only — never locks shipping country. */
export function suggestCheckoutCountry(cfCountry: string | null | undefined): CheckoutCountry {
  if (cfCountry === 'BE') return 'BE'
  if (cfCountry === 'NL') return 'NL'
  return 'NL'
}

/** Query/body override wins over CF suggestion when valid. */
export function resolveCheckoutCountry(
  cfCountry: string | null | undefined,
  override: string | null | undefined,
): { suggested: CheckoutCountry; country: CheckoutCountry } {
  const suggested = suggestCheckoutCountry(cfCountry)
  const country = isCheckoutCountry(override ?? '') ? (override as CheckoutCountry) : suggested
  return { suggested, country }
}
