/** Matches FilterSchemaId in src/data/taxonomy.ts */
export type PresentationFilterSchemaId =
  | 'generic'
  | 'furniture'
  | 'flooring'
  | 'kitchen'
  | 'cooling'
  | 'horeca'
  | 'living'
  | 'business'
  | 'outlet'

/** Canonical product presentation types for category-aware ecommerce UI. */
export type ProductPresentationType =
  | 'flooring'
  | 'furniture'
  | 'cooling'
  | 'kitchen'
  | 'horeca'
  | 'doors'
  | 'generic'

export type SpecFieldDef = {
  /** Stable id used in attributes when structured. */
  id: string
  /** Dutch label shown in UI. */
  label: string
  /** Accepts Dutch/German/source keys already stored on products. */
  aliases: string[]
}

export type ProductPresentationConfig = {
  type: ProductPresentationType
  filterSchema: PresentationFilterSchemaId
  keySpecs: SpecFieldDef[]
  calculator: 'none' | 'flooring-packs'
  cta: {
    mode: 'cart' | 'quote' | 'cart_and_quote'
    quoteProminent?: boolean
  }
  serviceLinks: Array<{ label: string; href: string }>
  related: {
    preferSubcategory: boolean
    complementaryCategorySlugs: string[]
    complementarySubcategorySlugs: string[]
  }
  /** Reserved for when real variant data exists. */
  variantSlots: Array<'orientation' | 'color' | 'fabric' | 'configuration'>
}

const COMMON_DIM: SpecFieldDef = {
  id: 'dimensions',
  label: 'Afmetingen',
  aliases: ['Afmetingen', 'B/H/D', 'Maße', 'Masse', 'dimensions', 'afmeting'],
}

