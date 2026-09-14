/** Integer cents — never use floats as authoritative money. */

export function eurosToCents(euros: number): number {
  if (!Number.isFinite(euros)) throw new Error('Ongeldig bedrag.')
  return Math.round(euros * 100)
}

export function centsToEuros(cents: number): number {
  return cents / 100
}

/** Mollie amount.value format: "187.89" */
export function centsToMollieValue(cents: number): string {
  if (!Number.isInteger(cents) || cents < 0) throw new Error('Bedrag in centen moet een niet-negatief geheel getal zijn.')
  return (cents / 100).toFixed(2)
}

export function mollieValueToCents(value: string): number {
  const n = Number.parseFloat(value)
  if (!Number.isFinite(n)) throw new Error('Ongeldige Mollie amount.value.')
  return Math.round(n * 100)
}

export function formatCentsNl(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency }).format(cents / 100)
}

export function addCents(...parts: number[]): number {
  return parts.reduce((sum, part) => sum + part, 0)
}
