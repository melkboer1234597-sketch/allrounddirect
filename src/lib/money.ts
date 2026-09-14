import type { CatalogProduct, Money } from '@/types/catalog'

export function formatMoney(money: Money): string {
  const formatted = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: money.amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(money.amount)

  if (money.per === 'm2') return `${formatted} per m²`
  return formatted
}

export function formatProductPrice(product: Pick<CatalogProduct, 'price' | 'priceLabel'>): string {
  if (product.priceLabel) return product.priceLabel
  if (!product.price) return 'Prijs op aanvraag'
  return formatMoney(product.price)
}