export const PRODUCT_PRESENTATION: Record<ProductPresentationType, ProductPresentationConfig> = {
  flooring: {
    type: 'flooring',
    filterSchema: 'flooring',
    calculator: 'flooring-packs',
    cta: { mode: 'cart' },
    serviceLinks: [{ label: 'Vloer laten leggen via AllRoundKlussenbedrijf', href: '/montage' }],
    related: {
      preferSubcategory: true,
      complementaryCategorySlugs: ['vloeren'],
      complementarySubcategorySlugs: ['ondervloeren', 'profielen', 'vloeraccessoires'],
    },
    variantSlots: [],
    keySpecs: [
      { id: 'type', label: 'Type', aliases: ['Type', 'floorType', 'Soort'] },
      { id: 'material', label: 'Materiaal', aliases: ['Materiaal', 'material'] },
      { id: 'color', label: 'Kleur', aliases: ['Kleur', 'color', 'Farbe'] },
      COMMON_DIM,
      { id: 'thickness', label: 'Dikte', aliases: ['Dikte', 'thickness', 'Dicke'] },
      {
        id: 'packCoverage',
        label: 'Pakinhoud',
        aliases: ['Pakinhoud', 'Packungsinhalt', 'packCoverage', 'm²/pak', 'm2/pak'],
      },
      {
        id: 'usageClass',
        label: 'Gebruiksklasse',
        aliases: ['Gebruiksklasse', 'Nutzungsklasse', 'usageClass'],
      },
      {
        id: 'underfloorHeating',
        label: 'Geschikt voor vloerverwarming',
        aliases: [
          'Geschikt voor vloerverwarming',
          'Vloerverwarming',
          'Fußbodenheizung',
          'underfloorHeating',
        ],
      },
      {
        id: 'waterResistance',
        label: 'Waterbestendigheid',
        aliases: ['Waterbestendigheid', 'Waterbestendig', 'waterproof'],
      },
      { id: 'finish', label: 'Oppervlakteafwerking', aliases: ['Oppervlakteafwerking', 'finish'] },
      { id: 'warranty', label: 'Garantie', aliases: ['Garantie', 'warranty'] },
    ],
  },
  furniture: {
    type: 'furniture',
    filterSchema: 'furniture',
    calculator: 'none',
    cta: { mode: 'cart' },
    serviceLinks: [],
    related: {
      preferSubcategory: true,
      complementaryCategorySlugs: ['meubels', 'wonen'],
      complementarySubcategorySlugs: ['stoelen', 'eettafels', 'salontafels'],
    },
    variantSlots: ['orientation', 'color', 'fabric', 'configuration'],
    keySpecs: [
      COMMON_DIM,
      { id: 'material', label: 'Materiaal', aliases: ['Materiaal', 'material'] },
      { id: 'color', label: 'Kleur', aliases: ['Kleur', 'color'] },
      {
        id: 'configuration',
        label: 'Uitvoering',
        aliases: ['Uitvoering', 'configuration', 'Configuratie'],
      },
      { id: 'seats', label: 'Zitplaatsen', aliases: ['Zitplaatsen', 'seats', 'Sitzplätze'] },
      {
        id: 'orientation',
        label: 'Oriëntatie',
        aliases: ['Oriëntatie', 'orientation', 'Hoek', 'links', 'rechts'],
      },
      { id: 'fabric', label: 'Stof', aliases: ['Stof', 'fabric', 'Bekleding'] },
      {
        id: 'assembly',
        label: 'Montage',
        aliases: ['Montage', 'assembly', 'Assemblage'],
      },
    ],
  },
  cooling: {
    type: 'cooling',
    filterSchema: 'cooling',
    calculator: 'none',
    cta: { mode: 'cart' },
    serviceLinks: [],
    related: {
      preferSubcategory: true,
      complementaryCategorySlugs: ['koelen-vriezen', 'horeca'],
      complementarySubcategorySlugs: [],
    },
    variantSlots: [],
    keySpecs: [
      { id: 'capacity', label: 'Inhoud', aliases: ['Inhoud', 'capacity', 'Inhalt'] },
      COMMON_DIM,
      {
        id: 'energyClass',
        label: 'Energieklasse',
        aliases: ['Energieklasse', 'energy', 'energyClass'],
      },
      {
        id: 'tempRange',
        label: 'Temperatuurbereik',
        aliases: ['Temperatuurbereik', 'tempRange', 'Temperatur'],
      },
      { id: 'power', label: 'Vermogen', aliases: ['Vermogen', 'power', 'Leistung'] },
      { id: 'connection', label: 'Aansluiting', aliases: ['Aansluiting', 'connection'] },
      { id: 'doors', label: 'Deuren', aliases: ['Deuren', 'doors'] },
      { id: 'noise', label: 'Geluidsniveau', aliases: ['Geluidsniveau', 'noise', 'Geräusch'] },
      {
        id: 'useContext',
        label: 'Gebruik',
        aliases: ['Gebruik', 'useContext', 'Professioneel', 'Consument'],
      },
    ],
  },
  kitchen: {
    type: 'kitchen',
    filterSchema: 'kitchen',
    calculator: 'none',
    cta: { mode: 'cart_and_quote' },
    serviceLinks: [],
    related: {
      preferSubcategory: true,
      complementaryCategorySlugs: ['keuken', 'horeca'],
      complementarySubcategorySlugs: ['kranen', 'accessoires', 'keukenapparatuur'],
    },
    variantSlots: ['color', 'configuration'],
    keySpecs: [
      COMMON_DIM,
      {
        id: 'composition',
        label: 'Samenstelling',
        aliases: ['Samenstelling', 'composition', 'Kasten'],
      },
      { id: 'worktop', label: 'Werkblad', aliases: ['Werkblad', 'worktop'] },
      {
        id: 'appliances',
        label: 'Apparatuur',
        aliases: ['Apparatuur', 'appliances', 'Inbegrepen'],
      },
      { id: 'color', label: 'Kleur', aliases: ['Kleur', 'color'] },
      { id: 'material', label: 'Materiaal', aliases: ['Materiaal', 'material'] },
      {
        id: 'configuration',
        label: 'Opstelling',
        aliases: ['Opstelling', 'configuration', 'Uitvoering'],
      },
    ],
  },
  horeca: {
    type: 'horeca',
    filterSchema: 'horeca',
    calculator: 'none',
    cta: { mode: 'cart_and_quote', quoteProminent: true },
    serviceLinks: [],
    related: {
      preferSubcategory: true,
      complementaryCategorySlugs: ['horeca', 'koelen-vriezen'],
      complementarySubcategorySlugs: ['accessoires', 'rvs-meubilair'],
    },
    variantSlots: [],
    keySpecs: [
      {
        id: 'useContext',
        label: 'Gebruik',
        aliases: ['Gebruik', 'useContext', 'Professioneel'],
      },
      COMMON_DIM,
      { id: 'capacity', label: 'Capaciteit', aliases: ['Capaciteit', 'Inhoud', 'capacity'] },
      { id: 'connection', label: 'Aansluiting', aliases: ['Aansluiting', 'connection'] },
      { id: 'power', label: 'Vermogen', aliases: ['Vermogen', 'power'] },
      {
        id: 'tempRange',
        label: 'Temperatuurbereik',
        aliases: ['Temperatuurbereik', 'tempRange'],
      },
      { id: 'material', label: 'Materiaal', aliases: ['Materiaal', 'material'] },
      {
        id: 'energyType',
        label: 'Energie',
        aliases: ['Energie', 'energyType', 'Gas', 'Elektrisch'],
      },
    ],
  },
  doors: {
    type: 'doors',
    filterSchema: 'living',
    calculator: 'none',
    cta: { mode: 'cart' },
    serviceLinks: [],
    related: {
      preferSubcategory: true,
      complementaryCategorySlugs: ['wonen'],
      complementarySubcategorySlugs: ['deuren'],
    },
    variantSlots: [],
    keySpecs: [
      { id: 'height', label: 'Hoogte', aliases: ['Hoogte', 'height'] },
      { id: 'width', label: 'Breedte', aliases: ['Breedte', 'width'] },
      { id: 'thickness', label: 'Dikte', aliases: ['Dikte', 'thickness'] },
      COMMON_DIM,
      { id: 'material', label: 'Materiaal', aliases: ['Materiaal', 'material'] },
      {
        id: 'direction',
        label: 'Draairichting',
        aliases: ['Draairichting', 'direction', 'Öffnungsrichtung'],
      },
      {
        id: 'frame',
        label: 'Kozijn',
        aliases: ['Kozijn', 'frame', 'Frame'],
      },
      { id: 'finish', label: 'Afwerking', aliases: ['Afwerking', 'finish'] },
    ],
  },
  generic: {
    type: 'generic',
    filterSchema: 'generic',
    calculator: 'none',
    cta: { mode: 'cart' },
    serviceLinks: [],
    related: {
      preferSubcategory: true,
      complementaryCategorySlugs: [],
      complementarySubcategorySlugs: [],
    },
    variantSlots: [],
    keySpecs: [
      COMMON_DIM,
      { id: 'material', label: 'Materiaal', aliases: ['Materiaal', 'material'] },
      { id: 'color', label: 'Kleur', aliases: ['Kleur', 'color'] },
      { id: 'warranty', label: 'Garantie', aliases: ['Garantie', 'warranty'] },
    ],
  },
}

