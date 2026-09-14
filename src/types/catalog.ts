export type CurrencyCode = 'EUR'

export type Money = {
  amount: number
  currency: CurrencyCode
  per?: 'stuk' | 'm2'
}

export type StockStatus = 'in_stock' | 'out_of_stock' | 'backorder' | 'unknown'

export type ProductImage = {
  src: string
  cardSrc?: string
  alt: string
  width?: number
  height?: number
  fit?: 'cover' | 'contain'
}

export type ProductAttributes = Record<string, string | number | boolean | undefined>

export type CatalogProduct = {
  id: string
  slug: string
  name: string
  sku?: string
  gtin?: string
  brand?: string
  category: string
  categoryHref: string
  categorySlug: string
  subcategorySlug: string
  subcategoryName: string
  price: Money | null
  compareAtPrice?: Money | null
  vatRate?: number
  stockStatus?: StockStatus
  leadTime?: string
  supplierId?: string
  images: ProductImage[]
  description?: string
  shortDescription?: string
  attributes: ProductAttributes
  specifications?: Record<string, string>
  isBusinessOnly?: boolean
  isOutlet?: boolean
  isFeatured?: boolean
  priceLabel?: string
  createdAt?: string
  /** Alleen intern voor sortering. Niet tonen als social proof. */
  rankingScore?: number
  synonyms?: string[]
}

export type DemoProduct = CatalogProduct & {
  isDemo: true
}

export type CatalogSort = 'recommended' | 'price-asc' | 'price-desc' | 'newest' | 'popularity'

export type CatalogQuery = {
  q?: string
  categorySlug?: string
  subcategorySlug?: string
  subcategorySlugs?: string[]
  sort?: CatalogSort
  page?: number
  pageSize?: number
  filters?: Record<string, string[]>
  priceMin?: number
  priceMax?: number
  outlet?: boolean
}

export type FacetValue = {
  value: string
  label: string
  count: number
}

export type CatalogQueryResult = {
  items: CatalogProduct[]
  total: number
  page: number
  pageSize: number
  pageCount: number
  facets: Record<string, FacetValue[]>
}
