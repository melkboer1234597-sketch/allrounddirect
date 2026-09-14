import { getSiteOrigin, ROBOTS_DISALLOW, SITEMAP_PATHS } from '@/config/site'

/**
 * Statische sitemap (publieke routes).
 * Product-sitemaps later: sitemap-index + chunks vanuit D1, bijv. /sitemap-products-1.xml
 */
export function buildSitemapXml(origin = getSiteOrigin()): string {
  const base = origin.replace(/\/$/, '')
  const urls = SITEMAP_PATHS.map((item) => {
    const loc = `${base}${item.path}`
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority.toFixed(1)}</priority>
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

export function buildRobotsTxt(origin = getSiteOrigin()): string {
  const disallow = ROBOTS_DISALLOW.map((path) => `Disallow: ${path}`).join('\n')
  const sitemapLine = origin ? `Sitemap: ${origin.replace(/\/$/, '')}/sitemap.xml\n` : ''

  return `User-agent: *
Allow: /
${disallow}

${sitemapLine}`.trim() + '\n'
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
