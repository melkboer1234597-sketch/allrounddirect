import { describe, expect, it } from 'vitest'
import { resolveShippingCents } from '../worker/services/delivery'

describe('resolveShippingCents free shipping', () => {
  it('sets shipping to €0 when merchandise subtotal reaches threshold', () => {
    const result = resolveShippingCents('standard_nl_be', 'NL', 99_900)
    expect(result.freeShipping).toBe(true)
    expect(result.shippingCents).toBe(0)
    expect(result.priceKnown).toBe(true)
  })

  it('does not invent a below-threshold rate', () => {
    const result = resolveShippingCents('standard_nl_be', 'NL', 50_000)
    expect(result.freeShipping).toBe(false)
    expect(result.priceKnown).toBe(false)
    expect(result.shippingCents).toBe(0)
  })
})
