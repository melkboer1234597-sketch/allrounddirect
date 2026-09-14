/**
 * Idempotent Dutch storefront normalization for imported catalog text.
 * Preserves original_source_name; never invents product facts.
 */
const TITLE_PHRASES: Array<[RegExp, string]> = [
  [/zum Klicken/gi, 'met kliksysteem'],
  [/Korkvloer/gi, 'kurkvloer'],
  [/Korkboden/gi, 'kurkvloer'],
  [/Waschmaschinenumbauschrank/gi, 'Wasmachinekast'],
  [/Waschmaschine/gi, 'wasmachine'],
  [/Kühlschrank/gi, 'koelkast'],
  [/Kuhlschrank/gi, 'koelkast'],
  [/Gefrierschrank/gi, 'vriezer'],
  [/Geschirrspüler/gi, 'vaatwasser'],
  [/Geschirrspuler/gi, 'vaatwasser'],
  [/Einbauherd/gi, 'inbouwfornuis'],
  [/Backofen/gi, 'oven'],
  [/Herd/gi, 'fornuis'],
  [/Singleküche/gi, 'Compacte keuken'],
  [/Singlekuche/gi, 'Compacte keuken'],
  [/Gartenhaus/gi, 'Tuinhuis'],
  [/Haustür/gi, 'voordeur'],
  [/Haustur/gi, 'voordeur'],
  [/Innentür/gi, 'binnendeur'],
  [/Innentur/gi, 'binnendeur'],
  [/Türgriff/gi, 'deurkruk'],
  [/Turgriff/gi, 'deurkruk'],
  [/Türbänder/gi, 'deurhengsels'],
  [/Türbander/gi, 'deurhengsels'],
  [/Lichtausschnitt/gi, 'glasopening'],
  [/Röhrenspan/gi, 'tubusspaan'],
  [/Rohrenspan/gi, 'tubusspaan'],
  [/Rundkante/gi, 'ronde kant'],
  [/Glaszaun/gi, 'glashek'],
  [/Pfosten-Zarge/gi, 'paal-kozijn'],
  [/zum Einbetonieren/gi, 'voor inbetoneren'],
  [/Terrassenschrubber/gi, 'terrasschrobborstel'],
  [/Terrassendielen/gi, 'terrassplanken'],
  [/Laminatboden/gi, 'laminaatvloer'],
  [/im Paket/gi, 'per pak'],
  [/pro Paket/gi, 'per pak'],
  [/pro Stück/gi, 'per stuk'],
  [/Stuck/gi, 'stuk'],
  [/Balkonset für/gi, 'Balkonset voor'],
  [/Balkonset fur/gi, 'Balkonset voor'],
  [/platzsparend/gi, 'plaatsbesparend'],
  [/Teppichboden/gi, 'tapijtvloer'],
  [/Meterware/gi, 'op maat'],
  [/Objektbereich/gi, 'projecttoepassing'],
  [/Wohnung und Gewerbe/gi, 'woning en zakelijk'],
  [/Wohnung en Gewerbe/gi, 'woning en zakelijk'],
  [/für den/gi, 'voor de'],
  [/fur den/gi, 'voor de'],
  [/\bfür\b/gi, 'voor'],
  [/\bfur\b/gi, 'voor'],
  [/\bzum\b/gi, 'voor'],
  [/\bzur\b/gi, 'voor'],
  [/\bund\b/gi, 'en'],
  [/\bmit\b/gi, 'met'],
  [/\bohne\b/gi, 'zonder'],
  [/natur strukturiert/gi, 'naturel gestructureerd'],
  [/strukturiert/gi, 'gestructureerd'],
  [/lackiert/gi, 'gelakt'],
  [/vernickelt/gi, 'vernikkeld'],
  [/Kunststoff/gi, 'kunststof'],
  [/Holztüren/gi, 'houten deuren'],
  [/Holzturen/gi, 'houten deuren'],
  [/Holzzargen/gi, 'houten kozijnen'],
  [/Knauff/gi, 'knop'],
  [/Zierkissen/gi, 'sierkussen'],
  [/Rückenkissen/gi, 'rugkussen'],
  [/Ruckenkissen/gi, 'rugkussen'],
  [/Nierenkissen/gi, 'nierkussen'],
  [/Armteilverstellung/gi, 'verstelbare armleuning'],
  [/Microfaser/gi, 'microvezel'],
  [/Kordstoff/gi, 'corduroy'],
  [/grafietfarben/gi, 'grafietkleurig'],
  [/zilverfarben/gi, 'zilverkleurig'],
  [/hellgrijs/gi, 'lichtgrijs'],
  [/dunkelgrijs/gi, 'donkergrijs'],
  [/Dunkel/gi, 'donker'],
  [/Ligvlak/gi, 'ligvlak'],
  [/Lattenrost/gi, 'lattenbodem'],
  [/houtbett/gi, 'houten bed'],
  [/Fliesenabdeckleisten/gi, 'tegelplinten'],
  [/ähnlich RAL/gi, 'vergelijkbaar met RAL'],
  [/ahnlich RAL/gi, 'vergelijkbaar met RAL'],
  [/L-Form/gi, 'L-vorm'],
]

