import { SITE, canonicalUrl } from '@/config/site'

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

/** Toekomst: alleen voor echte D1-producten, nooit voor demo/mock. */
export function productJsonLd(_input: {
  name: string
  slug: string
  description?: string
  sku?: string
  brand?: string
  images?: string[]
}): Record<string, unknown> {
  throw new Error('Product JSON-LD is gereserveerd voor live catalogusdata.')
}

/** Toekomst: Offer op productpagina, gekoppeld aan prijs/voorraad uit API. */
export function offerJsonLd(_input: {
  price: number
  currency: string
  availability: string
  url: string
}): Record<string, unknown> {
  throw new Error('Offer JSON-LD is gereserveerd voor live catalogusdata.')
}

/** Toekomst: kruimelpad op categorie- en productpagina's. */
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

/** Toekomst: FAQPage wanneer echte FAQ-content live staat. */
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