const CATEGORY_TYPE: Record<string, ProductPresentationType> = {
  vloeren: 'flooring',
  pvc: 'flooring',
  'klik-pvc': 'flooring',
  'plak-pvc': 'flooring',
  laminaat: 'flooring',
  parket: 'flooring',
  tegels: 'flooring',
  ondervloeren: 'flooring',
  profielen: 'flooring',
  vloeraccessoires: 'flooring',
  meubels: 'furniture',
  banken: 'furniture',
  hoekbanken: 'furniture',
  fauteuils: 'furniture',
  stoelen: 'furniture',
  eettafels: 'furniture',
  salontafels: 'furniture',
  kasten: 'furniture',
  bedden: 'furniture',
  'koelen-vriezen': 'cooling',
  'koel-vriescombinaties': 'cooling',
  horecakoeling: 'cooling',
  koelvitrines: 'cooling',
  koelwerkbanken: 'cooling',
  keuken: 'kitchen',
  keukenkasten: 'kitchen',
  keukenapparatuur: 'kitchen',
  horeca: 'horeca',
  koeling: 'horeca',
  kookapparatuur: 'horeca',
  'rvs-meubilair': 'horeca',
  'professionele-keuken': 'horeca',
  deuren: 'doors',
}

export function resolvePresentationType(
  categorySlug?: string | null,
  subcategorySlug?: string | null,
): ProductPresentationType {
  if (subcategorySlug && CATEGORY_TYPE[subcategorySlug]) return CATEGORY_TYPE[subcategorySlug]
  if (categorySlug && CATEGORY_TYPE[categorySlug]) return CATEGORY_TYPE[categorySlug]
  return 'generic'
}

export function getPresentationConfig(
  categorySlug?: string | null,
  subcategorySlug?: string | null,
): ProductPresentationConfig {
  const type = resolvePresentationType(categorySlug, subcategorySlug)
  const base = PRODUCT_PRESENTATION[type]
  if (type === 'generic' && categorySlug === 'wonen') {
    return { ...base, filterSchema: 'living' }
  }
  if (categorySlug === 'outlet') {
    return { ...PRODUCT_PRESENTATION.generic, filterSchema: 'outlet' }
  }
  if (categorySlug === 'zakelijk') {
    return { ...PRODUCT_PRESENTATION.generic, filterSchema: 'business', cta: { mode: 'cart_and_quote', quoteProminent: true } }
  }
  return base
}

const DIAGRAM_HINT =
  /\b(tekening|schema|diagram|technische|skizze|zeichnung|lineart|exploded|doorsnede)\b/i

/**
 * Card media fit: lifestyle/floor textures crop; appliances/diagrams contain.
 * Explicit image.fit from the API always wins.
 */
export function resolveCardImageFit(input: {
  fit?: 'cover' | 'contain' | null
  categorySlug?: string | null
  subcategorySlug?: string | null
  alt?: string | null
  name?: string | null
  width?: number | null
  height?: number | null
}): 'cover' | 'contain' {
  if (input.fit === 'cover' || input.fit === 'contain') return input.fit

  const text = `${input.alt ?? ''} ${input.name ?? ''}`
  if (DIAGRAM_HINT.test(text)) return 'contain'

  const type = resolvePresentationType(input.categorySlug, input.subcategorySlug)
  if (type === 'furniture' || type === 'flooring') return 'cover'
  if (input.subcategorySlug === 'tuinmeubels') return 'cover'
  if (input.categorySlug === 'wonen' && type !== 'doors') return 'cover'

  // Tall/narrow technical shots often need letterboxing.
  if (
    input.width &&
    input.height &&
    input.width > 0 &&
    input.height > 0 &&
    (input.height / input.width > 1.35 || input.width / input.height > 1.8)
  ) {
    return 'contain'
  }

  // Appliances, doors, horeca, generic / huishouden: keep product fully visible.
  return 'contain'
}
