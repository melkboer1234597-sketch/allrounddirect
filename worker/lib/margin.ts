export function priceExclCents(priceInclCents: number | null | undefined, vatPercent: number) {
  if (priceInclCents == null) return null
  return Math.round(priceInclCents / (1 + vatPercent / 100))
}

export function marginFrom(
  priceInclCents: number | null,
  vatPercent: number,
  costPriceCents: number | null,
) {
  const excl = priceExclCents(priceInclCents, vatPercent)
  if (excl == null || costPriceCents == null) {
    return { priceExclCents: excl, costPriceCents, marginCents: null, marginPercent: null }
  }
  const marginCents = excl - costPriceCents
  const marginPercent = excl === 0 ? null : Math.round((marginCents / excl) * 1000) / 10
  return { priceExclCents: excl, costPriceCents, marginCents, marginPercent }
}
