import { describe, expect, it } from 'vitest'
import { preferredPaymentMethodId, sortPaymentMethods } from '../shared/checkout'

describe('payment method preference', () => {
  it('prefers iDEAL for NL when available', () => {
    expect(
      preferredPaymentMethodId('NL', [
        { id: 'paypal' },
        { id: 'ideal' },
        { id: 'creditcard' },
      ]),
    ).toBe('ideal')
  })

  it('prefers Bancontact for BE when available', () => {
    expect(
      preferredPaymentMethodId('BE', [
        { id: 'creditcard' },
        { id: 'bancontact' },
        { id: 'paypal' },
      ]),
    ).toBe('bancontact')
  })

  it('auto-selects the only method', () => {
    expect(preferredPaymentMethodId('NL', [{ id: 'paypal' }])).toBe('paypal')
  })

  it('sorts NL methods with iDEAL first', () => {
    expect(sortPaymentMethods('NL', [{ id: 'paypal' }, { id: 'ideal' }]).map((m) => m.id)).toEqual([
      'ideal',
      'paypal',
    ])
  })
})
