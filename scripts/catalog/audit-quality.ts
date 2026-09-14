import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { defaultSourceDir } from '../lib/product-source-reader.ts'
import {
  extractSpecifications,
  hamming,
  looksGerman,
  normalizeCatalogText,
  normalizeProductTitle,
  scorePrimaryCandidate,
  suggestedCategory,
  suspiciousImageReason,
} from '../lib/catalog-quality.ts'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const reportsDir = path.join(rootDir, 'data', 'import-reports')
const apply = process.argv.includes('--apply')
const skipPerceptual = process.argv.includes('--skip-perceptual')

type PayloadProduct = {
  id: string
  name: string
  slug: string
  sku: string | null
  description: string
  priceCents: number | null
  sourceUrl: string
  sourceProductId: string
  parentSlug: string
  categorySlug: string
  brandName: string | null
  images: Array<{ hash: string; filename: string; width: number; height: number }>
}

type D1Product = {
  id: string
  name: string
  slug: string
  sku: string | null
  description: string | null
  short_description: string | null
  price_incl_cents: number | null
  stock_status: string
  category_id: string | null
  subcategory_id: string | null
  source_url: string | null
  source_product_id: string | null
  source_name: string | null
  original_source_name?: string | null
}

type D1Image = {
  id: string
  product_id: string
  r2_key: string | null
  original_filename: string | null
  sort_order: number
  is_primary: number
  width: number | null
  height: number | null
  content_hash: string | null
}

type D1Category = { id: string; name: string; slug: string; parent_id: string | null }

function wranglerJson<T>(file: string): T[] {
  const raw = readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
  const parsed = JSON.parse(raw) as Array<{ results: T[] }> | { results: T[] }
  return Array.isArray(parsed) ? parsed[0].results : parsed.results
}

function sqlString(value: string | null | undefined) {
  if (value == null) return 'NULL'
  return `'${value.replaceAll("'", "''")}'`
}

async function dhashFromUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const buffer = Buffer.from(await response.arrayBuffer())
    const { data } = await sharp(buffer)
      .grayscale()
      .resize(9, 8, { fit: 'fill' })
      .raw()
      .toBuffer({ resolveWithObject: true })
    let bits = ''
    for (let y = 0; y < 8; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        bits += data[y * 9 + x] < data[y * 9 + x + 1] ? '1' : '0'
      }
    }
    return bits
  } catch {
    return null
  }
}

