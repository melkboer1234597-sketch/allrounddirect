import { mediaPublicPath, mediaVariantPath } from '../../shared/media'

type ProductRow = {
  id: string
  slug: string
  name: string
  sku: string | null
  ean: string | null
  brandId: string | null
  categoryId: string | null
  subcategoryId: string | null
  priceInclCents: number | null
  compareAtInclCents: number | null
  vatPercent: number
  stockStatus: string
  leadTimeMinDays: number | null
  leadTimeMaxDays: number | null
  isBusinessOnly: boolean
  isOutlet: boolean
  createdAt: Date
}

type ImageRow = {
  productId: string
  url: string
  alt: string | null
  sortOrder: number
  r2Key: string | null
  width: number | null
  height: number | null
}

type CategoryRow = { id: string; name: string; slug: string }
type BrandRow = { id: string; name: string }

export function toCatalogProduct(
  product: ProductRow,
  images: ImageRow[],
  category: CategoryRow | undefined,
  subcategory: CategoryRow | undefined,
  brand: BrandRow | undefined,
) {
  const parent = category
  const child = subcategory ?? category
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder)
  const categorySlug = parent?.slug ?? child?.slug ?? 'assortiment'
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    sku: product.sku ?? undefined,
    gtin: product.ean ?? undefined,
    brand: brand?.name,
    category: parent?.name ?? child?.name ?? 'Assortiment',
    categoryHref:
      parent && child && parent.slug !== child.slug
        ? `/${parent.slug}/${child.slug}`
        : `/${categorySlug}`,
    categorySlug,
    subcategorySlug: child?.slug ?? categorySlug,
    subcategoryName: child?.name ?? parent?.name ?? 'Assortiment',
    price:
      product.priceInclCents != null
        ? { amount: product.priceInclCents / 100, currency: 'EUR' as const }
        : null,
    compareAtPrice:
      product.compareAtInclCents != null
        ? { amount: product.compareAtInclCents / 100, currency: 'EUR' as const }
        : null,
    vatRate: product.vatPercent,
    stockStatus: product.stockStatus,
    leadTime:
      product.leadTimeMinDays != null
        ? `${product.leadTimeMinDays}-${product.leadTimeMaxDays ?? product.leadTimeMinDays} dagen`
        : undefined,
    images: sorted.map((image) => ({
      src: image.r2Key ? mediaPublicPath(image.r2Key) : image.url,
      alt: image.alt || product.name,
      width: image.width ?? undefined,
      height: image.height ?? undefined,
      fit: 'contain' as const,
    })),
    attributes: {},
    isBusinessOnly: product.isBusinessOnly,
    isOutlet: product.isOutlet,
    createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : undefined,
  }
}

export function cardImageUrl(image: ImageRow | undefined): string | null {
  if (!image) return null
  if (image.r2Key) return mediaVariantPath(image.r2Key, 'card')
  return image.url
}
