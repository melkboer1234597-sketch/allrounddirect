export type RobotsDirective = 'index,follow' | 'noindex,nofollow'

export type PageSeo = {
  path: string
  title: string
  description: string
  seoTitle: string
  robots: RobotsDirective
  /** Opnemen in sitemap.xml */
  sitemap: boolean
  changefreq?: 'daily' | 'weekly' | 'monthly'
  priority?: number
}

export const SITE = {
  name: 'AllRound Direct',
  legalName: 'AllRound Direct',
  defaultTitle: 'AllRound Direct | Meubels, Vloeren, Keuken & Horeca',
  defaultDescription:
    'Shop meubels, vloeren, keukenproducten, koelapparatuur en horeca-artikelen bij AllRound Direct. Voor particuliere en zakelijke bestellingen.',
  locale: 'nl_NL',
  language: 'nl',
} as const

export function getSiteOrigin(): string {
  const envUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '')
  if (envUrl) return envUrl
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export function canonicalUrl(pathname: string): string {
  const origin = getSiteOrigin()
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  const normalized = path === '/' ? '/' : path.replace(/\/+$/, '')
  return origin ? `${origin}${normalized}` : normalized
}

function page(
  path: string,
  title: string,
  description: string,
  options?: Partial<Pick<PageSeo, 'seoTitle' | 'robots' | 'sitemap' | 'changefreq' | 'priority'>>,
): PageSeo {
  const privatePage = options?.robots === 'noindex,nofollow'
  return {
    path,
    title,
    description,
    seoTitle: options?.seoTitle ?? `${title} | ${SITE.name}`,
    robots: options?.robots ?? 'index,follow',
    sitemap: options?.sitemap ?? !privatePage,
    changefreq: options?.changefreq ?? 'weekly',
    priority: options?.priority ?? (path === '/' ? 1 : 0.7),
  }
}

export const HOME_SEO: PageSeo = page('/', SITE.name, SITE.defaultDescription, {
  seoTitle: SITE.defaultTitle,
  priority: 1,
  changefreq: 'weekly',
})

/** Publieke content- en servicelijnen. */
export const PUBLIC_PAGES: PageSeo[] = [
  page(
    '/meubels',
    'Meubels',
    'Banken, tafels, stoelen en kasten voor thuis en zakelijke ruimtes bij AllRound Direct.',
  ),
  page(
    '/vloeren',
    'Vloeren',
    'PVC, laminaat, parket en vloeraccessoires. Levering op het afleveradres. Montage via AllRoundKlussenbedrijf.',
  ),
  page(
    '/keuken',
    'Keuken',
    'Keukenproducten en onderdelen voor particuliere en professionele keukens bij AllRound Direct.',
  ),
  page(
    '/koelen-vriezen',
    'Koelen & Vriezen',
    'Koelkasten, vriezers en koelapparatuur voor thuis en professioneel gebruik.',
  ),
  page(
    '/horeca',
    'Horeca',
    'Apparatuur, meubilair en inrichting voor horeca. Voor grotere aantallen is een offerte mogelijk.',
  ),
  page(
    '/wonen',
    'Wonen',
    'Woonproducten voor interieur en dagelijks gebruik bij AllRound Direct.',
  ),
  page(
    '/zakelijk',
    'Zakelijk bestellen',
    'Inkoop voor ondernemers, horeca en projecten. Voor grotere bestellingen maken we een offerte.',
  ),
  page(
    '/outlet',
    'Outlet',
    'Geselecteerde producten en tijdelijke partijen. Beschikbaarheid verschilt per product en voorraad.',
  ),
  page(
    '/over-ons',
    'Over AllRound Direct',
    'AllRound Direct is een Nederlandse webshop voor wonen, keuken, vloer, horeca en zakelijke inkoop. Producten worden geleverd.',
  ),
  page(
    '/contact',
    'Contact',
    'Neem contact op met AllRound Direct over producten, levering of een zakelijke aanvraag.',
  ),
  page(
    '/klantenservice',
    'Klantenservice',
    'Hulp bij bestellen, levering en retouren bij AllRound Direct.',
  ),
  page(
    '/bezorgen',
    'Bezorgen',
    'Bestellingen worden geleverd op het opgegeven afleveradres. Levertijd kan per product en leverancier verschillen.',
  ),
  page(
    '/retourneren',
    'Retourneren',
    'Informatie over retourneren en herroepingsrecht bij AllRound Direct.',
  ),
  page(
    '/veelgestelde-vragen',
    'Veelgestelde vragen',
    'Vragen over bestellen, levering en zakelijke inkoop bij AllRound Direct.',
  ),
  page('/privacy', 'Privacy', 'Privacybeleid van AllRound Direct.'),
  page('/cookies', 'Cookies', 'Cookiebeleid van AllRound Direct.'),
  page('/algemene-voorwaarden', 'Algemene voorwaarden', 'Algemene voorwaarden van AllRound Direct.'),
  page('/disclaimer', 'Disclaimer', 'Disclaimer van AllRound Direct.'),
  page(
    '/offerte',
    'Offerte aanvragen',
    'Vraag een offerte aan voor grotere aantallen, horeca of projecten bij AllRound Direct.',
  ),
  page(
    '/projecten',
    'Projecten',
    'Inrichting en inkoop voor zakelijke projecten via AllRound Direct.',
  ),
  page(
    '/montage',
    'Montage',
    'AllRound Direct levert producten. Voor vloerleggen of keukenplaatsing kunt u terecht bij AllRoundKlussenbedrijf.',
  ),
  page(
    '/assortiment',
    'Assortiment',
    'Bekijk het assortiment meubels, vloeren, keuken, koelapparatuur en horeca van AllRound Direct.',
  ),
]