async function main() {
  mkdirSync(reportsDir, { recursive: true })
  const sourceDir = defaultSourceDir()
  const sourcePresent = existsSync(sourceDir)
  const payload = JSON.parse(readFileSync(path.join(reportsDir, 'payload.json'), 'utf8')) as {
    products: PayloadProduct[]
  }
  const products = wranglerJson<D1Product>(path.join(reportsDir, 'd1-products.json'))
  const images = wranglerJson<D1Image>(path.join(reportsDir, 'd1-images.json'))
  const categories = wranglerJson<D1Category>(path.join(reportsDir, 'd1-categories.json'))
  const catById = new Map(categories.map((item) => [item.id, item]))
  const catBySlug = new Map(categories.map((item) => [item.slug, item]))
  const payloadByUrl = new Map(payload.products.map((item) => [item.sourceUrl, item]))
  const payloadById = new Map(payload.products.map((item) => [item.id, item]))
  const imagesByProduct = new Map<string, D1Image[]>()
  const reuse = new Map<string, number>()
  for (const image of images) {
    const list = imagesByProduct.get(image.product_id) ?? []
    list.push(image)
    imagesByProduct.set(image.product_id, list)
    if (image.content_hash) reuse.set(image.content_hash, (reuse.get(image.content_hash) ?? 0) + 1)
  }

  const statements: string[] = []
  const repairedProducts: string[] = []
  const reviewProducts: Array<Record<string, unknown>> = []
  const imageMismatches: Array<Record<string, unknown>> = []
  const exactDupes: Array<Record<string, unknown>> = []
  const suspiciousImages: Array<Record<string, unknown>> = []
  const germanRemaining: Array<Record<string, unknown>> = []
  const ambiguousCategories: Array<Record<string, unknown>> = []
  const duplicateCandidates: Array<Record<string, unknown>> = []
  const missingPrices: string[] = []
  const missingImages: string[] = []
  const mappings: Array<Record<string, unknown>> = []
  let productsCorrect = 0
  let autoRepaired = 0

  const excludeIds = new Set<string>()
  const hashOwners = new Map<string, Set<string>>()
  for (const image of images) {
    if (!image.content_hash) continue
    const set = hashOwners.get(image.content_hash) ?? new Set()
    set.add(image.product_id)
    hashOwners.set(image.content_hash, set)
  }

  for (const product of products) {
    const source = payloadByUrl.get(product.source_url ?? '') ?? payloadById.get(product.id)
    const flags = new Set<string>()
    const productImages = [...(imagesByProduct.get(product.id) ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    )
    if (!productImages.length) {
      missingImages.push(product.id)
      flags.add('missing_image')
    }
    if (product.price_incl_cents == null) {
      missingPrices.push(product.id)
      flags.add('missing_price')
    }

    const parent = product.category_id ? catById.get(product.category_id) : undefined
    const child = product.subcategory_id ? catById.get(product.subcategory_id) : undefined
    mappings.push({
      d1Id: product.id,
      slug: product.slug,
      sourceUrl: product.source_url,
      payloadId: source?.id ?? null,
      sourceProductId: product.source_product_id,
    })

    if (source) {
      const sourceHashes = new Set(source.images.map((item) => item.hash))
      const d1Hashes = new Set(productImages.map((item) => item.content_hash).filter(Boolean) as string[])
      for (const hash of d1Hashes) {
        if (!sourceHashes.has(hash)) {
          imageMismatches.push({
            productId: product.id,
            name: product.name,
            hash,
            issue: 'd1_hash_not_in_source_payload',
          })
          flags.add('image_mismatch')
        }
      }
      for (const hash of sourceHashes) {
        if (!d1Hashes.has(hash)) {
          imageMismatches.push({
            productId: product.id,
            name: product.name,
            hash,
            issue: 'source_hash_missing_in_d1',
          })
          flags.add('image_mismatch')
        }
      }
    } else {
      flags.add('unmapped_source')
    }

    const seenHash = new Set<string>()
    for (const image of productImages) {
      if (image.content_hash && seenHash.has(image.content_hash)) {
        exactDupes.push({ productId: product.id, imageId: image.id, hash: image.content_hash })
        excludeIds.add(image.id)
        flags.add('duplicate_images')
      }
      if (image.content_hash) seenHash.add(image.content_hash)
      const reason = suspiciousImageReason({
        width: image.width,
        height: image.height,
        filename: image.original_filename,
        hash: image.content_hash,
        reuseCount: image.content_hash ? (reuse.get(image.content_hash) ?? 1) : 1,
      })
      if (reason) {
        excludeIds.add(image.id)
        suspiciousImages.push({
          productId: product.id,
          productName: product.name,
          imageId: image.id,
          filename: image.original_filename,
          width: image.width,
          height: image.height,
          hash: image.content_hash,
          reason,
        })
        flags.add('suspicious_images')
      }
    }

    const keep = productImages.filter((item) => !excludeIds.has(item.id))
    const ranked = [...keep].sort((a, b) => {
      const score = (image: D1Image) =>
        scorePrimaryCandidate({
          width: image.width,
          height: image.height,
          filename: image.original_filename,
          hash: image.content_hash,
          reuseCount: image.content_hash ? (reuse.get(image.content_hash) ?? 1) : 1,
        })
      return score(b) - score(a)
    })
    const primary = ranked[0]
    const ordered = primary ? [primary, ...keep.filter((item) => item.id !== primary.id)] : keep
    ordered.forEach((image, index) => {
      statements.push(
        `UPDATE product_images SET is_primary = ${index === 0 ? 1 : 0}, sort_order = ${index} WHERE id = ${sqlString(image.id)};`,
      )
    })

    const originalName = product.original_source_name || product.name
    const displayName = normalizeProductTitle(originalName)
    const originalDescription = product.description ?? ''
    const dutchDescription = originalDescription ? normalizeCatalogText(originalDescription) : ''
    const specs = dutchDescription ? extractSpecifications(dutchDescription) : {}
    const stillGerman = looksGerman(`${displayName} ${dutchDescription}`)
    if (stillGerman) {
      germanRemaining.push({ id: product.id, name: displayName })
      flags.add('german_text')
    }
    if (!dutchDescription) flags.add('missing_description')

    const suggestion = suggestedCategory({
      name: `${originalName} ${originalDescription}`,
      description: originalDescription,
      parentSlug: parent?.slug ?? 'assortiment',
      categorySlug: child?.slug ?? parent?.slug ?? 'assortiment',
    })
    let nextCategoryId = product.category_id
    let nextSubcategoryId = product.subcategory_id
    if (suggestion.reason && !suggestion.ambiguous) {
      const parentRow = catBySlug.get(suggestion.parentSlug)
      const childRow = catBySlug.get(suggestion.categorySlug)
      if (parentRow && childRow && (parentRow.id !== product.category_id || childRow.id !== product.subcategory_id)) {
        nextCategoryId = parentRow.id
        nextSubcategoryId = childRow.id
        flags.add('category_repaired')
      }
    } else if (suggestion.ambiguous) {
      ambiguousCategories.push({
        id: product.id,
        name: displayName,
        current: child?.slug ?? parent?.slug,
        suggested: suggestion.categorySlug,
        reason: suggestion.reason,
      })
      flags.add('ambiguous_category')
    }

    const priceOnRequest = product.price_incl_cents == null ? 1 : 0
    const reviewStatus = flags.size ? 'needs_review' : 'ok'
    if (!flags.size) productsCorrect += 1
    else autoRepaired += 1

    statements.push(
      `UPDATE products SET
        original_source_name = COALESCE(original_source_name, ${sqlString(originalName)}),
        name = ${sqlString(displayName)},
        description = ${sqlString(dutchDescription || originalDescription)},
        short_description = ${sqlString((dutchDescription || originalDescription).slice(0, 280))},
        specifications_json = ${sqlString(JSON.stringify(specs))},
        price_on_request = ${priceOnRequest},
        review_status = ${sqlString(reviewStatus)},
        quality_flags = ${sqlString(JSON.stringify([...flags]) )},
        category_id = ${sqlString(nextCategoryId)},
        subcategory_id = ${sqlString(nextSubcategoryId)},
        seo_title = ${sqlString(displayName)},
        updated_at = ${Date.now()}
      WHERE id = ${sqlString(product.id)};`,
    )
    if (flags.size) {
      reviewProducts.push({ id: product.id, name: displayName, flags: [...flags] })
      repairedProducts.push(product.id)
    }
  }

  for (const imageId of excludeIds) {
    statements.push(
      `UPDATE product_images SET image_status = 'suspicious' WHERE id = ${sqlString(imageId)};`,
    )
  }

  const bySku = new Map<string, string[]>()
  const byTitle = new Map<string, string[]>()
  for (const product of products) {
    if (product.sku) {
      const key = product.sku.trim().toLowerCase()
      bySku.set(key, [...(bySku.get(key) ?? []), product.id])
    }
    const key = normalizeProductTitle(product.name).toLowerCase()
    byTitle.set(key, [...(byTitle.get(key) ?? []), product.id])
  }
  for (const [key, ids] of bySku) {
    if (ids.length > 1) duplicateCandidates.push({ type: 'sku', key, ids })
  }
  for (const [key, ids] of byTitle) {
    if (ids.length > 1) duplicateCandidates.push({ type: 'normalized_title', key, ids })
  }
  for (const [hash, owners] of hashOwners) {
    if (owners.size === 2) {
      const reuseCount = reuse.get(hash) ?? 0
      if (reuseCount <= 2) {
        duplicateCandidates.push({ type: 'identical_image_pair', hash, ids: [...owners] })
      }
    }
  }

  const perceptual: Array<Record<string, unknown>> = []
  if (!skipPerceptual) {
    const unique = [...new Set(images.map((item) => item.content_hash).filter(Boolean) as string[])]
    const hashes = new Map<string, string>()
    let done = 0
    for (const hash of unique) {
      const url = `http://127.0.0.1:8787/media/products/by-hash/${hash.slice(0, 2)}/${hash}/thumb.webp`
      const value = await dhashFromUrl(url)
      if (value) hashes.set(hash, value)
      done += 1
      if (done % 200 === 0) console.log(`Perceptual ${done}/${unique.length}`)
    }
    const entries = [...hashes.entries()]
    for (let i = 0; i < entries.length; i += 1) {
      for (let j = i + 1; j < entries.length; j += 1) {
        const dist = hamming(entries[i][1], entries[j][1])
        if (dist <= 6) {
          const ownersA = [...(hashOwners.get(entries[i][0]) ?? [])]
          const ownersB = [...(hashOwners.get(entries[j][0]) ?? [])]
          perceptual.push({
            hashA: entries[i][0],
            hashB: entries[j][0],
            similarity: Number((1 - dist / 64).toFixed(3)),
            hamming: dist,
            productsA: ownersA,
            productsB: ownersB,
            recommendedAction:
              ownersA.length + ownersB.length === 2 && ownersA[0] === ownersB[0]
                ? 'review_same_product_near_duplicate'
                : 'keep_unless_confirmed_same_shot',
          })
        }
      }
    }
  }

  const sqlPath = path.join(reportsDir, 'catalog-quality-repair.sql')
  writeFileSync(sqlPath, statements.join('\n'), 'utf8')

  const summary = {
    sourceDir,
    sourcePresent,
    sourceNote: sourcePresent
      ? 'Lokale bronmap gelezen.'
      : 'Bronmap ontbreekt op deze machine. SHA-256-hashes en bestandsnamen uit catalog-import/payload.json zijn de bron van waarheid voor image-ownership.',
    productsAudited: products.length,
    imagesAudited: images.length,
    payloadProducts: payload.products.length,
    mappedProducts: mappings.filter((item) => item.payloadId).length,
    productsCorrect,
    productsAutomaticallyRepaired: autoRepaired,
    productsRequiringManualReview: reviewProducts.length,
    imageMismatches: imageMismatches.length,
    exactDuplicateImages: exactDupes.length,
    suspiciousPromotionalImages: suspiciousImages.length,
    productsContainingGermanText: germanRemaining.length,
    ambiguousCategories: ambiguousCategories.length,
    possibleDuplicateProducts: duplicateCandidates.length,
    missingPricing: missingPrices.length,
    missingImages: missingImages.length,
    perceptualPairs: perceptual.length,
    reviewProducts,
    imageMismatchDetails: imageMismatches.slice(0, 200),
    exactDuplicateDetails: exactDupes,
    suspiciousImageDetails: suspiciousImages.slice(0, 400),
    germanTextDetails: germanRemaining.slice(0, 400),
    ambiguousCategoryDetails: ambiguousCategories,
    duplicateCandidates: duplicateCandidates.slice(0, 200),
    missingPriceIds: missingPrices,
    missingImageIds: missingImages,
    perceptual,
    mappings,
  }
  writeFileSync(path.join(reportsDir, 'catalog-quality-audit.json'), JSON.stringify(summary, null, 2))

  const md = `# Catalog data quality audit

- Products audited: **${summary.productsAudited}**
- Payload products: **${summary.payloadProducts}**
- Deterministically mapped: **${summary.mappedProducts}**
- Products already clean after automated rules: **${summary.productsCorrect}**
- Products automatically repaired: **${summary.productsAutomaticallyRepaired}**
- Products requiring manual review: **${summary.productsRequiringManualReview}**
- Image mismatches vs payload hashes: **${summary.imageMismatches}**
- Exact duplicate images within a product: **${summary.exactDuplicateImages}**
- Suspicious / promotional images marked: **${summary.suspiciousPromotionalImages}**
- Products still containing German tokens after normalization: **${summary.productsContainingGermanText}**
- Ambiguous categories: **${summary.ambiguousCategories}**
- Possible duplicate product groups: **${summary.possibleDuplicateProducts}**
- Missing pricing: **${summary.missingPricing}**
- Missing images: **${summary.missingImages}**
- Perceptual near-duplicate pairs: **${summary.perceptualPairs}**

## Source of truth

${summary.sourceNote}

Local expected path: \`${sourceDir}\`

## Deterministic repairs applied or prepared

- Cross-product reused graphics and banner-like aspect ratios are marked \`image_status = suspicious\` and hidden from public galleries.
- Exact same-hash duplicates within one product keep the first row.
- Primary image is the highest-scoring remaining product photo, not blindly \`image_01\`.
- German ecommerce phrasing is normalized to Dutch where the meaning is explicit; original name is stored in \`original_source_name\`.
- Technical facts found in source text are copied into \`specifications_json\` only when present.
- \`price_on_request\` is set only when no selling price exists.
- Wicanders cork floors move to \`parket\`; wasmachine-ombouwkasten move to \`kasten\`.

## Manual review

Open **Beheer → Cataloguskwaliteit**. Filters cover suspicious images, German text, missing price, duplicates and ambiguous categories.

Do not merge title-similar products automatically.
`
  writeFileSync(path.join(rootDir, 'CATALOG-DATA-QUALITY-AUDIT.md'), md)
  console.log(`Wrote ${statements.length} SQL statements to ${sqlPath}`)
  console.log(`Suspicious images: ${excludeIds.size}`)
  if (apply) {
    console.log('Apply with: npx wrangler d1 execute cloth --remote --file data/import-reports/catalog-quality-repair.sql')
  }
}

await main()
