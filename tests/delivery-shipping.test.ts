import { describe, expect, it } from 'vitest'
import { resolveShippingCents } from '../worker/services/delivery'

describe('resolveShippingCents free shipping', () => {
  it('sets shipping to €0 when merchandise subtotal reaches threshold', () => {
    const result = resolveShippingCents('standard_nl_be', 'NL', 99_900, 'development')
    expect(result.freeShipping).toBe(true)
    expect(result.shippingCents).toBe(0)
    expect(result.priceKnown).toBe(true)
  })

  it('uses development fallback rate below threshold', () => {
    const result = resolveShippingCents('standard_nl_be', 'NL', 50_000, 'development')
    expect(result.freeShipping).toBe(false)
    expect(result.priceKnown).toBe(true)
    expect(result.shippingCents).toBe(695)
    expect(result.rateSource).toBe('development_fallback')
  })

  it('does not invent a production rate when unconfigured', () => {
    const result = resolveShippingCents('standard_nl_be', 'NL', 50_000, 'production')
    expect(result.freeShipping).toBe(false)
    expect(result.priceKnown).toBe(false)
    expect(result.shippingConfigured).toBe(false)
  })

  it('BE development fallback differs from NL', () => {
    const result = resolveShippingCents('standard_nl_be', 'BE', 50_000, 'development')
    expect(result.shippingCents).toBe(995)
  })
})
