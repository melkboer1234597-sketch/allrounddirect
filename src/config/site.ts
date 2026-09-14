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

export const PLACEHOLDER_PAGES: Record<
  string,
  { title: string; description: string; seoTitle?: string }
> = {
  '/meubels': {
    title: 'Meubels',
    description:
      'Banken, tafels, stoelen en kasten voor thuis en zakelijke ruimtes. Het assortiment wordt hier verder uitgewerkt.',
    seoTitle: 'Meubels | AllRound Direct',
  },
  '/vloeren': {
    title: 'Vloeren',
    description:
      'PVC, laminaat, parket en vloeraccessoires. Producten worden geleverd op het afleveradres. Montage kan via AllRoundKlussenbedrijf.',
    seoTitle: 'Vloeren | AllRound Direct',
  },
  '/keuken': {
    title: 'Keuken',
    description:
      'Keukenproducten en onderdelen voor particuliere en professionele keukens. Het aanbod volgt op deze pagina.',
    seoTitle: 'Keuken | AllRound Direct',
  },
  '/koelen-vriezen': {
    title: 'Koelen & Vriezen',
    description: 'Koelkasten, vriezers en koelapparatuur voor thuis en professioneel gebruik.',
    seoTitle: 'Koelen & Vriezen | AllRound Direct',
  },
  '/horeca': {
    title: 'Horeca',
    description:
      'Apparatuur, meubilair en inrichting voor horeca. Voor grotere aantallen kunt u een offerte aanvragen.',
    seoTitle: 'Horeca | AllRound Direct',
  },
  '/wonen': {
    title: 'Wonen',
    description:
      'Woonproducten voor interieur en dagelijks gebruik. Het assortiment wordt hier verder ingevuld.',
    seoTitle: 'Wonen | AllRound Direct',
  },
  '/zakelijk': {
    title: 'Zakelijk bestellen',
    description:
      'Inkoop voor ondernemers, horeca en projecten. Voor grotere bestellingen maken we een passende offerte.',
    seoTitle: 'Zakelijk bestellen | AllRound Direct',
  },
  '/outlet': {
    title: 'Outlet',
    description:
      'Geselecteerde producten en tijdelijke partijen. Beschikbaarheid verschilt per product en voorraad.',
    seoTitle: 'Outlet | AllRound Direct',
  },
  '/over-ons': {
    title: 'Over AllRound Direct',
    description:
      'AllRound Direct is een Nederlandse webshop voor wonen, keuken, vloer, horeca en zakelijke inkoop. Producten worden geleverd, zonder fysieke showroom.',
  },
  '/contact': {
    title: 'Contact',
    description:
      'Neem contact op voor vragen over producten, levering of een zakelijke aanvraag. Gegevens volgen.',
  },
  '/klantenservice': {
    title: 'Klantenservice',
    description:
      'Hulp bij bestellen, levering en retouren. Uitgebreide informatie volgt op deze pagina.',
  },
  '/bezorgen': {
    title: 'Bezorgen',
    description:
      'Bestellingen worden geleverd op het opgegeven afleveradres. Levertijd kan per product en leverancier verschillen.',
  },
  '/retourneren': {
    title: 'Retourneren',
    description:
      'Informatie over retourneren en herroepingsrecht volgt hier. Tot die tijd kunt u contact opnemen.',
  },
  '/veelgestelde-vragen': {
    title: 'Veelgestelde vragen',
    description:
      'Antwoorden over bestellen, levering en zakelijke inkoop. Deze pagina wordt later aangevuld.',
  },
  '/privacy': {
    title: 'Privacy',
    description: 'Hier komt het privacybeleid van AllRound Direct.',
  },
  '/cookies': {
    title: 'Cookies',
    description: 'Hier komt het cookiebeleid van AllRound Direct.',
  },
  '/algemene-voorwaarden': {
    title: 'Algemene voorwaarden',
    description: 'Hier komen de algemene voorwaarden van AllRound Direct.',
  },
  '/disclaimer': {
    title: 'Disclaimer',
    description: 'Hier komt de disclaimer van AllRound Direct.',
  },
  '/account': {
    title: 'Account',
    description: 'Inloggen en accountbeheer volgen in een volgende fase.',
  },
  '/favorieten': {
    title: 'Favorieten',
    description: 'Opgeslagen producten komen hier te staan zodra accounts beschikbaar zijn.',
  },
  '/winkelwagen': {
    title: 'Winkelwagen',
    description: 'Uw winkelwagen is leeg. Producten kunt u later vanaf de productpagina toevoegen.',
  },
  '/offerte': {
    title: 'Offerte aanvragen',
    description:
      'Voor grotere aantallen, horeca en projecten maken we een offerte. Het aanvraagformulier volgt.',
  },
  '/projecten': {
    title: 'Projecten',
    description:
      'Inrichting en inkoop voor zakelijke projecten. Neem contact op voor een aanvraag.',
  },
  '/montage': {
    title: 'Montage',
    description:
      'AllRound Direct levert de producten. Voor het leggen van vloeren of plaatsing van keukenproducten kunnen wij u doorverwijzen naar AllRoundKlussenbedrijf.',
  },
  '/bestelling-volgen': {
    title: 'Bestelling volgen',
    description: 'Statusinformatie van bestellingen volgt wanneer orders via de webshop lopen.',
  },
  '/zoeken': {
    title: 'Zoeken',
    description:
      'Zoekresultaten volgen wanneer het assortiment gekoppeld is. Gebruik de zoekbalk in de header.',
  },
  '/assortiment': {
    title: 'Assortiment',
    description: 'Het volledige assortiment wordt hier getoond zodra productdata beschikbaar is.',
  },
}
