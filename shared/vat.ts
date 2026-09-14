/** VAT from VAT-inclusive unit prices (NL/BE retail). */

export function lineVatFromIncl(
  unitInclCents: number,
  quantity: number,
  vatPercent: number,
): { lineTotalCents: number; vatCents: number; exclCents: number } {
  if (!Number.isInteger(unitInclCents) || unitInclCents < 0) {
    throw new Error('Ongeldige eenheidsprijs.')
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error('Ongeldig aantal.')
  }
  if (!Number.isFinite(vatPercent) || vatPercent < 0 || vatPercent > 100) {
    throw new Error('Ongeldig BTW-tarief.')
  }
  const lineTotalCents = unitInclCents * quantity
  const exclCents = Math.round(lineTotalCents / (1 + vatPercent / 100))
  const vatCents = lineTotalCents - exclCents
  return { lineTotalCents, vatCents, exclCents }
}

export function assertValidCheckoutQuantity(quantity: unknown): asserts quantity is number {
  if (!Number.isInteger(quantity) || (quantity as number) < 1 || (quantity as number) > 99) {
    throw new Error('Ongeldig aantal.')
  }
}
