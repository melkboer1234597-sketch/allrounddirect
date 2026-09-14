import { describe, expect, it } from 'vitest'
import {
  addCents,
  centsToMollieValue,
  eurosToCents,
  formatCentsNl,
  mollieValueToCents,
} from '../shared/money'
import { lineVatFromIncl, assertValidCheckoutQuantity } from '../shared/vat'

describe('money', () => {
  it('converts euros to integer cents with rounding', () => {
    expect(eurosToCents(10)).toBe(1000)
    expect(eurosToCents(19.99)).toBe(1999)
    // Document float hazard: 1.005 is not exact in IEEE754; callers must prefer integer cents.
    expect(eurosToCents(1.005)).toBe(Math.round(1.005 * 100))
    expect(eurosToCents(0.1 + 0.2)).toBe(30)
  })

  it('rejects non-finite euros', () => {
    expect(() => eurosToCents(Number.NaN)).toThrow()
  })

  it('formats Mollie amount values without floats as authority', () => {
    expect(centsToMollieValue(18789)).toBe('187.89')
    expect(centsToMollieValue(0)).toBe('0.00')
    expect(() => centsToMollieValue(-1)).toThrow()
    expect(() => centsToMollieValue(1.5)).toThrow()
  })

  it('parses Mollie amount.value back to cents', () => {
    expect(mollieValueToCents('187.89')).toBe(18789)
    expect(mollieValueToCents('10.00')).toBe(1000)
  })

  it('adds cents as integers', () => {
    expect(addCents(100, 21, 0, -10)).toBe(111)
  })

  it('formats NL currency', () => {
    expect(formatCentsNl(12900)).toMatch(/129/)
  })
})

describe('VAT from inclusive prices', () => {
  it('extracts 21% VAT from inclusive line total', () => {
    const result = lineVatFromIncl(12100, 1, 21)
    expect(result.lineTotalCents).toBe(12100)
    expect(result.exclCents).toBe(10000)
    expect(result.vatCents).toBe(2100)
  })

  it('scales with quantity', () => {
    const result = lineVatFromIncl(12100, 2, 21)
    expect(result.lineTotalCents).toBe(24200)
    expect(result.vatCents).toBe(4200)
  })

  it('handles 9% reduced rate', () => {
    const result = lineVatFromIncl(10900, 1, 9)
    expect(result.exclCents).toBe(10000)
    expect(result.vatCents).toBe(900)
  })

  it('rejects invalid quantity and prices', () => {
    expect(() => lineVatFromIncl(-1, 1, 21)).toThrow()
    expect(() => lineVatFromIncl(100, 0, 21)).toThrow()
    expect(() => assertValidCheckoutQuantity(0)).toThrow()
    expect(() => assertValidCheckoutQuantity(-3)).toThrow()
    expect(() => assertValidCheckoutQuantity(100)).toThrow()
    expect(() => assertValidCheckoutQuantity(1.5)).toThrow()
    expect(() => assertValidCheckoutQuantity(999999)).toThrow()
  })
})