/** Account, winkelwagen, zoekresultaten: niet indexeren. */
export const PRIVATE_PAGES: PageSeo[] = [
  page('/account', 'Account', 'Inloggen en accountbeheer bij AllRound Direct.', {
    robots: 'noindex,nofollow',
    sitemap: false,
  }),
  page('/favorieten', 'Favorieten', 'Opgeslagen producten bij AllRound Direct.', {
    robots: 'noindex,nofollow',
    sitemap: false,
  }),
  page('/winkelwagen', 'Winkelwagen', 'Winkelwagen van AllRound Direct.', {
    robots: 'noindex,nofollow',
    sitemap: false,
  }),
  page('/bestelling-volgen', 'Bestelling volgen', 'Status van een bestelling bij AllRound Direct.', {
    robots: 'noindex,nofollow',
    sitemap: false,
  }),
  page(
    '/zoeken',
    'Zoeken',
    'Zoek in het assortiment van AllRound Direct.',
    { robots: 'noindex,nofollow', sitemap: false },
  ),
]

export const NOT_FOUND_SEO: PageSeo = page(
  '/404',
  'Pagina niet gevonden',
  'Deze pagina bestaat niet. Ga terug naar de homepage van AllRound Direct.',
  { robots: 'noindex,nofollow', sitemap: false, seoTitle: 'Pagina niet gevonden | AllRound Direct' },
)

export const ALL_STATIC_PAGES: PageSeo[] = [...PUBLIC_PAGES, ...PRIVATE_PAGES]

const PAGE_BY_PATH = new Map(ALL_STATIC_PAGES.map((item) => [item.path, item]))

export function getPageSeo(pathname: string): PageSeo | undefined {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  return PAGE_BY_PATH.get(normalized)
}

export const PLACEHOLDER_PATHS = ALL_STATIC_PAGES.map((item) => item.path.slice(1))

export const SITEMAP_PATHS: Array<{ path: string; changefreq: string; priority: number }> = [
  { path: '/', changefreq: 'weekly', priority: 1 },
  ...PUBLIC_PAGES.map((item) => ({
    path: item.path,
    changefreq: item.changefreq ?? 'weekly',
    priority: item.priority ?? 0.7,
  })),
]

export const ROBOTS_DISALLOW = [
  '/account',
  '/favorieten',
  '/winkelwagen',
  '/bestelling-volgen',
  '/zoeken',
  '/admin',
] as const

export const NAV_CATEGORIES = [
  { label: 'Meubels', href: '/meubels' },
  { label: 'Vloeren', href: '/vloeren' },
  { label: 'Keuken', href: '/keuken' },
  { label: 'Koelen & Vriezen', href: '/koelen-vriezen' },
  { label: 'Horeca', href: '/horeca' },
  { label: 'Wonen', href: '/wonen' },
  { label: 'Zakelijk', href: '/zakelijk' },
  { label: 'Outlet', href: '/outlet', accent: true },
] as const

export const FOOTER_ASSORTMENT = [
  { label: 'Meubels', href: '/meubels' },
  { label: 'Vloeren', href: '/vloeren' },
  { label: 'Keuken', href: '/keuken' },
  { label: 'Koelen & Vriezen', href: '/koelen-vriezen' },
  { label: 'Horeca', href: '/horeca' },
  { label: 'Outlet', href: '/outlet' },
] as const

export const FOOTER_SERVICE = [
  { label: 'Contact', href: '/contact' },
  { label: 'Bestelling volgen', href: '/bestelling-volgen' },
  { label: 'Bezorgen', href: '/bezorgen' },
  { label: 'Retourneren', href: '/retourneren' },
  { label: 'Veelgestelde vragen', href: '/veelgestelde-vragen' },
] as const

export const FOOTER_BUSINESS = [
  { label: 'Zakelijk bestellen', href: '/zakelijk' },
  { label: 'Offerte aanvragen', href: '/offerte' },
  { label: 'Projecten', href: '/projecten' },
  { label: 'Montage via AllRoundKlussenbedrijf', href: '/montage' },
] as const

export const FOOTER_LEGAL = [
  { label: 'Over ons', href: '/over-ons' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Algemene voorwaarden', href: '/algemene-voorwaarden' },
  { label: 'Disclaimer', href: '/disclaimer' },
] as const
