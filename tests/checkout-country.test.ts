import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  CHECKOUT_COUNTRIES,
  checkoutLocale,
  isCheckoutCountry,
  isValidPostalCode,
  normalizePostalCode,
  sortPaymentMethods,
} from '../shared/checkout'
import { resolveCheckoutCountry, suggestCheckoutCountry } from '../shared/geo-country'
import { deliveryMethodsForCountry, resolveShippingCents } from '../worker/services/delivery'

const linesSchema = z
  .array(
    z
      .object({
        productId: z.string().optional(),
        slug: z.string().optional(),
        quantity: z.number().int().min(1).max(99),
      })
      .strict(),
  )
  .min(1)
  .max(50)

describe('country selection matrix', () => {
  it('supports only NL and BE', () => {
    expect(CHECKOUT_COUNTRIES).toEqual(['NL', 'BE'])
    expect(isCheckoutCountry('DE')).toBe(false)
  })

  it('uses CF country as suggestion only', () => {
    expect(suggestCheckoutCountry('BE')).toBe('BE')
    expect(suggestCheckoutCountry('NL')).toBe('NL')
    expect(suggestCheckoutCountry(undefined)).toBe('NL')
    expect(suggestCheckoutCountry('DE')).toBe('NL')
  })

  it('lets shipping country override CF prediction NL→BE', () => {
    const resolved = resolveCheckoutCountry('NL', 'BE')
    expect(resolved.suggested).toBe('NL')
    expect(resolved.country).toBe('BE')
  })

  it('lets shipping country override CF prediction BE→NL', () => {
    const resolved = resolveCheckoutCountry('BE', 'NL')
    expect(resolved.suggested).toBe('BE')
    expect(resolved.country).toBe('NL')
  })

  it('falls back to suggestion when override invalid / missing geo', () => {
    expect(resolveCheckoutCountry(undefined, 'XX').country).toBe('NL')
    expect(resolveCheckoutCountry(undefined, undefined).country).toBe('NL')
  })

  it('maps Mollie locales per country', () => {
    expect(checkoutLocale('NL')).toBe('nl_NL')
    expect(checkoutLocale('BE')).toBe('nl_BE')
    expect(checkoutLocale('BE', 'fr')).toBe('fr_BE')
  })

  it('validates and normalizes postal codes', () => {
    expect(isValidPostalCode('NL', '1234AB')).toBe(true)
    expect(isValidPostalCode('NL', '1234 AB')).toBe(true)
    expect(isValidPostalCode('BE', '1000')).toBe(true)
    expect(isValidPostalCode('BE', '0999')).toBe(false)
    expect(normalizePostalCode('NL', '1234ab')).toBe('1234 AB')
  })
})

describe('payment-method mapping', () => {
  it('prioritizes iDEAL for NL and Bancontact for BE', () => {
    const methods = [
      { id: 'paypal' },
      { id: 'ideal' },
      { id: 'bancontact' },
      { id: 'creditcard' },
    ]
    expect(sortPaymentMethods('NL', methods).map((m) => m.id)[0]).toBe('ideal')
    expect(sortPaymentMethods('BE', methods).map((m) => m.id)[0]).toBe('bancontact')
  })

  it('does not invent methods — only sorts provided list', () => {
    const only = [{ id: 'creditcard' }]
    expect(sortPaymentMethods('NL', only)).toEqual(only)
  })
})

describe('delivery / shipping country', () => {
  it('exposes methods for NL and BE', () => {
    expect(deliveryMethodsForCountry('NL').length).toBeGreaterThan(0)
    expect(deliveryMethodsForCountry('BE').length).toBeGreaterThan(0)
  })

  it('does not invent shipping prices when unconfigured', () => {
    const resolved = resolveShippingCents('standard_nl_be', 'NL')
    expect(resolved.shippingCents).toBe(0)
    expect(resolved.priceKnown).toBe(false)
  })
})

describe('cart attack schema rejection', () => {
  it('rejects negative, zero, and oversized quantities', () => {
    expect(linesSchema.safeParse([{ slug: 'x', quantity: 0 }]).success).toBe(false)
    expect(linesSchema.safeParse([{ slug: 'x', quantity: -1 }]).success).toBe(false)
    expect(linesSchema.safeParse([{ slug: 'x', quantity: 999999 }]).success).toBe(false)
  })

  it('rejects manipulated client price fields (strict)', () => {
    const attack = linesSchema.safeParse([
      { slug: 'sofa', quantity: 1, unitPriceCents: 1, totalCents: 1 },
    ])
    expect(attack.success).toBe(false)
  })

  it('accepts honest lines without client prices', () => {
    expect(linesSchema.safeParse([{ slug: 'sofa', quantity: 2 }]).success).toBe(true)
  })
})
