import { assets } from '@/lib/assets'

export type TaxonomyChild = {
  slug: string
  name: string
  intro: string
  content?: { heading: string; body: string }
  children?: TaxonomyChild[]
}

export type TaxonomyRoomLink = {
  name: string
  href: string
}

export type TaxonomyRoot = {
  slug: string
  name: string
  accent?: boolean
  intro: string
  seoDescription: string
  filterSchema: FilterSchemaId
  image: string
  imageAlt: string
  popular: string[]
  rooms: TaxonomyRoomLink[]
  children: TaxonomyChild[]
  showBusinessCta?: boolean
  content?: { heading: string; body: string }
}

export type FilterSchemaId =
  | 'generic'
  | 'furniture'
  | 'flooring'
  | 'kitchen'
  | 'cooling'
  | 'horeca'
  | 'living'
  | 'business'
  | 'outlet'

export const CATALOG_TAXONOMY: TaxonomyRoot[] = [
  {
    slug: 'meubels',
    name: 'Meubels',
    intro: 'Banken, tafels, stoelen en kasten voor thuis en zakelijke ruimtes.',
    seoDescription:
      'Meubels voor woonkamer, eetkamer en slaapkamer bij AllRound Direct. Banken, tafels, stoelen en kasten, geleverd op het afleveradres.',
    content: {
      heading: 'Meubels bestellen zonder showroombezoek',
      body: 'AllRound Direct levert meubels op het afleveradres in Nederland en België, standaard binnen 1 tot 3 werkdagen. Formaat en aanvoerroute (deuren, trap, lift) checkt u vóór bestelling. Grote banken en kasten komen vaak in delen. Montage van meubels is niet standaard inbegrepen.',
    },
    filterSchema: 'furniture',
    image: assets.categoryMeubels,
    imageAlt: 'Woonkamer met hoekbank en dressoir',
    popular: ['banken', 'hoekbanken', 'eettafels', 'stoelen', 'kasten', 'fauteuils'],
    rooms: [
      { name: 'Woonkamer', href: '/wonen/woonkamer' },
      { name: 'Eetkamer', href: '/wonen/eetkamer' },
      { name: 'Slaapkamer', href: '/wonen/slaapkamer' },
    ],
    children: [
      {
        slug: 'banken',
        name: 'Banken',
        intro:
          'Twee- en driezitsbanken in stof en leerlook. Controleer breedte en zitdiepte voor uw ruimte.',
        content: {
          heading: 'Een bank kiezen die bij uw ruimte past',
          body: 'Meet de muurlengte en loopruimte voordat u een bank bestelt. Let op zitdiepte, poothoogte en of het model in delen geleverd wordt. Stof is eenvoudig te combineren; leerlook is slijtvaster in intensief gebruik. Onderhoud volgt de productinstructie van de leverancier.',
        },
        children: [
          {
            slug: 'hoekbanken',
            name: 'Hoekbanken',
            intro:
              'Hoekopstellingen voor grotere woonkamers. Let op de chaise-longue links of rechts en de loopruimte naar deuren.',
            content: {
              heading: 'Hoekbank opmeten voor levering',
              body: 'Controleer de vrije doorgang (trappen, deuren, lift) naast de opstelling in de kamer. Een hoekbank komt vaak in delen. De leverbare opstelling (links of rechts) staat bij het product; wissel die niet om zonder de specificatie te checken.',
            },
          },
        ],
      },
      {
        slug: 'fauteuils',
        name: 'Fauteuils',
        intro: 'Losse zitplaatsen als aanvulling op de bank of als leesstoel.',
      },
      {
        slug: 'stoelen',
        name: 'Stoelen',
        intro: 'Eetkamerstoelen en losse stoelen, vaak per stuk of in sets.',
      },
      {
        slug: 'eettafels',
        name: 'Eettafels',
        intro: 'Tafels in diverse lengtes. Controleer pootplaatsing bij stoelen.',
      },
      {
        slug: 'salontafels',
        name: 'Salontafels',
        intro: 'Lage tafels voor de zithoek, passend bij bankhoogte en tapijt.',
      },
      {
        slug: 'bijzettafels',
        name: 'Bijzettafels',
        intro: 'Kleine tafels naast bank of fauteuil.',
      },
      {
        slug: 'kasten',
        name: 'Kasten',
        intro: 'Opbergkasten voor woonkamer, eetkamer of kantoor.',
      },
      {
        slug: 'dressoirs',
        name: 'Dressoirs',
        intro: 'Lage kasten voor servies, decoratie of media.',
      },
      {
        slug: 'tv-meubels',
        name: 'TV-meubels',
        intro: 'Lage meubels voor televisie en randapparatuur.',
      },
      {
        slug: 'bedden',
        name: 'Bedden',
        intro: 'Bedframes en complete bedden. Matrasmaat altijd controleren.',
      },
      {
        slug: 'eetkamermeubels',
        name: 'Eetkamermeubels',
        intro: 'Combinaties van tafel, stoelen en opbergen voor de eetkamer.',
      },
    ],
  },
  {
    slug: 'vloeren',
    name: 'Vloeren',
    intro: 'PVC, laminaat, parket en toebehoren. Levering op het afleveradres.',
    seoDescription: 'PVC, laminaat, parket en vloeraccessoires bij AllRound Direct.',
    content: {
      heading: 'Vloer kiezen en laten leggen',
      body: 'Begin bij gebruik (wonen, kantoor, vocht) en de ondervloer. PVC en laminaat hebben andere slijtlagen en legwijzen. Bestel plinten en profielen bij de vloer. AllRound Direct levert; voor leggen kunt u terecht bij AllRoundKlussenbedrijf.',
    },
    filterSchema: 'flooring',
    image: assets.categoryVloeren,
    imageAlt: 'Houtlook vloer in een woonkamer',
    popular: ['pvc', 'klik-pvc', 'laminaat', 'parket', 'plinten', 'ondervloeren'],
    rooms: [
      { name: 'Woonkamer', href: '/wonen/woonkamer' },
      { name: 'Montage', href: '/montage' },
    ],
    children: [
      {
        slug: 'pvc',
        name: 'PVC',
        intro: 'PVC-vloeren in diverse looks. Geschikt voor veel woon- en werkruimtes.',
        content: {
          heading: 'PVC kiezen',
          body: 'Let op dikte, slijtlaag en of de vloer zwevend of verlijmd wordt gelegd. Voor vloerverwarming en vochtige ruimtes geldt de productspecificatie van de leverancier. Plinten en profielen bestelt u apart bij de vloer.',
        },
        children: [
          {
            slug: 'klik-pvc',
            name: 'Klik PVC',
            intro: 'Zwevende PVC-planken met klikverbinding, meestal zonder volledige verlijming.',
          },
          {
            slug: 'plak-pvc',
            name: 'Plak PVC',
            intro: 'Te verlijmen PVC, vaak voor grotere oppervlakken en intensief gebruik.',
          },
        ],
      },
      { slug: 'laminaat', name: 'Laminaat', intro: 'Kliklaminaat in hout- en steenlook.' },
      {
        slug: 'parket',
        name: 'Parket',
        intro: 'Houten vloeren. Afwerking en onderhoud verschillen per type.',
      },
      { slug: 'tegels', name: 'Tegels', intro: 'Vloertegels voor woon- en utiliteitsruimtes.' },
      {
        slug: 'ondervloeren',
        name: 'Ondervloeren',
        intro: 'Ondervloeren passend bij PVC, laminaat of parket.',
      },
      { slug: 'plinten', name: 'Plinten', intro: 'Afwerking langs de wand, in houtlook of MDF.' },
      {
        slug: 'profielen',
        name: 'Profielen',
        intro: 'Overgangs- en eindprofielen bij deuren en niveaus.',
      },
      {
        slug: 'vloeraccessoires',
        name: 'Vloeraccessoires',
        intro: 'Lijm, afwerking en overige toebehoren.',
      },
    ],
  },
  {
    slug: 'keuken',
    name: 'Keuken',
    intro: 'Kasten, werkbladen, spoelbakken, kranen en keukenapparatuur.',
    seoDescription: 'Keukenproducten en onderdelen voor thuis en professioneel gebruik.',
    filterSchema: 'kitchen',
    image: assets.hero,
    imageAlt: 'Moderne keuken met donkere kasten',
    popular: ['keukenkasten', 'werkbladen', 'spoelbakken', 'keukenapparatuur'],
    rooms: [{ name: 'Montage', href: '/montage' }],
    children: [
      {
        slug: 'keukenkasten',
        name: 'Keukenkasten',
        intro: 'Onder- en bovenkasten en hoge kasten.',
      },
      { slug: 'werkbladen', name: 'Werkbladen', intro: 'Bladen in diverse materialen en diktes.' },
      { slug: 'spoelbakken', name: 'Spoelbakken', intro: 'Inbouw- en opbouwspoelbakken.' },
      {
        slug: 'kranen',
        name: 'Kranen',
        intro: 'Keukenkranen, inclusief professionele uitvoeringen.',
      },
      {
        slug: 'keukenapparatuur',
        name: 'Keukenapparatuur',
        intro: 'Ovens, kookplaten en afzuiging. Controleer nismaten.',
      },
      {
        slug: 'keukenonderdelen',
        name: 'Keukenonderdelen',
        intro: 'Scharnieren, grepen en overige onderdelen.',
      },
      {
        slug: 'accessoires',
        name: 'Accessoires',
        intro: 'Organisatie en kleine keukentoeebehoren.',
      },
    ],
  },
  {
    slug: 'koelen-vriezen',
    name: 'Koelen & Vriezen',
    intro: 'Koelkasten, vriezers en professionele koeling.',
    seoDescription: 'Koelkasten, vriezers en koelapparatuur voor thuis en horeca.',
    filterSchema: 'cooling',
    image: assets.categoryKoelen,
    imageAlt: 'Amerikaanse koelkast in een keuken',
    popular: ['koelkasten', 'vriezers', 'koel-vriescombinaties', 'horecakoeling'],
    rooms: [{ name: 'Horeca', href: '/horeca' }],
    showBusinessCta: true,
    children: [
      { slug: 'koelkasten', name: 'Koelkasten', intro: 'Vrijstaande en inbouwkoelkasten.' },
      { slug: 'vriezers', name: 'Vriezers', intro: 'Tafel- en kistvriezers in diverse inhouden.' },
      {
        slug: 'koel-vriescombinaties',
        name: 'Koel-vriescombinaties',
        intro: 'Combinaties met koel- en vriesgedeelte.',
      },
      { slug: 'drankkoelingen', name: 'Drankkoelingen', intro: 'Koeling voor flessen en blikken.' },
      { slug: 'wijnkoelkasten', name: 'Wijnkoelkasten', intro: 'Klimaatkasten voor wijnopslag.' },
      {
        slug: 'horecakoeling',
        name: 'Horecakoeling',
        intro: 'Professionele koeling voor horeca en grootkeuken.',
      },
      {
        slug: 'koelvitrines',
        name: 'Koelvitrines',
        intro: 'Vitrines voor presentatie van gekoelde producten.',
      },
      {
        slug: 'koelwerkbanken',
        name: 'Koelwerkbanken',
        intro: 'Werkbanken met gekoelde opbergruimte.',
      },
    ],
  },
  {
    slug: 'horeca',
    name: 'Horeca',
    intro: 'Apparatuur, RVS meubilair en inrichting voor professionele keukens.',
    seoDescription: 'Horeca-apparatuur, meubilair en keukeninrichting bij AllRound Direct.',
    content: {
      heading: 'Horeca inkopen via de webshop of offerte',
      body: 'Losse apparaten bestelt u online wanneer prijs en voorraad op het product staan. Levering is standaard binnen 1 tot 3 werkdagen. Voor een complete keukenlijn, grotere aantallen of projectlevering is een zakelijke offerte meestal passender. Aansluitwaarden en indeling checkt u tegen de specificatie, niet tegen een algemene belofte.',
    },
    filterSchema: 'horeca',
    image: assets.categoryHoreca,
    imageAlt: 'Professionele RVS horecakeuken',
    popular: ['koeling', 'kookapparatuur', 'rvs-meubilair', 'restaurantmeubilair'],
    rooms: [
      { name: 'Zakelijk', href: '/zakelijk' },
      { name: 'Offerte', href: '/zakelijk/offerte' },
    ],
    showBusinessCta: true,
    children: [
      {
        slug: 'koeling',
        name: 'Koeling',
        intro: 'Horecakoeling, vitrines en werkbanken. Inhoud en aansluiting altijd controleren.',
        content: {
          heading: 'Horecakoeling kiezen',
          body: 'Bepaal of u voorraad, presentatie of werkbankkoeling nodig heeft. Let op inhoud in liters, deuropening, 230V of 400V, en of het apparaat in een warme keuken staat. Voor grotere aantallen is een offerte meestal zinvoller dan losse webshopstuks.',
        },
      },
      {
        slug: 'kookapparatuur',
        name: 'Kookapparatuur',
        intro: 'Fornuizen, bakplaten en friteuses.',
      },
      {
        slug: 'rvs-meubilair',
        name: 'RVS meubilair',
        intro: 'Werktafels, kasten en RVS inrichting.',
      },
      {
        slug: 'spoelen-reinigen',
        name: 'Spoelen & reinigen',
        intro: 'Vaatwas, spoeltafels en hygiëne.',
      },
      {
        slug: 'restaurantmeubilair',
        name: 'Restaurantmeubilair',
        intro: 'Tafels, stoelen en terrasinrichting.',
      },
      { slug: 'opslag', name: 'Opslag', intro: 'Stellingen en voorraadmeubilair.' },
      {
        slug: 'buffet-presentatie',
        name: 'Buffet & presentatie',
        intro: 'Buffetlijnen en presentatiemeubels.',
      },
      { slug: 'bar', name: 'Bar', intro: 'Barinrichting en tapgerelateerde producten.' },
      {
        slug: 'professionele-keuken',
        name: 'Professionele keuken',
        intro: 'Complete keukenlijnen voor horeca.',
      },
      {
        slug: 'accessoires',
        name: 'Accessoires',
        intro: 'Kleine materialen voor de professionele keuken.',
      },
    ],
  },
  {
    slug: 'wonen',
    name: 'Wonen',
    intro: 'Producten voor woonkamer, eetkamer, slaapkamer en opbergen.',
    seoDescription: 'Woonproducten voor interieur en dagelijks gebruik.',
    filterSchema: 'living',
    image: assets.categoryMeubels,
    imageAlt: 'Lichte woonkamer met bank en kast',
    popular: ['woonkamer', 'eetkamer', 'slaapkamer', 'verlichting'],
    rooms: [{ name: 'Meubels', href: '/meubels' }],
    children: [
      {
        slug: 'woonkamer',
        name: 'Woonkamer',
        intro: 'Zitmeubels, tafels en opbergen voor de woonkamer.',
      },
      { slug: 'eetkamer', name: 'Eetkamer', intro: 'Tafels, stoelen en dressoirs.' },
      { slug: 'slaapkamer', name: 'Slaapkamer', intro: 'Bedden en slaapkameropbergen.' },
      { slug: 'verlichting', name: 'Verlichting', intro: 'Hanglampen en sfeerverlichting.' },
      { slug: 'opbergen', name: 'Opbergen', intro: 'Kasten en opbergsystemen.' },
      {
        slug: 'woonaccessoires',
        name: 'Woonaccessoires',
        intro: 'Kleine woonproducten en afwerking.',
      },
      {
        slug: 'deuren',
        name: 'Deuren',
        intro: 'Binnen- en buitendeuren, afhankelijk van het aanbod.',
      },
      {
        slug: 'tuinmeubels',
        name: 'Tuinmeubels',
        intro: 'Buitenmeubels voor terras en tuin.',
      },
    ],
  },
  {
    slug: 'huishouden',
    name: 'Huishouden',
    intro: 'Witgoed en huishoudelijke apparatuur.',
    seoDescription: 'Wasmachines en huishoudelijke apparatuur bij AllRound Direct.',
    filterSchema: 'generic',
    image: assets.categoryKoelen,
    imageAlt: 'Huishoudelijke apparatuur',
    popular: ['wasmachines'],
    rooms: [{ name: 'Keuken', href: '/keuken' }],
    children: [
      {
        slug: 'wasmachines',
        name: 'Wasmachines',
        intro: 'Wasmachines voor thuisgebruik. Controleer aansluiting en inbouwmaten.',
      },
    ],
  },
  {
    slug: 'zakelijk',
    name: 'Zakelijk',
    intro: 'Inkoop voor horeca, projecten en bedrijfsruimtes.',
    seoDescription: 'Zakelijke inkoop en offertes voor horeca en projecten.',
    filterSchema: 'business',
    image: assets.sectionBusiness,
    imageAlt: 'Zakelijke inrichting met pallets en lange tafel',
    popular: ['horeca', 'projectinrichting', 'grootafname', 'offerte'],
    rooms: [{ name: 'Horeca assortiment', href: '/horeca' }],
    showBusinessCta: true,
    children: [
      { slug: 'horeca', name: 'Horeca', intro: 'Zakelijke selectie voor horeca-inkoop.' },
      {
        slug: 'projectinrichting',
        name: 'Projectinrichting',
        intro: 'Inrichting voor grotere ruimtes en projecten.',
      },
      {
        slug: 'kantoor-bedrijfsruimte',
        name: 'Kantoor & bedrijfsruimte',
        intro: 'Meubilair en inrichting voor werkplekken.',
      },
      {
        slug: 'grootafname',
        name: 'Grootafname',
        intro: 'Grotere aantallen, afhankelijk van leverancier.',
      },
      {
        slug: 'offerte',
        name: 'Zakelijke offerte',
        intro: 'Voor grotere aantallen maken we een passende aanvraag.',
      },
    ],
  },
  {
    slug: 'outlet',
    name: 'Outlet',
    accent: true,
    intro: 'Geselecteerde partijen en laatste stuks. Voorraad verschilt per product.',
    seoDescription: 'Outlet en tijdelijke partijen bij AllRound Direct.',
    filterSchema: 'outlet',
    image: assets.sectionOutlet,
    imageAlt: 'Outletopstelling met meubels en magazijnvoorraad',
    popular: ['laatste-stuks', 'restpartijen', 'tijdelijke-aanbiedingen'],
    rooms: [{ name: 'Assortiment', href: '/assortiment' }],
    children: [
      {
        slug: 'laatste-stuks',
        name: 'Laatste stuks',
        intro: 'Beperkte aantallen uit lopende collecties.',
      },
      {
        slug: 'restpartijen',
        name: 'Restpartijen',
        intro: 'Partijen waarvan de beschikbaarheid per levering verschilt.',
      },
      {
        slug: 'tijdelijke-aanbiedingen',
        name: 'Tijdelijke aanbiedingen',
        intro: 'Tijdelijk scherper geprijsde producten, zolang de voorraad strekt.',
      },
    ],
  },
]