const BODY_PHRASES: Array<[RegExp, string]> = [
  ...TITLE_PHRASES,
  [/\bMaße\b/gi, 'Afmetingen'],
  [/\bMasse\b/gi, 'Afmetingen'],
  [/\bBreite\b/gi, 'Breedte'],
  [/\bHöhe\b/gi, 'Hoogte'],
  [/\bHohe\b/gi, 'Hoogte'],
  [/\bTiefe\b/gi, 'Diepte'],
  [/\bLänge\b/gi, 'Lengte'],
  [/\bLange\b/gi, 'Lengte'],
  [/\bFarbe\b/gi, 'Kleur'],
  [/\bMaterial\b/gi, 'Materiaal'],
  [/\bGewicht\b/gi, 'Gewicht'],
  [/\bOberfläche\b/gi, 'Afwerking'],
  [/\bOberflache\b/gi, 'Afwerking'],
  [/Paketinhalt/gi, 'Pakinhoud'],
  [/Packungsinhalt/gi, 'Pakinhoud'],
  [/Nutzungsklasse/gi, 'Gebruiksklasse'],
  [/Beanspruchungsklasse/gi, 'Gebruiksklasse'],
  [/Wohnbereich/gi, 'woonruimte'],
  [/Gewerbebereich/gi, 'zakelijke ruimte'],
  [/Fußbodenheizung/gi, 'vloerverwarming'],
  [/Fussbodenheizung/gi, 'vloerverwarming'],
  [/Lieferumfang/gi, 'Leveromvang'],
  [/Lieferung/gi, 'Levering'],
  [/\bGarantie\b/gi, 'Garantie'],
  [/Temperaturbereich/gi, 'Temperatuurbereik'],
  [/\bLeistung\b/gi, 'Vermogen'],
  [/\bSpannung\b/gi, 'Spanning'],
  [/\bInhalt\b/gi, 'Inhoud'],
  [/Jetzt online kaufen\.?/gi, ''],
  [/Kostenloser Versand\.?/gi, ''],
  [/123 Tage Rückgaberecht\.?/gi, ''],
  [/123 Tage Ruckgaberecht\.?/gi, ''],
  [/Bestellen Sie hier/gi, ''],
  [/lassen sich Fach-kompetent beraten!/gi, ''],
  [/lassen Sie sich fachkundig beraten!/gi, ''],
  [/Alle Vorteile auf einen Blick:?/gi, ''],
  [/Der Laminatboden ist besonders widerstandsfähig/gi, 'Deze laminaatvloer is bijzonder slijtvast'],
  [/Der Laminatboden ist besonders widerstandsfaehig/gi, 'Deze laminaatvloer is bijzonder slijtvast'],
  [/widerstandsfähig/gi, 'slijtvast'],
  [/widerstandsfahig/gi, 'slijtvast'],
  [/hoogwaardig/gi, 'hoogwaardig'],
  [/Durch die Anti-Statik-Technologie/gi, 'Door de antistatische technologie'],
  [/natürlichen Inhaltsstoffen/gi, 'natuurlijke bestanddelen'],
  [/naturlichen Inhaltsstoffen/gi, 'natuurlijke bestanddelen'],
  [/bietet er eine hohe Wohnqualität/gi, 'biedt hij een hoge woonkwaliteit'],
  [/bietet er eine hohe Wohnqualitat/gi, 'biedt hij een hoge woonkwaliteit'],
  [/Platzsparende Balkongruppe/gi, 'Plaatsbesparende balkon set'],
  [/Aus wetterbeständigem Polyrattan/gi, 'Van weerbestendig polyrattan'],
  [/Aus wetterbestandigem Polyrattan/gi, 'Van weerbestendig polyrattan'],
  [/Ovale Tischplatte aus Sicherheitsglas/gi, 'Ovale tafelblad van veiligheidsglas'],
  [/Gepolsterte Sitzauflagen inklusive/gi, 'Gepolsterde zitkussens inbegrepen'],
  [/Im Set enthalten sind:/gi, 'Inbegrepen in de set:'],
  [/Verlängerter Pfosten/gi, 'Verlengde paal'],
  [/Verlangerter Pfosten/gi, 'Verlengde paal'],
  [/Klemmbacken Öffnung/gi, 'klemmen opening'],
  [/Klemmbacken Offnung/gi, 'klemmen opening'],
  [/lässt sich dank/gi, 'laat zich dankzij'],
  [/lasst sich dank/gi, 'laat zich dankzij'],
  [/Stabparkettoptik/gi, 'strookparketlook'],
  [/in jeden Wohnbereich integrieren/gi, 'in elke woonruimte passen'],
  [/rustikale Optik/gi, 'rustieke uitstraling'],
]

