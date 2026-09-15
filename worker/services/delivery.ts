/**
 * Shipping resolution — free shipping from official commerce threshold.
 * Production rates: env / admin site_content (never invent silently).
 * Development-only fallbacks are explicit and never silently used in production.
 */
import type { CheckoutCountry } from '../../shared/checkout'
import {
  commerceConfig,
  deliveryLabelFull,
  qualifiesForFreeShipping,
  resolveStandardShippingCents,
  shippingConfig,
  type ShippingResolutionMode,
} from '../../shared/commerce'
import type { StandardShippingRates } from './shipping-settings'

export type DeliveryMethod = {
  id: string
  label: string
  description: string
  /** Base rate before free-shipping (null = rate not configured). */
  amountCents: number | null
  countries: CheckoutCountry[]
  kind: 'parcel' | 'large_item' | 'supplier_direct' | 'freight' | 'quote'
}

export function buildDeliveryMethods(): DeliveryMethod[] {
  return [
    {
      id: 'standard_nl_be',
      label: 'Bezorging op adres',
      description: deliveryLabelFull(),
      amountCents: null,
      countries: ['NL', 'BE'],
      kind: 'parcel',
    },
  ]
}

function resolveCountryRate(
  country: CheckoutCountry,
  mode: ShippingResolutionMode,
  overrides?: StandardShippingRates | null,
): { cents: number | null; source: string } {
  const override = overrides?.[country]
  if (override != null && Number.isInteger(override) && override >= 0) {
    return { cents: override, source: 'configured' }
  }
  const resolved = resolveStandardShippingCents(country, mode)
  return { cents: resolved.cents, source: resolved.source }
}

export function deliveryMethodsForCountry(
  country: CheckoutCountry,
  mode: ShippingResolutionMode = 'production',
  overrides?: StandardShippingRates | null,
): Array<DeliveryMethod & { amountCents: number | null; rateSource: string }> {
  return buildDeliveryMethods()
    .filter((method) => method.countries.includes(country))
    .map((method) => {
      const resolved = resolveCountryRate(country, mode, overrides)
      return {
        ...method,
        amountCents: resolved.cents,
        rateSource: resolved.source,
      }
    })
}

export function resolveShippingCents(
  methodId: string | undefined,
  country: CheckoutCountry,
  /**
   * Eligible merchandise subtotal in cents (after product discounts, before shipping).
   * Used solely for free-shipping threshold — never trust a client-supplied total.
   */
  eligibleMerchandiseSubtotalCents = 0,
  mode: ShippingResolutionMode = 'production',
  overrides?: StandardShippingRates | null,
): {
  method: DeliveryMethod
  shippingCents: number
  priceKnown: boolean
  freeShipping: boolean
  rateSource: string
  shippingConfigured: boolean
} {
  const methods = deliveryMethodsForCountry(country, mode, overrides)
  const method = methods.find((item) => item.id === methodId) ?? methods[0]
  if (!method) {
    throw new Error('Geen bezorgoptie beschikbaar voor dit land.')
  }

  if (qualifiesForFreeShipping(eligibleMerchandiseSubtotalCents)) {
    return {
      method,
      shippingCents: 0,
      priceKnown: true,
      freeShipping: true,
      rateSource: 'free_shipping_threshold',
      shippingConfigured: true,
    }
  }

  const resolved = resolveCountryRate(country, mode, overrides)
  if (resolved.cents == null) {
    return {
      method,
      shippingCents: 0,
      priceKnown: false,
      freeShipping: false,
      rateSource: resolved.source,
      shippingConfigured: false,
    }
  }

  return {
    method,
    shippingCents: resolved.cents,
    priceKnown: true,
    freeShipping: false,
    rateSource: resolved.source,
    shippingConfigured: true,
  }
}

export function shippingDiagnostics(
  mode: ShippingResolutionMode,
  overrides?: StandardShippingRates | null,
) {
  return {
    thresholdCents: commerceConfig.freeShippingThresholdCents,
    productionRates: {
      NL: overrides?.NL ?? shippingConfig.standardShippingCents.NL,
      BE: overrides?.BE ?? shippingConfig.standardShippingCents.BE,
    },
    developmentFallbackCents: shippingConfig.developmentFallbackCents,
    mode,
    note:
      mode === 'development'
        ? 'Development fallback rates may apply when production rates are unset.'
        : 'Production never uses development fallback rates.',
  }
}
