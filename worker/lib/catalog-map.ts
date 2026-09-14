import { mediaPublicPath, mediaVariantPath } from '../../shared/media'
import { resolveStorefrontDelivery } from '../../shared/commerce'
import { resolveCardImageFit } from '../../shared/product-presentation'

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
  isFeatured?: boolean
  createdAt: Date
  description: string | null
  shortDescription: string | null
  specificationsJson?: string | null
  priceOnRequest?: boolean
}

type ImageRow = {
  productId: string
  url: string
  alt: string | null
  sortOrder: number
  r2Key: string | null
  width: number | null
  height: number | null
  imageStatus?: string | null
}

type CategoryRow = { id: string; name: string; slug: string }
type BrandRow = { id: string; name: string }

const FAKE_BRAND =
  /^(salontafel|eettafel|stoel|bank|hoekbank|kast|bed|deur|tafel|meubel|sofa|fauteuil|wasmachine|ombouwkast)/i

function sanitizeBrand(name?: string): string | undefined {
  if (!name?.trim()) return undefined
  const trimmed = name.trim()
  if (FAKE_BRAND.test(trimmed)) return undefined
  if (/umbauschrank|waschmaschine|umbau/i.test(trimmed)) return undefined
  if (trimmed.length > 40 && /[äöüß]/i.test(trimmed)) return undefined
  return trimmed
}

export function toCatalogProduct(
  product: ProductRow,
  images: ImageRow[],
  category: CategoryRow | undefined,
  subcategory: CategoryRow | undefined,
  brand: BrandRow | undefined,
) {
  const parent = category
  const child = subcategory ?? category
  const sorted = [...images]
    .filter((image) => !image.imageStatus || image.imageStatus === 'ok')
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const categorySlug = parent?.slug ?? child?.slug ?? 'assortiment'
  const subcategorySlug = child?.slug ?? categorySlug
  let specifications: Record<string, string> = {}
  if (product.specificationsJson) {
    try {
      const parsed = JSON.parse(product.specificationsJson) as Record<string, string>
      if (parsed && typeof parsed === 'object') specifications = parsed
    } catch {
      specifications = {}
    }
  }
  const priceOnRequest = Boolean(product.priceOnRequest) || product.priceInclCents == null
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    sku: product.sku ?? undefined,
    gtin: product.ean ?? undefined,
    brand: sanitizeBrand(brand?.name),
    category: parent?.name ?? child?.name ?? 'Assortiment',
    categoryHref:
      parent && child && parent.slug !== child.slug
        ? `/${parent.slug}/${child.slug}`
        : `/${categorySlug}`,
    categorySlug,
    subcategorySlug,
    subcategoryName: child?.name ?? parent?.name ?? 'Assortiment',
    price:
      !priceOnRequest && product.priceInclCents != null
        ? { amount: product.priceInclCents / 100, currency: 'EUR' as const }
        : null,
    priceLabel: priceOnRequest ? 'Prijs op aanvraag' : undefined,
    compareAtPrice:
      product.compareAtInclCents != null
        ? { amount: product.compareAtInclCents / 100, currency: 'EUR' as const }
        : null,
    vatRate: product.vatPercent,
    stockStatus: product.stockStatus,
    // Official store policy — scraped lead times must not override storefront copy.
    leadTime: resolveStorefrontDelivery().labelShort,
    leadTimeMinDays: resolveStorefrontDelivery().minBusinessDays,
    leadTimeMaxDays: resolveStorefrontDelivery().maxBusinessDays,
    images: sorted.map((image) => {
      const full = image.r2Key ? mediaPublicPath(image.r2Key) : image.url
      const fit = resolveCardImageFit({
        categorySlug,
        subcategorySlug,
        alt: image.alt || product.name,
        name: product.name,
        width: image.width,
        height: image.height,
      })
      return {
        src: full,
        cardSrc: image.r2Key ? mediaVariantPath(image.r2Key, 'card') : full,
        alt: image.alt || product.name,
        width: image.width ?? undefined,
        height: image.height ?? undefined,
        fit,
      }
    }),
    description: product.description ?? undefined,
    shortDescription: product.shortDescription ?? undefined,
    attributes: specifications,
    specifications,
    isBusinessOnly: product.isBusinessOnly,
    isOutlet: product.isOutlet,
    isFeatured: Boolean(product.isFeatured),
    createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : undefined,
  }
}

export function cardImageUrl(image: ImageRow | undefined): string | null {
  if (!image) return null
  if (image.r2Key) return mediaVariantPath(image.r2Key, 'card')
  return image.url
}
