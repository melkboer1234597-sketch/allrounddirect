import { describe, expect, it } from 'vitest'
import {
  commerceConfig,
  deliveryLabelFull,
  deliveryLabelShort,
  freeShippingProgress,
  freeShippingThresholdLabel,
  qualifiesForFreeShipping,
  resolveStorefrontDelivery,
} from '../shared/commerce'

describe('commerce policy', () => {
  it('exposes official delivery and free-shipping config', () => {
    expect(commerceConfig.standardDeliveryMinBusinessDays).toBe(1)
    expect(commerceConfig.standardDeliveryMaxBusinessDays).toBe(3)
    expect(commerceConfig.freeShippingThresholdCents).toBe(99_900)
    expect(commerceConfig.supportedCountries).toEqual(['NL', 'BE'])
  })

  it('formats Dutch delivery and free-shipping labels', () => {
    expect(deliveryLabelFull()).toBe('Levering binnen 1 tot 3 werkdagen')
    expect(deliveryLabelShort()).toBe('1-3 werkdagen')
    expect(freeShippingThresholdLabel()).toContain('999')
  })

  it('qualifies free shipping on eligible merchandise subtotal only', () => {
    expect(qualifiesForFreeShipping(99_899)).toBe(false)
    expect(qualifiesForFreeShipping(99_900)).toBe(true)
    expect(qualifiesForFreeShipping(120_000)).toBe(true)
  })

  it('builds free-shipping progress copy', () => {
    const below = freeShippingProgress(87_450)
    expect(below.reached).toBe(false)
    expect(below.remainingCents).toBe(12_450)
    expect(below.message).toMatch(/Nog .+124,50 voor gratis verzending/)

    const reached = freeShippingProgress(99_900)
    expect(reached.reached).toBe(true)
    expect(reached.message).toBe('U profiteert van gratis verzending')
  })

  it('resolves storefront delivery without product overrides for now', () => {
    const resolved = resolveStorefrontDelivery({
      overrideEnabled: false,
      minBusinessDays: 14,
      maxBusinessDays: 28,
    })
    expect(resolved).toEqual({
      minBusinessDays: 1,
      maxBusinessDays: 3,
      unit: 'business_days',
      labelFull: 'Levering binnen 1 tot 3 werkdagen',
      labelShort: '1-3 werkdagen',
    })
  })
})