export function getTaxonomyRoot(slug: string): TaxonomyRoot | undefined {
  return CATALOG_TAXONOMY.find((item) => item.slug === slug)
}

export type ResolvedTaxonomy = {
  root: TaxonomyRoot
  child?: TaxonomyChild
  leaf?: TaxonomyChild
  href: string
}

export function flattenTaxonomyChildren(
  root: TaxonomyRoot,
  nodes = root.children,
  prefix = `/${root.slug}`,
): Array<{ node: TaxonomyChild; href: string; parentHref: string }> {
  const rows: Array<{ node: TaxonomyChild; href: string; parentHref: string }> = []
  for (const node of nodes) {
    const href = `${prefix}/${node.slug}`
    rows.push({ node, href, parentHref: prefix })
    if (node.children?.length) {
      rows.push(...flattenTaxonomyChildren(root, node.children, href))
    }
  }
  return rows
}

export function taxonomyDescendantSlugs(node: TaxonomyChild): string[] {
  const slugs = [node.slug]
  for (const child of node.children ?? []) {
    slugs.push(...taxonomyDescendantSlugs(child))
  }
  return slugs
}

export function getTaxonomyChild(rootSlug: string, childSlug: string): TaxonomyChild | undefined {
  const root = getTaxonomyRoot(rootSlug)
  if (!root) return undefined
  return flattenTaxonomyChildren(root).find((item) => item.node.slug === childSlug)?.node
}

