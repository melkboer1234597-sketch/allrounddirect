export type MoneyDisplay = {
  amount: number
  currency: 'EUR'
  per?: 'stuk' | 'm2'
} | null

export type DemoProduct = {
  /** DEMO/MOCK: later vervangen door D1/API-records. */
  id: string
  slug: string
  name: string
  category: string
  categoryHref: string
  image: string
  imageAlt: string
  price: MoneyDisplay
  priceLabel?: string
  isDemo: true
}
