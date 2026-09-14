import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { mappingForFolder, refineVloerenSlug, type FolderMapping } from './category-map.ts'
import { sha256FileBuffer, sha256Text, stableProductId } from './image-hash.ts'
import { slugify } from './slug.ts'

export const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const IGNORE = new Set(['thumbs.db', 'desktop.ini', 'product.json', 'readme.txt', '.ds_store'])
const JUNK_NAME = /paypal|klarna|visa|mastercard|payment|card_neu|logo|icon-16|x16\b/i

export const sourceProductSchema = z
  .object({
    name: z.string().optional().nullable(),
    name_nl: z.string().optional().nullable(),
    name_de: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    description_nl: z.string().optional().nullable(),
    description_de: z.string().optional().nullable(),
    url: z.string().optional().nullable(),
    sku: z.union([z.string(), z.number()]).optional().nullable(),
    bron: z.string().optional().nullable(),
    current_price: z.union([z.string(), z.number()]).optional().nullable(),
    old_price: z.union([z.string(), z.number()]).optional().nullable(),
    currency: z.string().optional().nullable(),
    price_per_m2: z.boolean().optional().nullable(),
    images: z.array(z.string()).optional(),
    local_images: z.array(z.string()).optional(),
    breadcrumbs: z.array(z.string()).optional(),
    category: z.string().optional().nullable(),
    scraped_at: z.string().optional().nullable(),
  })
  .passthrough()

export type SourceProductJson = z.infer<typeof sourceProductSchema>

export type SourceImage = {
  filename: string
  absPath: string
  bytes: number
  ext: string
  hash?: string
}

export type ScannedProduct = {
  dir: string
  folder: string
  jsonPath: string
  raw: SourceProductJson | null
  parseError?: string
  images: SourceImage[]
}

export function defaultSourceDir(): string {
  return (
    process.env.CATALOG_SOURCE_DIR?.trim() ||
    'C:\\Users\\Tins\\Desktop\\scraper\\Allround\\scraped_producten'
  )
}

export function eurosToCents(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null
  const asString = String(value).trim().replace(/\s/g, '').replace(',', '.')
  const num = Number(asString)
  if (!Number.isFinite(num) || num < 0) return null
  return Math.round(num * 100)
}

export function scanProductFolders(rootDir: string): ScannedProduct[] {
  if (!existsSync(rootDir)) throw new Error(`Bronmap niet gevonden: ${rootDir}`)
  const folders = readdirSync(rootDir, { withFileTypes: true }).filter((item) => item.isDirectory())
  const products: ScannedProduct[] = []

  for (const folder of folders) {
    const folderPath = path.join(rootDir, folder.name)
    const children = readdirSync(folderPath, { withFileTypes: true }).filter((item) =>
      item.isDirectory(),
    )
    for (const child of children) {
      const dir = path.join(folderPath, child.name)
      const jsonPath = path.join(dir, 'product.json')
      const images = listImages(dir)
      if (!existsSync(jsonPath)) {
        products.push({
          dir,
          folder: folder.name,
          jsonPath,
          raw: null,
          parseError: 'product.json ontbreekt',
          images,
        })
        continue
      }
      try {
        const parsed = sourceProductSchema.parse(JSON.parse(readFileSync(jsonPath, 'utf8')))
        products.push({ dir, folder: folder.name, jsonPath, raw: parsed, images })
      } catch (error) {
        products.push({
          dir,
          folder: folder.name,
          jsonPath,
          raw: null,
          parseError: error instanceof Error ? error.message : 'Ongeldige JSON',
          images,
        })
      }
    }
  }
  return products
}

function listImages(dir: string): SourceImage[] {
  return readdirSync(dir)
    .filter((name) => {
      const lower = name.toLowerCase()
      if (IGNORE.has(lower)) return false
      if (JUNK_NAME.test(lower)) return false
      return IMAGE_EXT.has(path.extname(lower))
    })
    .sort()
    .map((filename) => {
      const absPath = path.join(dir, filename)
      const st = statSync(absPath)
      return {
        filename,
        absPath,
        bytes: st.size,
        ext: path.extname(filename).toLowerCase(),
      }
    })
}

export function displayName(raw: SourceProductJson): string {
  return (raw.name_nl || raw.name || raw.name_de || '').trim()
}

