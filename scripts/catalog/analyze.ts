import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { FOLDER_MAP } from '../lib/category-map.ts'
import {
  defaultSourceDir,
  hashImages,
  normalizeProduct,
  scanProductFolders,
  type NormalizedProduct,
  type ScannedProduct,
} from '../lib/product-source-reader.ts'

export type DryRunReport = {
  productsFound: number
  imagesFound: number
  validProducts: number
  warningProducts: number
  invalidProducts: number
  missingNames: number
  missingPrices: number
  missingDescriptions: number
  missingImages: number
  exactDuplicateProducts: Array<{ key: string; paths: string[] }>
  possibleDuplicateProducts: Array<{ key: string; paths: string[] }>
  exactDuplicateImages: number
  uniqueImageHashes: number
  categoriesFound: Record<string, number>
  imageFormatCounts: Record<string, number>
  totalOriginalBytes: number
  estimatedOptimizedBytes: number
  unmappedFolders: string[]
  sampleInvalid: Array<{ dir: string; reason: string }>
}

export function analyzeCatalog(rootDir = defaultSourceDir()): {
  scanned: ScannedProduct[]
  normalized: NormalizedProduct[]
  report: DryRunReport
} {
  const scanned = scanProductFolders(rootDir)
  const hashed = scanned.map((item) => ({ ...item, images: hashImages(item.images) }))
  const normalized = hashed
    .map((item) => normalizeProduct(item))
    .filter((item): item is NormalizedProduct => Boolean(item))

  const mappedFolders = new Set(FOLDER_MAP.map((item) => item.folder))
  const unmappedFolders = [...new Set(scanned.map((item) => item.folder).filter((folder) => !mappedFolders.has(folder)))]

  const byUrl = new Map<string, string[]>()
  const bySku = new Map<string, string[]>()
  const byName = new Map<string, string[]>()
  const imageHashCount = new Map<string, number>()
  const imageFormatCounts: Record<string, number> = {}
  let totalOriginalBytes = 0

  for (const product of normalized) {
    if (product.sourceUrl) {
      const list = byUrl.get(product.sourceUrl) ?? []
      list.push(product.dir)
      byUrl.set(product.sourceUrl, list)
    }
    if (product.sku) {
      const key = `${product.sourceName}:${product.sku}`
      const list = bySku.get(key) ?? []
      list.push(product.dir)
      bySku.set(key, list)
    }
    if (product.nameKey) {
      const list = byName.get(product.nameKey) ?? []
      list.push(product.dir)
      byName.set(product.nameKey, list)
    }
    for (const image of product.images) {
      totalOriginalBytes += image.bytes
      imageFormatCounts[image.ext] = (imageFormatCounts[image.ext] ?? 0) + 1
      if (image.hash) imageHashCount.set(image.hash, (imageHashCount.get(image.hash) ?? 0) + 1)
    }
  }

  const exactDuplicateProducts = [...byUrl.entries(), ...bySku.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([key, paths]) => ({ key, paths: [...new Set(paths)] }))

  const possibleDuplicateProducts = [...byName.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([key, paths]) => ({ key, paths }))

  const exactDuplicateImages = [...imageHashCount.values()].filter((count) => count > 1).reduce((sum, count) => sum + (count - 1), 0)

  const categoriesFound: Record<string, number> = {}
  for (const item of scanned) {
    categoriesFound[item.folder] = (categoriesFound[item.folder] ?? 0) + 1
  }

  const valid = normalized.filter((item) => !item.invalidReason)
  const report: DryRunReport = {
    productsFound: scanned.length,
    imagesFound: scanned.reduce((sum, item) => sum + item.images.length, 0),
    validProducts: valid.length,
    warningProducts: valid.filter((item) => item.warnings.length).length,
    invalidProducts: normalized.filter((item) => item.invalidReason).length + scanned.filter((item) => !mappingFor(item.folder)).length,
    missingNames: valid.filter((item) => item.warnings.includes('missingName')).length,
    missingPrices: valid.filter((item) => item.warnings.includes('missingPrice')).length,
    missingDescriptions: valid.filter((item) => item.warnings.includes('missingDescription')).length,
    missingImages: valid.filter((item) => item.warnings.includes('missingImages')).length,
    exactDuplicateProducts,
    possibleDuplicateProducts,
    exactDuplicateImages,
    uniqueImageHashes: imageHashCount.size,
    categoriesFound,
    imageFormatCounts,
    totalOriginalBytes,
    estimatedOptimizedBytes: Math.round(totalOriginalBytes * 0.45),
    unmappedFolders,
    sampleInvalid: normalized
      .filter((item) => item.invalidReason)
      .slice(0, 20)
      .map((item) => ({ dir: item.dir, reason: item.invalidReason || '' })),
  }

  return { scanned: hashed, normalized, report }
}

function mappingFor(folder: string) {
  return FOLDER_MAP.some((item) => item.folder === folder)
}

export function writeDryRunReports(report: DryRunReport, root = process.cwd()) {
  const dir = path.join(root, 'data', 'import-reports')
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'catalog-dry-run.json'), JSON.stringify(report, null, 2))
  const md = `# Catalog dry-run

- productsFound: ${report.productsFound}
- imagesFound: ${report.imagesFound}
- validProducts: ${report.validProducts}
- warningProducts: ${report.warningProducts}
- invalidProducts: ${report.invalidProducts}
- missingNames: ${report.missingNames}
- missingPrices: ${report.missingPrices}
- missingDescriptions: ${report.missingDescriptions}
- missingImages: ${report.missingImages}
- exactDuplicateProducts: ${report.exactDuplicateProducts.length}
- possibleDuplicateProducts: ${report.possibleDuplicateProducts.length}
- exactDuplicateImages: ${report.exactDuplicateImages}
- uniqueImageHashes: ${report.uniqueImageHashes}
- totalOriginalBytes: ${report.totalOriginalBytes}
- estimatedOptimizedBytes: ${report.estimatedOptimizedBytes}

## Categorieën

${Object.entries(report.categoriesFound)
  .map(([name, count]) => `- ${name}: ${count}`)
  .join('\n')}

## Formaten

${Object.entries(report.imageFormatCounts)
  .map(([name, count]) => `- ${name}: ${count}`)
  .join('\n')}

## Unmapped folders

${report.unmappedFolders.length ? report.unmappedFolders.map((item) => `- ${item}`).join('\n') : '- geen'}
`
  writeFileSync(path.join(dir, 'catalog-dry-run.md'), md)
  return dir
}
