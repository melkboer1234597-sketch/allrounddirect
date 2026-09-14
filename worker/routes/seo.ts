import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { ROBOTS_DISALLOW } from '../../shared/seo-routes'
import { SEO_REDIRECTS } from '../../shared/redirects'
import {
  categorySitemapUrls,
  contentSitemapUrls,
  productSitemapChunks,
  sitemapIndexFiles,
  sitemapIndexXml,
  staticSitemapUrls,
  urlsetXml,
} from '../../shared/sitemaps'
import { createDb } from '../db'
import { products } from '../db/schema'
import type { AppEnv } from '../types'

export const seoRoutes = new Hono<AppEnv>()

function originOf(url: string): string {
  return new URL(url).origin
}

function xmlResponse(body: string) {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}

for (const redirect of SEO_REDIRECTS) {
  seoRoutes.get(redirect.from, (c) => c.redirect(redirect.to, redirect.status))
}

seoRoutes.get('/sitemap.xml', async (c) => {
  const slugs = await loadIndexableProductSlugs(c.env)
  const chunks = productSitemapChunks(slugs)
  return xmlResponse(sitemapIndexXml(originOf(c.req.url), sitemapIndexFiles(chunks.length)))
})

seoRoutes.get('/sitemap-static.xml', (c) => {
  return xmlResponse(urlsetXml(originOf(c.req.url), staticSitemapUrls()))
})

seoRoutes.get('/sitemap-categories.xml', (c) => {
  return xmlResponse(urlsetXml(originOf(c.req.url), categorySitemapUrls()))
})

seoRoutes.get('/sitemap-content.xml', (c) => {
  return xmlResponse(urlsetXml(originOf(c.req.url), contentSitemapUrls()))
})

seoRoutes.get('/sitemap-products.xml', async (c) => {
  const slugs = await loadIndexableProductSlugs(c.env)
  const chunks = productSitemapChunks(slugs)
  if (chunks.length > 1) {
    const files = sitemapIndexFiles(chunks.length).filter((file) =>
      file.startsWith('sitemap-products-'),
    )
    return xmlResponse(sitemapIndexXml(originOf(c.req.url), files))
  }
  const urls = chunks[0].map((slug) => ({
    path: `/product/${slug}`,
    changefreq: 'weekly' as const,
    priority: 0.6,
  }))
  return xmlResponse(urlsetXml(originOf(c.req.url), urls))
})

seoRoutes.get('/sitemap-products-:chunk.xml', async (c) => {
  const chunk = Number(c.req.param('chunk'))
  if (!Number.isInteger(chunk) || chunk < 1) {
    return c.body('Not found', 404)
  }
  const slugs = await loadIndexableProductSlugs(c.env)
  const chunks = productSitemapChunks(slugs)
  const selected = chunks[chunk - 1]
  if (!selected) {
    return c.body('Not found', 404)
  }
  const urls = selected.map((slug) => ({
    path: `/product/${slug}`,
    changefreq: 'weekly' as const,
    priority: 0.6,
  }))
  return xmlResponse(urlsetXml(originOf(c.req.url), urls))
})

seoRoutes.get('/robots.txt', (c) => {
  const origin = originOf(c.req.url)
  const disallow = ROBOTS_DISALLOW.map((path) => `Disallow: ${path}`).join('\n')
  const body = `# robots.txt stuurt crawlers; het is geen beveiliging.
User-agent: *
Allow: /
${disallow}

# Filterquery's niet als primaire landings. Paginatie (?page=) mag gecrawld worden.
# Indexatie van filters wordt via meta robots noindex,follow afgedwongen.

Sitemap: ${origin}/sitemap.xml
`
  return c.text(body)
})

async function loadIndexableProductSlugs(env: AppEnv['Bindings']): Promise<string[]> {
  try {
    const db = createDb(env)
    const rows = await db
      .select({
        slug: products.slug,
        status: products.status,
        robots: products.robots,
      })
      .from(products)
      .where(eq(products.status, 'active'))

    return rows
      .filter((row) => {
        const robots = (row.robots ?? 'index,follow').toLowerCase()
        return !robots.includes('noindex')
      })
      .map((row) => row.slug)
  } catch {
    return []
  }
}
