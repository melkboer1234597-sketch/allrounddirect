import { SITE, canonicalUrl } from '@/config/site'
import type { StockStatus } from '@/types/catalog'

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    legalName: SITE.legalName,
    url: canonicalUrl('/'),
    logo: canonicalUrl('/media/branding/allround-direct-logo-primary.png'),
    description: SITE.defaultDescription,
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: canonicalUrl('/'),
    inLanguage: 'nl-NL',
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${canonicalUrl('/zoeken')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

const AVAILABILITY: Partial<Record<StockStatus, string>> = {
  in_stock: 'https://schema.org/InStock',
  out_of_stock: 'https://schema.org/OutOfStock',
  backorder: 'https://schema.org/BackOrder',
}

export type LiveProductSchemaInput = {
  name: string
  slug: string
  description?: string
  sku?: string
  gtin?: string
  brand?: string
  images?: string[]
  price?: { amount: number; currency: string } | null
  stockStatus?: StockStatus
}

/**
 * Alleen voor live catalogusproducten. Geen demo, geen verzonnen reviews, geen Offer zonder prijs.
 */
export function productJsonLd(input: LiveProductSchemaInput): Record<string, unknown> | null {
  const url = canonicalUrl(`/product/${input.slug}`)
  const images = (input.images ?? [])
    .map((src) => (src.startsWith('http') ? src : canonicalUrl(src)))
    .filter(Boolean)

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    url,
  }
  if (input.description) data.description = input.description
  if (input.sku) data.sku = input.sku
  if (input.gtin) data.gtin13 = input.gtin
  if (input.brand) data.brand = { '@type': 'Brand', name: input.brand }
  if (images.length) data.image = images

  if (input.price && input.price.amount > 0) {
    const offer: Record<string, unknown> = {
      '@type': 'Offer',
      url,
      priceCurrency: input.price.currency,
      price: input.price.amount.toFixed(2),
    }
    const availability = input.stockStatus ? AVAILABILITY[input.stockStatus] : undefined
    if (availability) offer.availability = availability
    data.offers = offer
  }

  return data
}

export function collectionPageJsonLd(input: { name: string; path: string; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: canonicalUrl(input.path),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE.name,
      url: canonicalUrl('/'),
    },
  }
}

export function breadcrumbListJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  }
}

export function faqPageJsonLd(entries: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  }
}

export function articleJsonLd(input: {
  title: string
  description: string
  path: string
  datePublished?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    inLanguage: 'nl-NL',
    mainEntityOfPage: canonicalUrl(input.path),
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: {
        '@type': 'ImageObject',
        url: canonicalUrl('/media/branding/allround-direct-logo-primary.png'),
      },
    },
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
  }
}