export function taxonomyPath(rootSlug: string, childSlug?: string, leafSlug?: string): string {
  if (leafSlug && childSlug) return `/${rootSlug}/${childSlug}/${leafSlug}`
  if (childSlug) return `/${rootSlug}/${childSlug}`
  return `/${rootSlug}`
}

export function findCategoryByPath(pathname: string): {
  root?: TaxonomyRoot
  child?: TaxonomyChild
  leaf?: TaxonomyChild
} {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean)
  if (parts.length === 0) return {}
  const root = getTaxonomyRoot(parts[0])
  if (!root) return {}
  if (parts.length === 1) return { root }
  const child = root.children.find((item) => item.slug === parts[1])
  if (parts.length === 2) return { root, child }
  if (parts.length === 3) {
    const leaf = child?.children?.find((item) => item.slug === parts[2])
    if (!child || !leaf) return {}
    return { root, child, leaf }
  }
  return {}
}

export const CATALOG_ROOT_SLUGS = CATALOG_TAXONOMY.map((item) => item.slug)

export function allCatalogPaths(): string[] {
  const paths = ['/assortiment']
  for (const root of CATALOG_TAXONOMY) {
    paths.push(`/${root.slug}`)
    for (const row of flattenTaxonomyChildren(root)) {
      paths.push(row.href)
    }
  }
  return paths
}
