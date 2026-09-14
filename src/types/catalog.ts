export type CurrencyCode = 'EUR'

export type Money = {
  amount: number
  currency: CurrencyCode
  per?: 'stuk' | 'm2'
}

export type StockStatus = 'in_stock' | 'out_of_stock' | 'backorder' | 'unknown'

export type ProductImage = {
  src: string
  alt: string
  width?: number
  height?: number
}

/**
 * Canonieke productvorm voor UI + toekomstige Worker/D1/R2-koppeling.
 * Demo-records gebruiken dezelfde velden; ontbrekende velden blijven undefined.
 */
export type CatalogProduct = {
  id: string
  slug: string
  name: string
  sku?: string
  brand?: string
  category: string
  categoryHref: string
  price: Money | null
  compareAtPrice?: Money | null
  vatRate?: number
  stockStatus?: StockStatus
  leadTime?: string
  supplierId?: string
  images: ProductImage[]
  specifications?: Record<string, string>
  isBusinessOnly?: boolean
  isOutlet?: boolean
  priceLabel?: string
}

/** Alleen layout/ontwikkeling. Niet indexeren, geen Product JSON-LD. */
export type DemoProduct = CatalogProduct & {
  isDemo: true
}
