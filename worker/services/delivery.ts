/**
 * Shipping resolution — free shipping from official commerce threshold.
 * Below-threshold rates: only when configured; never invent a fake fee.
 */
import type { CheckoutCountry } from '../../shared/checkout'
import {
  commerceConfig,
  qualifiesForFreeShipping,
} from '../../shared/commerce'

export type DeliveryMethod = {
  id: string
  label: string
  description: string
  /** Integer cents when known. null = not configured (honest unknown below threshold). */
  amountCents: number | null
  countries: CheckoutCountry[]
  kind: 'parcel' | 'large_item' | 'supplier_direct' | 'freight' | 'quote'
}

export const DELIVERY_METHODS: DeliveryMethod[] = [
  {
    id: 'standard_nl_be',
    label: 'Bezorging op afleveradres',
    description: `Standaard levering in ${commerceConfig.supportedCountries.join(' en ')}. ${commerceConfig.standardDeliveryMinBusinessDays}-${commerceConfig.standardDeliveryMaxBusinessDays} werkdagen.`,
    amountCents: null,
    countries: ['NL', 'BE'],
    kind: 'supplier_direct',
  },
  {
    id: 'large_item',
    label: 'Groot artikel / maatwerk levering',
    description: 'Voor meubels en grote apparatuur. Planning in overleg.',
    amountCents: null,
    countries: ['NL', 'BE'],
    kind: 'large_item',
  },
]

export function deliveryMethodsForCountry(country: CheckoutCountry): DeliveryMethod[] {
  return DELIVERY_METHODS.filter((method) => method.countries.includes(country))
}

export function resolveShippingCents(
  methodId: string | undefined,
  country: CheckoutCountry,
  /**
   * Eligible merchandise subtotal in cents (after product discounts, before shipping).
   * Used solely for free-shipping threshold — never trust a client-supplied total.
   */
  eligibleMerchandiseSubtotalCents = 0,
): {
  method: DeliveryMethod
  shippingCents: number
  priceKnown: boolean
  freeShipping: boolean
} {
  const methods = deliveryMethodsForCountry(country)
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
    }
  }

  if (method.amountCents == null) {
    return { method, shippingCents: 0, priceKnown: false, freeShipping: false }
  }
  return {
    method,
    shippingCents: method.amountCents,
    priceKnown: true,
    freeShipping: false,
  }
}
