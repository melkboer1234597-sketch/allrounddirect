import { useEffect } from 'react'
import { SITE, canonicalUrl } from '@/config/site'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'

type SeoHeadProps = {
  title?: string
  description?: string
  path: string
  image?: string
  includeWebsiteSchema?: boolean
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

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
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
  title = SITE.defaultTitle,
  description = SITE.defaultDescription,
  path,
  image,
  includeWebsiteSchema = false,
}: SeoHeadProps) {
  useEffect(() => {
    const url = canonicalUrl(path)
    const ogImage = image
      ? image.startsWith('http')
        ? image
        : canonicalUrl(image)
      : canonicalUrl('/favicon.png')

    document.title = title
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertLink('canonical', url)

    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: SITE.locale })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE.name })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage })

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

    upsertJsonLd('jsonld-organization', organizationJsonLd())
    if (includeWebsiteSchema) {
      upsertJsonLd('jsonld-website', websiteJsonLd())
    } else {
      document.getElementById('jsonld-website')?.remove()
    }
  }, [title, description, path, image, includeWebsiteSchema])

  return null
}