const SPEC_LABELS: Record<string, string> = {
  Maße: 'Afmetingen',
  Masse: 'Afmetingen',
  Breite: 'Breedte',
  Höhe: 'Hoogte',
  Hohe: 'Hoogte',
  Tiefe: 'Diepte',
  Länge: 'Lengte',
  Lange: 'Lengte',
  Farbe: 'Kleur',
  Material: 'Materiaal',
  Gewicht: 'Gewicht',
  Oberfläche: 'Afwerking',
  Oberflache: 'Afwerking',
  Paketinhalt: 'Pakinhoud',
  Packungsinhalt: 'Pakinhoud',
  Nutzungsklasse: 'Gebruiksklasse',
  Beanspruchungsklasse: 'Gebruiksklasse',
  Leistung: 'Vermogen',
  Spannung: 'Spanning',
  Inhalt: 'Inhoud',
  Temperaturbereich: 'Temperatuurbereik',
  Lieferumfang: 'Leveromvang',
  Garantie: 'Garantie',
  Dicke: 'Dikte',
}

const GERMAN_REMNANT =
  /\b(zum|zur|eine|einer|nicht|oder|auch|Größe|Maße|Lieferung|Packung|Haustür|Waschmaschine|geeignet|Nutzungsklasse|Fußboden|Klicken|Gartenhaus|Vordach|Kunststoff|Wohnbereich|Gewerbebereich|Oberfläche|Paketinhalt|Rückgaberecht|Bestellen Sie|Vorteile auf|widerstandsfähig|Teppichboden|Laminatboden|Türgriff|Einbetonieren)\b/i

export function repairMojibake(value: string): string {
  return value
    .replaceAll('├╝', 'ü')
    .replaceAll('├ä', 'ä')
    .replaceAll('├ö', 'ö')
    .replaceAll('├Â', 'ô')
    .replaceAll('├ñ', 'ä')
    .replaceAll('ÔÇ×', '“')
    .replaceAll('ÔÇô', '–')
    .replaceAll('ÔÇ£', '”')
    .replaceAll('┬▓', '²')
    .replaceAll('Ã¼', 'ü')
    .replaceAll('Ã¤', 'ä')
    .replaceAll('Ã¶', 'ö')
    .replaceAll('ÃŸ', 'ß')
    .replaceAll('Â', '')
}

