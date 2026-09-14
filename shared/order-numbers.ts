export function formatOrderNumber(year: number, sequence: number): string {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error('Ongeldig jaar voor ordernummer.')
  }
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 999999) {
    throw new Error('Ongeldige ordernummer-reeks.')
  }
  return `ARD-${year}-${String(sequence).padStart(6, '0')}`
}

export function parseOrderNumber(value: string): { year: number; sequence: number } | null {
  const m = /^ARD-(\d{4})-(\d{6})$/.exec(value.trim())
  if (!m) return null
  return { year: Number(m[1]), sequence: Number(m[2]) }
}
