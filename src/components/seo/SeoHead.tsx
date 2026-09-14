import { useEffect } from 'react'
import { SITE, canonicalUrl, type RobotsDirective } from '@/config/site'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'

type SeoHeadProps = {
  title: string
  description: string
  path: string
  image?: string
  imageAlt?: string
  robots?: RobotsDirective
  includeWebsiteSchema?: boolean
  includeOrganizationSchema?: boolean
  extraJsonLd?: Array<{ id: string; data: unknown }>
  ogType?: 'website' | 'article' | 'product'
  preloadImage?: boolean
  prevPath?: string | null
  nextPath?: string | null
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  Object.entries(attributes).forEach(([key, value]) => {
    el?.setAttribute(key, value)
  })
}

function upsertLink(rel: string, href: string | null) {
  const existing = document.head.querySelector(`link[rel="${rel}"]`)
  if (!href) {
    existing?.remove()
    return
  }
  let el = existing
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(id: string, data: unknown) {
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export function SeoHead({
  title,
  description,
  path,
  image,
  imageAlt,
  robots = 'index,follow',
  includeWebsiteSchema = false,
  includeOrganizationSchema = true,
  extraJsonLd = [],
  ogType = 'website',
  preloadImage = false,
  prevPath = null,
  nextPath = null,
}: SeoHeadProps) {
  useEffect(() => {
    const url = canonicalUrl(path)
    const ogImage = image
      ? image.startsWith('http')
        ? image
        : canonicalUrl(image)
      : canonicalUrl('/media/branding/allround-direct-logo-primary.png')

    document.title = title
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots })
    upsertMeta('meta[name="googlebot"]', { name: 'googlebot', content: robots })
    upsertLink('canonical', url)
    upsertLink('prev', prevPath ? canonicalUrl(prevPath) : null)
    upsertLink('next', nextPath ? canonicalUrl(nextPath) : null)

    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: ogType })
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: SITE.locale })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE.name })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage })
    if (imageAlt) {
      upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: imageAlt })
    }

    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage })

    if (includeOrganizationSchema) {
      upsertJsonLd('jsonld-organization', organizationJsonLd())
    } else {
      document.getElementById('jsonld-organization')?.remove()
    }

    if (includeWebsiteSchema) {
      upsertJsonLd('jsonld-website', websiteJsonLd())
    } else {
      document.getElementById('jsonld-website')?.remove()
    }

    extraJsonLd.forEach((item) => upsertJsonLd(item.id, item.data))

    const preloadId = 'lcp-preload'
    document.getElementById(preloadId)?.remove()
    if (preloadImage && image) {
      const link = document.createElement('link')
      link.id = preloadId
      link.rel = 'preload'
      link.as = 'image'
      link.href = image.startsWith('http') ? image : image
      link.setAttribute('fetchpriority', 'high')
      document.head.appendChild(link)
    }
  }, [
    title,
    description,
    path,
    image,
    imageAlt,
    robots,
    includeWebsiteSchema,
    includeOrganizationSchema,
    JSON.stringify(extraJsonLd),
    ogType,
    preloadImage,
    prevPath,
    nextPath,
  ])

  return null
}