function applyPhrases(input: string, phrases: Array<[RegExp, string]>): string {
  let value = repairMojibake(input)
  for (const [pattern, replacement] of phrases) {
    value = value.replace(pattern, replacement)
  }
  return value.replace(/\s+/g, ' ').trim()
}

export function normalizeCatalogText(input: string): string {
  return applyPhrases(input, BODY_PHRASES)
}

export function looksGerman(text: string): boolean {
  return GERMAN_REMNANT.test(repairMojibake(text))
}

export function normalizeProductTitle(name: string): string {
  const cleaned = applyPhrases(name, TITLE_PHRASES)
  if (cleaned.length <= 110) return cleaned
  const cut = cleaned.slice(0, 107)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`
}

export function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeDescription(description: string | null | undefined): {
  shortDescription: string | null
  description: string | null
  needsReview: boolean
} {
  if (!description?.trim()) return { shortDescription: null, description: null, needsReview: false }
  const plain = stripHtml(description)
  const normalized = normalizeCatalogText(plain)
  const cleaned = normalized
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const germanHeavy =
    looksGerman(cleaned) &&
    (cleaned.match(/\b(der|die|das|und|mit|für|fur|ist|eine|sich|auf|den|dem)\b/gi) ?? []).length >= 4

  if (germanHeavy) {
    const specs = extractSpecifications(cleaned)
    const specLines = Object.entries(specs)
      .slice(0, 8)
      .map(([label, value]) => `${label}: ${value}`)
    return {
      shortDescription:
        specLines[0] != null
          ? `${specLines.slice(0, 2).join('. ')}.`
          : null,
      description: specLines.length
        ? specLines.join('\n')
        : null,
      needsReview: true,
    }
  }

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && !/bricoflor|paypal|klarna/i.test(s))
  const shortDescription = sentences.slice(0, 2).join(' ').slice(0, 280) || cleaned.slice(0, 220)
  const body = sentences.slice(0, 6).join(' ').slice(0, 1200) || cleaned.slice(0, 800)
  return {
    shortDescription: shortDescription || null,
    description: body || null,
    needsReview: looksGerman(cleaned),
  }
}

export function normalizeSpecLabels(
  specs: Record<string, string> | null | undefined,
): Record<string, string> {
  if (!specs) return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(specs)) {
    const mapped = SPEC_LABELS[key] ?? normalizeCatalogText(key)
    const val = normalizeCatalogText(String(value))
    if (!mapped || !val) continue
    out[mapped] = val
  }
  return out
}

export function extractSpecifications(description: string): Record<string, string> {
  const text = normalizeCatalogText(description)
  const specs: Record<string, string> = {}
  const pairs: Array<[RegExp, string]> = [
    [/(?:Afmetingen|B\/H\/D)\s*[:.]?\s*([0-9].{2,80}?(?:cm|mm))/i, 'Afmetingen'],
    [/Dikte\s*[:.]?\s*([0-9][0-9.,\s]*mm)/i, 'Dikte'],
    [/Pakinhoud\s*[:.]?\s*([^\n.;]{2,80})/i, 'Pakinhoud'],
    [/Gebruiksklasse\s*[:.]?\s*([^\n.;]{1,40})/i, 'Gebruiksklasse'],
    [/vloerverwarming\s*[:.]?\s*([^\n.;]{1,40})/i, 'Geschikt voor vloerverwarming'],
    [/Garantie\s*[:.]?\s*([^\n.;]{2,40})/i, 'Garantie'],
    [/Energieklasse\s*[:.]?\s*([A-G][\+\-0-9]*)/i, 'Energieklasse'],
    [/Inhoud\s*[:.]?\s*([0-9][0-9.,\s]*l)/i, 'Inhoud'],
    [/Vermogen\s*[:.]?\s*([0-9][0-9.,\s]*k?W)/i, 'Vermogen'],
    [/Zitplaatsen\s*[:.]?\s*([0-9]{1,2})/i, 'Zitplaatsen'],
    [/Kleur\s*[:.]?\s*([^\n.;]{2,40})/i, 'Kleur'],
    [/Materiaal\s*[:.]?\s*([^\n.;]{2,60})/i, 'Materiaal'],
    [/Afwerking\s*[:.]?\s*([^\n.;]{2,60})/i, 'Afwerking'],
  ]
  for (const [pattern, label] of pairs) {
    const match = text.match(pattern)
    if (match?.[1]) specs[label] = match[1].trim()
  }
  const dim = text.match(/B\/L:\s*ca\.\s*([0-9x×.,\s]+cm)/i)
  if (dim?.[1] && !specs.Afmetingen) specs.Afmetingen = dim[1].trim()
  return specs
}

export type ImageSignals = {
  width: number | null
  height: number | null
  filename: string | null
  hash: string | null
  reuseCount: number
}

export function suspiciousImageReason(image: ImageSignals): string | null {
  const width = image.width ?? 0
  const height = image.height ?? 0
  const filename = (image.filename ?? '').toLowerCase()
  const aspect = width > 0 && height > 0 ? width / height : 0
  if (/banner|aktion|sale|paypal|klarna|visa|goldener|september|newsletter|slider|header/.test(filename)) {
    return 'promotional_filename'
  }
  if (image.reuseCount >= 8) return 'reused_across_many_products'
  if (image.reuseCount >= 5 && (aspect >= 2.2 || Math.min(width, height) < 120)) {
    return 'reused_banner_like'
  }
  if (height > 0 && height <= 60 && width >= 200) return 'text_banner_strip'
  if (aspect >= 2.6) return 'extreme_banner_aspect'
  if (width > 0 && height > 0 && Math.min(width, height) < 80) return 'tiny_graphic'
  return null
}

export function scorePrimaryCandidate(image: ImageSignals): number {
  const width = image.width ?? 0
  const height = image.height ?? 0
  if (!width || !height) return 0
  if (suspiciousImageReason(image)) return -1000
  const aspect = width / height
  let score = Math.log((width * height) / 1000 + 1) * 10
  if (aspect >= 1.2 && aspect <= 1.8) score += 25
  else if (aspect >= 0.85 && aspect <= 1.25) score += 18
  else if (aspect > 2.2) score -= 40
  if (Math.min(width, height) >= 600) score += 10
  if (Math.min(width, height) < 300) score -= 20
  return score
}

export function suggestedCategory(input: {
  name: string
  description: string
  parentSlug: string
  categorySlug: string
}): { parentSlug: string; categorySlug: string; reason?: string; ambiguous?: boolean } {
  const haystack = `${input.name} ${input.description}`.toLowerCase()
  if (/wicanders|cork essence|kurkvloer|kurk klik/.test(haystack)) {
    return { parentSlug: 'vloeren', categorySlug: 'parket', reason: 'kurkvloer' }
  }
  if (/wasmachinekast|umbauschrank|umbvanchrank/.test(haystack)) {
    return { parentSlug: 'meubels', categorySlug: 'kasten', reason: 'wasmachinekast' }
  }
  if (/tuinhuis|gartenhaus/.test(haystack)) {
    return { parentSlug: 'wonen', categorySlug: 'tuinmeubels', ambiguous: true, reason: 'tuinhuis' }
  }
  return { parentSlug: input.parentSlug, categorySlug: input.categorySlug }
}

export function hamming(a: string, b: string): number {
  const len = Math.min(a.length, b.length)
  let dist = 0
  for (let i = 0; i < len; i += 1) if (a[i] !== b[i]) dist += 1
  return dist + Math.abs(a.length - b.length)
}
