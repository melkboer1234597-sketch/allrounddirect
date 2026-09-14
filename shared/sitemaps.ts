import { CONTENT_SITEMAP_PATHS, STATIC_SITEMAP_ENTRIES } from './seo-routes.ts'
import { categorySitemapPaths } from './taxonomy-paths.ts'
import { SITEMAP_CHUNK_LIMIT } from './redirects.ts'

export type SitemapUrl = {
  path: string
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority?: number
  lastmod?: string
}

export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function urlsetXml(origin: string, urls: SitemapUrl[]): string {
  const base = origin.replace(/\/$/, '')
  const body = urls
    .map((item) => {
      const loc = `${base}${item.path.startsWith('/') ? item.path : `/${item.path}`}`
      const lastmod = item.lastmod ? `\n    <lastmod>${escapeXml(item.lastmod)}</lastmod>` : ''
      const changefreq = item.changefreq ? `\n    <changefreq>${item.changefreq}</changefreq>` : ''
      const priority =
        item.priority != null ? `\n    <priority>${item.priority.toFixed(1)}</priority>` : ''
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmod}${changefreq}${priority}\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
}

export function sitemapIndexXml(origin: string, files: string[]): string {
  const base = origin.replace(/\/$/, '')
  const body = files
    .map(
      (file) => `  <sitemap>
    <loc>${escapeXml(`${base}/${file.replace(/^\//, '')}`)}</loc>
  </sitemap>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`
}

export function staticSitemapUrls(): SitemapUrl[] {
  return STATIC_SITEMAP_ENTRIES.map((item) => ({
    path: item.path,
    changefreq: item.changefreq,
    priority: item.priority,
  }))
}

export function productSitemapChunks(slugs: string[]): string[][] {
  const chunks: string[][] = []
  for (let i = 0; i < slugs.length; i += SITEMAP_CHUNK_LIMIT) {
    chunks.push(slugs.slice(i, i + SITEMAP_CHUNK_LIMIT))
  }
  return chunks.length ? chunks : [[]]
}

export function categorySitemapUrls(): SitemapUrl[] {
  return categorySitemapPaths().map((path) => ({
    path,
    changefreq: 'weekly' as const,
    priority: path.split('/').filter(Boolean).length > 2 ? 0.7 : 0.8,
  }))
}

export function contentSitemapUrls(): SitemapUrl[] {
  return CONTENT_SITEMAP_PATHS.map((path) => ({
    path,
    changefreq: 'monthly' as const,
    priority: path === '/advies' ? 0.7 : 0.6,
  }))
}

export function sitemapIndexFiles(productChunkCount: number): string[] {
  const productFiles =
    productChunkCount <= 1
      ? ['sitemap-products.xml']
      : Array.from({ length: productChunkCount }, (_, index) => `sitemap-products-${index + 1}.xml`)
  return ['sitemap-static.xml', 'sitemap-categories.xml', ...productFiles, 'sitemap-content.xml']
}
