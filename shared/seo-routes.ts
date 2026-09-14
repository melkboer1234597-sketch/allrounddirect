/** Gedeelde SEO-routes (geen import.meta, bruikbaar in Worker en frontend). */

export const STATIC_SITEMAP_ENTRIES = [
  { path: '/', changefreq: 'weekly' as const, priority: 1 },
  { path: '/over-ons', changefreq: 'monthly' as const, priority: 0.6 },
  { path: '/contact', changefreq: 'monthly' as const, priority: 0.6 },
  { path: '/klantenservice', changefreq: 'monthly' as const, priority: 0.6 },
  { path: '/bezorgen', changefreq: 'monthly' as const, priority: 0.6 },
  { path: '/retourneren', changefreq: 'monthly' as const, priority: 0.5 },
  { path: '/veelgestelde-vragen', changefreq: 'monthly' as const, priority: 0.5 },
  { path: '/privacy', changefreq: 'yearly' as const, priority: 0.3 },
  { path: '/cookies', changefreq: 'yearly' as const, priority: 0.3 },
  { path: '/algemene-voorwaarden', changefreq: 'yearly' as const, priority: 0.3 },
  { path: '/garantie-en-klachten', changefreq: 'yearly' as const, priority: 0.4 },
  { path: '/betalen', changefreq: 'yearly' as const, priority: 0.4 },
  { path: '/herroepen', changefreq: 'yearly' as const, priority: 0.5 },
  { path: '/herroepingsformulier', changefreq: 'yearly' as const, priority: 0.4 },
  { path: '/zakelijk/voorwaarden', changefreq: 'yearly' as const, priority: 0.4 },
  { path: '/zakelijk/offerte', changefreq: 'monthly' as const, priority: 0.6 },
  { path: '/disclaimer', changefreq: 'yearly' as const, priority: 0.3 },
  { path: '/projecten', changefreq: 'monthly' as const, priority: 0.6 },
  { path: '/montage', changefreq: 'monthly' as const, priority: 0.5 },
] as const

export const CONTENT_SITEMAP_PATHS = [
  '/advies',
  '/advies/pvc-of-laminaat-kiezen',
  '/advies/hoeveel-vloer-heb-ik-nodig',
  '/advies/bank-opmeten-voor-levering',
] as const

/** @deprecated Gebruik STATIC_SITEMAP_ENTRIES + categoriedeel. Compat voor site.ts */
export const PUBLIC_SITEMAP_ENTRIES = STATIC_SITEMAP_ENTRIES

export const ROBOTS_DISALLOW = [
  '/account',
  '/favorieten',
  '/winkelwagen',
  '/afrekenen',
  '/bestelling',
  '/bestelling-volgen',
  '/zoeken',
  '/admin',
  '/scotdejewish',
  '/api',
] as const
