import {
  getPresentationConfig,
  type ProductPresentationConfig,
  type ProductPresentationType,
  type SpecFieldDef,
} from '../../shared/product-presentation'
import type { CatalogProduct } from '@/types/catalog'
import type { FilterSchemaId } from '@/data/taxonomy'

export type ResolvedSpec = {
  id: string
  label: string
  value: string
}

export type ProductVariantOption = {
  id: string
  name: string
  options: Record<string, string>
  sku?: string
  priceInclCents?: number | null
  stockStatus?: string
  imageUrl?: string | null
}

const NOISE =
  /\b(Wohnbereich|Fußboden|Packungsinhalt|Nutzungsklasse|ist der|für stark|schaffen die)\b/i

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function isUsableValue(value: unknown): value is string | number | boolean {
  if (value == null) return false
  if (typeof value === 'boolean' || typeof value === 'number') return true
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (trimmed.length < 1 || trimmed.length > 120) return false
  if (NOISE.test(trimmed)) return false
  if (/^(im|für|der|die|das)\s/i.test(trimmed)) return false
  if (/[äöüß]/i.test(trimmed) && trimmed.split(/\s+/).length > 3) return false
  return true
}

function formatValue(value: string | number | boolean): string {
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nee'
  return String(value).trim()
}

type SpecSource = { key: string; value: string }

function sourceEntries(product: CatalogProduct): SpecSource[] {
  const out: SpecSource[] = []
  const seen = new Set<string>()
  const bags = [product.specifications ?? {}, product.attributes ?? {}]
  for (const bag of bags) {
    for (const [rawKey, rawValue] of Object.entries(bag)) {
      if (!isUsableValue(rawValue)) continue
      const key = rawKey.trim()
      const norm = normalizeKey(key)
      if (seen.has(norm)) continue
      seen.add(norm)
      out.push({ key, value: formatValue(rawValue) })
    }
  }
  return out
}

function matchField(field: SpecFieldDef, sources: SpecSource[]): string | null {
  for (const alias of [field.label, field.id, ...field.aliases]) {
    const needle = normalizeKey(alias)
    const hit = sources.find((item) => normalizeKey(item.key) === needle)
    if (hit) return hit.value
  }
  return null
}

export function presentationForProduct(product: CatalogProduct): ProductPresentationConfig {
  return getPresentationConfig(product.categorySlug, product.subcategorySlug)
}

export function presentationTypeForProduct(product: CatalogProduct): ProductPresentationType {
  return presentationForProduct(product).type
}

export function filterSchemaForCategory(
  categorySlug?: string | null,
  subcategorySlug?: string | null,
): FilterSchemaId {
  return getPresentationConfig(categorySlug, subcategorySlug).filterSchema as FilterSchemaId
}

/** Ordered key specs for the buy box — only fields with real values. */
export function resolveKeySpecs(
  product: CatalogProduct,
  config = presentationForProduct(product),
  limit = 8,
): ResolvedSpec[] {
  const sources = sourceEntries(product)
  const out: ResolvedSpec[] = []
  const seen = new Set<string>()

  for (const field of config.keySpecs) {
    const value = matchField(field, sources)
    if (!value) continue
    const dedupe = `${field.id}:${normalizeKey(value)}`
    if (seen.has(dedupe)) continue
    seen.add(dedupe)
    out.push({ id: field.id, label: field.label, value })
    if (out.length >= limit) break
  }
  return out
}

/** Full specs table: key specs first (in config order), then remaining real values. */
export function resolveAllSpecs(
  product: CatalogProduct,
  config = presentationForProduct(product),
): ResolvedSpec[] {
  const sources = sourceEntries(product)
  const out: ResolvedSpec[] = []
  const usedKeys = new Set<string>()

  for (const field of config.keySpecs) {
    const value = matchField(field, sources)
    if (!value) continue
    out.push({ id: field.id, label: field.label, value })
    for (const alias of [field.label, field.id, ...field.aliases]) {
      usedKeys.add(normalizeKey(alias))
    }
  }

  for (const item of sources) {
    if (usedKeys.has(normalizeKey(item.key))) continue
    out.push({ id: item.key, label: item.key, value: item.value })
  }
  return out
}

/** Parse pack coverage in m² from a stored value. Returns null if unknown. */
export function parsePackCoverageM2(value: string | undefined | null): number | null {
  if (!value) return null
  const normalized = value.replace(',', '.').trim()
  const withUnit = normalized.match(/(\d+(?:\.\d+)?)\s*(?:m²|m2|qm)(?=$|[\s,;/)\]])/i)
  if (withUnit) {
    const n = Number(withUnit[1])
    return Number.isFinite(n) && n > 0 ? n : null
  }
  // Only accept bare numbers when the field itself is pack coverage (caller gates on field id).
  const bare = normalized.match(/^(\d+(?:\.\d+)?)$/)
  if (bare) {
    const n = Number(bare[1])
    // Floor packs are typically 0.5–5 m²; reject outliers to avoid inventing meaning.
    if (Number.isFinite(n) && n >= 0.4 && n <= 12) return n
  }
  return null
}

export function flooringPackCoverage(product: CatalogProduct): number | null {
  const config = presentationForProduct(product)
  if (config.calculator !== 'flooring-packs') return null
  const pack = resolveKeySpecs(product, config, 20).find((item) => item.id === 'packCoverage')
  return parsePackCoverageM2(pack?.value)
}

export function cardHighlightSpecs(product: CatalogProduct, limit = 2): ResolvedSpec[] {
  return resolveKeySpecs(product, presentationForProduct(product), limit)
}

/**
 * Variant UI only when real variant records exist.
 * Maps known option keys onto configured variant slots — never invents options.
 */
export function resolveVariantSlots(
  product: CatalogProduct,
  variants: ProductVariantOption[] | undefined,
  config = presentationForProduct(product),
): Array<{ slot: (typeof config.variantSlots)[number]; label: string; values: string[] }> {
  if (!variants?.length || !config.variantSlots.length) return []
  const labelBySlot = {
    orientation: 'Oriëntatie',
    color: 'Kleur',
    fabric: 'Stof',
    configuration: 'Uitvoering',
  } as const
  const keyHints: Record<(typeof config.variantSlots)[number], string[]> = {
    orientation: ['orientation', 'oriëntatie', 'hoek', 'links', 'rechts', 'corner'],
    color: ['color', 'kleur', 'farbe'],
    fabric: ['fabric', 'stof', 'bekleding'],
    configuration: ['configuration', 'uitvoering', 'opstelling'],
  }

  const slots: Array<{
    slot: (typeof config.variantSlots)[number]
    label: string
    values: string[]
  }> = []

  for (const slot of config.variantSlots) {
    const values = new Set<string>()
    for (const variant of variants) {
      for (const [key, value] of Object.entries(variant.options ?? {})) {
        if (!value) continue
        if (keyHints[slot].some((hint) => normalizeKey(key).includes(hint))) {
          values.add(String(value))
        }
      }
    }
    if (values.size > 1) {
      slots.push({ slot, label: labelBySlot[slot], values: [...values] })
    }
  }
  return slots
}