export function displayDescription(raw: SourceProductJson): string {
  return (raw.description_nl || raw.description || raw.description_de || '').trim()
}

export type NormalizedProduct = {
  dir: string
  id: string
  slug: string
  name: string
  sku: string | null
  description: string
  shortDescription: string
  priceCents: number | null
  compareAtCents: number | null
  currency: string
  pricePerM2: boolean
  sourceName: string
  sourceUrl: string
  sourceProductId: string
  sourceRightsStatus: 'needs_review'
  mapping: FolderMapping
  categorySlug: string
  parentSlug: string
  brandName: string | null
  images: SourceImage[]
  warnings: string[]
  invalidReason?: string
  nameKey: string
}

export function normalizeProduct(scanned: ScannedProduct): NormalizedProduct | null {
  const mapping = mappingForFolder(scanned.folder)
  if (!mapping) {
    return null
  }
  if (!scanned.raw) {
    return {
      dir: scanned.dir,
      id: stableProductId(scanned.folder, scanned.dir, scanned.dir),
      slug: 'ongeldig',
      name: path.basename(scanned.dir),
      sku: null,
      description: '',
      shortDescription: '',
      priceCents: null,
      compareAtCents: null,
      currency: 'EUR',
      pricePerM2: false,
      sourceName: scanned.folder,
      sourceUrl: scanned.dir,
      sourceProductId: path.basename(scanned.dir),
      sourceRightsStatus: 'needs_review',
      mapping,
      categorySlug: mapping.categorySlug,
      parentSlug: mapping.parentSlug,
      brandName: null,
      images: scanned.images,
      warnings: [],
      invalidReason: scanned.parseError || 'Geen product.json',
      nameKey: '',
    }
  }

  const raw = scanned.raw
  const name = displayName(raw)
  const description = stripMarketing(displayDescription(raw))
  const sku = raw.sku != null ? String(raw.sku).trim() : null
  const sourceUrl = (raw.url || '').trim() || `local://${scanned.folder}/${path.basename(scanned.dir)}`
  const sourceName = (raw.bron || scanned.folder).trim()
  const sourceProductId = sku || sha256Text(sourceUrl || scanned.dir).slice(0, 16)
  const warnings: string[] = []
  if (!name) warnings.push('missingName')
  const priceCents = eurosToCents(raw.current_price)
  if (priceCents == null) warnings.push('missingPrice')
  if (!description) warnings.push('missingDescription')
  if (!scanned.images.length) warnings.push('missingImages')

  let categorySlug = mapping.categorySlug
  if (scanned.folder === 'Vloeren') categorySlug = refineVloerenSlug(name)

  const id = stableProductId(sourceName, sourceProductId, sourceUrl || scanned.dir)
  const slug = `${slugify(name)}-${id.slice(0, 8)}`
  const brandName = guessBrand(name)
  const invalidReason = !name ? 'Naam ontbreekt' : undefined

  return {
    dir: scanned.dir,
    id,
    slug,
    name: name || path.basename(scanned.dir),
    sku,
    description,
    shortDescription: description.slice(0, 280),
    priceCents,
    compareAtCents: eurosToCents(raw.old_price),
    currency: (raw.currency || 'EUR').toUpperCase(),
    pricePerM2: Boolean(raw.price_per_m2),
    sourceName,
    sourceUrl,
    sourceProductId,
    sourceRightsStatus: 'needs_review',
    mapping,
    categorySlug,
    parentSlug: mapping.parentSlug,
    brandName,
    images: scanned.images,
    warnings,
    invalidReason,
    nameKey: name.toLowerCase().replace(/\s+/g, ' ').trim(),
  }
}

function stripMarketing(text: string): string {
  return text
    .replace(/[✓➤].*$/g, '')
    .replace(/\b(XXXLutz|poco\.de|Jetzt online kopen).*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function guessBrand(name: string): string | null {
  const first = name.split(/\s+/)[0]
  if (!first || first.length < 2) return null
  if (/^(hoekbank|bank|fauteuil|tuinstoel|keukenblok|wasmachine)$/i.test(first)) return null
  return first
}

export function hashImages(images: SourceImage[]): SourceImage[] {
  return images.map((image) => ({
    ...image,
    hash: sha256FileBuffer(readFileSync(image.absPath)),
  }))
}
