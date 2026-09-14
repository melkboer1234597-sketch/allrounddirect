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
    potentialAction: {
      '@type': 'SearchAction',
      target: `${canonicalUrl('/zoeken')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}
