import { config } from 'dotenv'
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { analyzeCatalog, writeDryRunReports } from './analyze.ts'
import { inspectImage, optimizeImage } from './optimize-images.ts'
import { d1Query, d1Run, probeD1 } from '../lib/d1-client.ts'
import { createR2Client, r2Delete, r2Get, r2Head, r2List, r2Put } from '../lib/r2-client.ts'
import { FOLDER_MAP } from '../lib/category-map.ts'
import { logError, logInfo, logWarn, progress } from '../lib/import-logger.ts'
import { defaultSourceDir, type NormalizedProduct } from '../lib/product-source-reader.ts'
import { slugify } from '../lib/slug.ts'
import { mediaPublicPath, r2KeysForHash } from '../../shared/media.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
config({ path: path.join(root, '.env.import.local') })

const args = new Set(process.argv.slice(2))
const doImport = args.has('--import')
const imagesOnly = args.has('--images-only')
const verifyOnly = args.has('--verify')
const skipR2Test = args.has('--skip-r2-test')
const dryRun = !doImport && !imagesOnly && !verifyOnly

const EXPECTED_PRODUCTS = 518
const EXPECTED_IMAGES = 1919

function envPresent(name: string) {
  const value = process.env[name]?.trim()
  return Boolean(value) && !value.includes('your_')
}

async function testR2() {
  const client = createR2Client()
  await r2List(client, undefined, 3)
  const key = '_import-tests/connection-test.txt'
  const payload = Buffer.from(`allround-import-test ${new Date().toISOString()}`)
  await r2Put(client, key, payload, 'text/plain')
  await r2Get(client, key)
  await r2Delete(client, key)
  logInfo('R2 verbinding OK (testobject verwijderd).')
}

async function ensureCategory(id: string, name: string, slug: string, parentId: string | null) {
  const now = Date.now()
  const existing = await d1Query<{ id: string }>(
    'SELECT id FROM catalog_categories WHERE slug = ? LIMIT 1',
    [slug],
  )
  if (existing[0]) {
    await d1Run(
      'UPDATE catalog_categories SET name = ?, parent_id = ?, updated_at = ? WHERE id = ?',
      [name, parentId, now, existing[0].id],
    )
    return existing[0].id
  }
  await d1Run(
    `INSERT INTO catalog_categories (id, name, slug, parent_id, sort_order, active, robots, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, 1, 'index,follow', ?, ?)`,
    [id, name, slug, parentId, now, now],
  )
  return id
}

async function ensureTaxonomy() {
  const parents = new Map<string, { name: string }>()
  for (const row of FOLDER_MAP) {
    parents.set(row.parentSlug, { name: row.parentName })
  }
  const parentIds = new Map<string, string>()
  for (const [slug, parent] of parents) {
    const id = await ensureCategory(`cat-${slug}`, parent.name, slug, null)
    parentIds.set(slug, id)
  }
  for (const row of FOLDER_MAP) {
    await ensureCategory(
      `cat-${row.categorySlug}`,
      row.categoryName,
      row.categorySlug,
      parentIds.get(row.parentSlug) ?? null,
    )
  }
  const vloerenId = parentIds.get('vloeren') ?? (await ensureCategory('cat-vloeren', 'Vloeren', 'vloeren', null))
  const pvcId = await ensureCategory('cat-pvc', 'PVC', 'pvc', vloerenId)
  await ensureCategory('cat-laminaat', 'Laminaat', 'laminaat', vloerenId)
  await ensureCategory('cat-parket', 'Parket', 'parket', vloerenId)
  await ensureCategory('cat-klik-pvc', 'Klik-PVC', 'klik-pvc', pvcId)
  await ensureCategory('cat-plak-pvc', 'Plak-PVC', 'plak-pvc', pvcId)

  const now = Date.now()
  const supplier = await d1Query<{ id: string }>(
    'SELECT id FROM suppliers WHERE internal_code = ? LIMIT 1',
    ['scrape'],
  )
  if (!supplier[0]) {
    await d1Run(
      `INSERT INTO suppliers (id, name, internal_code, website, feed_type, active, created_at, updated_at)
       VALUES (?, ?, ?, NULL, 'manual', 1, ?, ?)`,
      ['sup-scrape', 'Catalogusimport', 'scrape', now, now],
    )
  }
}

async function categoryId(slug: string) {
  const rows = await d1Query<{ id: string }>(
    'SELECT id FROM catalog_categories WHERE slug = ? LIMIT 1',
    [slug],
  )
  if (!rows[0]) throw new Error(`Categorie ontbreekt: ${slug}`)
  return rows[0].id
}

async function ensureBrand(name: string | null): Promise<string | null> {
  if (!name) return null
  const slug = slugify(name)
  if (!slug) return null
  const existing = await d1Query<{ id: string }>('SELECT id FROM brands WHERE slug = ? LIMIT 1', [slug])
  if (existing[0]) return existing[0].id
  const id = `brand-${slug}`
  const now = Date.now()
  await d1Run(
    `INSERT INTO brands (id, name, slug, active, created_at, updated_at)
     VALUES (?, ?, ?, 1, ?, ?)`,
    [id, name, slug, now, now],
  )
  return id
}

async function upsertProduct(
  product: NormalizedProduct,
  parentCategoryId: string,
  categoryIdValue: string,
  brandId: string | null,
) {
  const now = Date.now()
  const existing = await d1Query<{ id: string }>(
    'SELECT id FROM products WHERE source_url = ? LIMIT 1',
    [product.sourceUrl],
  )
  const id = existing[0]?.id || product.id
  if (existing[0]) {
    await d1Run(
      `UPDATE products SET
        name=?, slug=?, description=?, short_description=?, sku=?,
        brand_id=?, category_id=?, subcategory_id=?,
        price_incl_cents=?, compare_at_incl_cents=?, currency=?,
        source_name=?, source_product_id=?, source_rights_status=?,
        updated_at=?
       WHERE id=?`,
      [
        product.name,
        product.slug,
        product.description,
        product.shortDescription,
        product.sku,
        brandId,
        parentCategoryId,
        categoryIdValue,
        product.priceCents,
        product.compareAtCents,
        product.currency,
        product.sourceName,
        product.sourceProductId,
        product.sourceRightsStatus,
        now,
        id,
      ],
    )
  } else {
    await d1Run(
      `INSERT INTO products (
        id, name, slug, description, short_description, sku, ean, brand_id, category_id, subcategory_id,
        status, price_incl_cents, vat_percent, compare_at_incl_cents, stock_status,
        is_outlet, is_business_only, seo_title, seo_description, robots,
        source_name, source_url, source_product_id, source_rights_status, currency,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, 'draft', ?, 21, ?, 'unknown', 0, 0, ?, ?, 'noindex,nofollow', ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        product.name,
        product.slug,
        product.description,
        product.shortDescription,
        product.sku,
        brandId,
        parentCategoryId,
        categoryIdValue,
        product.priceCents,
        product.compareAtCents,
        product.name,
        product.shortDescription,
        product.sourceName,
        product.sourceUrl,
        product.sourceProductId,
        product.sourceRightsStatus,
        product.currency,
        now,
        now,
      ],
    )
  }
  return id
}

async function uploadUniqueImages(
  products: NormalizedProduct[],
  client: ReturnType<typeof createR2Client>,
  counts: { uploaded: number; duplicate: number; failed: number; scanned: number },
  meta: Map<string, { width: number; height: number; mimeType: string }>,
) {
  const unique = new Map<string, NormalizedProduct['images'][number]>()
  for (const product of products) {
    for (const image of product.images) {
      counts.scanned += 1
      if (!image.hash || unique.has(image.hash)) {
        if (image.hash) counts.duplicate += 1
        continue
      }
      unique.set(image.hash, image)
    }
  }
  const list = [...unique.values()]
  let cursor = 0
  async function worker() {
    while (cursor < list.length) {
      const index = cursor
      cursor += 1
      const image = list[index]
      if (!image.hash) continue
      try {
        const info = await inspectImage(image.absPath)
        meta.set(image.hash, { width: info.width, height: info.height, mimeType: info.mimeType })
        if (info.corrupt || info.width < 32 || info.height < 32 || image.bytes === 0) {
          counts.failed += 1
          continue
        }
        const keys = r2KeysForHash(image.hash)
        if (await r2Head(client, keys.full)) {
          counts.duplicate += 1
          continue
        }
        const variants = await optimizeImage(image.absPath)
        await r2Put(client, keys.full, variants.full, 'image/webp')
        await r2Put(client, keys.card, variants.card, 'image/webp')
        await r2Put(client, keys.thumb, variants.thumb, 'image/webp')
        counts.uploaded += 3
        progress('Image uploaded', index + 1, list.length)
      } catch (error) {
        counts.failed += 1
        logWarn(`Afbeeldingfout ${image.filename}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }
  await Promise.all([worker(), worker(), worker(), worker(), worker()])
}

async function linkImages(
  productId: string,
  product: NormalizedProduct,
  meta: Map<string, { width: number; height: number; mimeType: string }>,
) {
  const seen = new Set<string>()
  let sort = 0
  for (const image of product.images) {
    if (!image.hash || seen.has(image.hash)) continue
    seen.add(image.hash)
    const info = meta.get(image.hash)
    if (!info || info.width < 32) continue
    sort += 1
    const keys = r2KeysForHash(image.hash)
    const imageId = `${productId}-${image.hash.slice(0, 16)}`
    const url = mediaPublicPath(keys.full)
    const existingImg = await d1Query<{ id: string }>('SELECT id FROM product_images WHERE id = ?', [imageId])
    const params = [
      url,
      keys.full,
      image.filename,
      product.name,
      sort - 1,
      sort === 1 ? 1 : 0,
      info.width,
      info.height,
      info.mimeType,
      image.bytes,
      image.hash,
    ]
    if (existingImg[0]) {
      await d1Run(
        `UPDATE product_images SET url=?, r2_key=?, original_filename=?, alt=?, sort_order=?, is_primary=?, width=?, height=?, mime_type=?, file_size=?, content_hash=? WHERE id=?`,
        [...params, imageId],
      )
    } else {
      await d1Run(
        `INSERT INTO product_images (id, product_id, url, r2_key, original_filename, alt, sort_order, is_primary, width, height, mime_type, file_size, content_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [imageId, productId, ...params, Date.now()],
      )
    }
  }
}

async function verify() {
  const products = await d1Query<{ c: number }>('SELECT COUNT(*) as c FROM products')
  const images = await d1Query<{ c: number }>('SELECT COUNT(*) as c FROM product_images')
  const categories = await d1Query<{ c: number }>('SELECT COUNT(*) as c FROM catalog_categories')
  const brands = await d1Query<{ c: number }>('SELECT COUNT(*) as c FROM brands')
  logInfo(
    `D1 products=${products[0]?.c} images=${images[0]?.c} categories=${categories[0]?.c} brands=${brands[0]?.c}`,
  )
  return {
    products: Number(products[0]?.c ?? 0),
    images: Number(images[0]?.c ?? 0),
    categories: Number(categories[0]?.c ?? 0),
    brands: Number(brands[0]?.c ?? 0),
  }
}

async function main() {
  if (!envPresent('R2_ACCESS_KEY_ID') || !envPresent('R2_SECRET_ACCESS_KEY')) {
    console.log(
      'Vul R2_ACCESS_KEY_ID en R2_SECRET_ACCESS_KEY in .env.import.local in en laat mij daarna doorgaan.',
    )
    process.exit(2)
  }

  logInfo(`Bron: ${defaultSourceDir()}`)
  const { report, normalized } = analyzeCatalog(defaultSourceDir())
  writeDryRunReports(report, root)
  logInfo(
    `Dry-run: ${report.productsFound} producten, ${report.imagesFound} afbeeldingen, ${report.validProducts} geldig`,
  )

  const productDelta = Math.abs(report.productsFound - EXPECTED_PRODUCTS) / EXPECTED_PRODUCTS
  const imageDelta = Math.abs(report.imagesFound - EXPECTED_IMAGES) / EXPECTED_IMAGES
  if (productDelta > 0.05 || imageDelta > 0.05) {
    logWarn(
      `Aantallen wijken >5% af van de eerdere snapshot (${EXPECTED_PRODUCTS} producten / ${EXPECTED_IMAGES} foto's). Huidige bronmap is leidend; geen verkeerde directory gedetecteerd.`,
    )
  }

  if (dryRun) {
    logInfo('Alleen dry-run. Gebruik npm run catalog:import voor D1+R2.')
    return
  }

  if (verifyOnly) {
    const remote = await probeD1()
    if (!remote) logWarn('Remote D1 API niet beschikbaar; lokale D1 wordt gebruikt.')
    await verify()
    return
  }

  if (!skipR2Test) await testR2()

  const valid = normalized.filter((item) => !item.invalidReason)
  const client = createR2Client()
  const imageCounts = { uploaded: 0, duplicate: 0, failed: 0, scanned: 0 }
  const imageMeta = new Map<string, { width: number; height: number; mimeType: string }>()
  await uploadUniqueImages(valid, client, imageCounts, imageMeta)

  const payload = {
    products: valid.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      description: product.description,
      shortDescription: product.shortDescription,
      priceCents: product.priceCents,
      compareAtCents: product.compareAtCents,
      currency: product.currency,
      sourceName: product.sourceName,
      sourceUrl: product.sourceUrl,
      sourceProductId: product.sourceProductId,
      sourceRightsStatus: product.sourceRightsStatus,
      parentSlug: product.parentSlug,
      categorySlug: product.categorySlug,
      brandName: product.brandName,
      images: product.images
        .filter((image) => image.hash)
        .map((image) => ({
          hash: image.hash!,
          filename: image.filename,
          width: imageMeta.get(image.hash!)?.width ?? 0,
          height: imageMeta.get(image.hash!)?.height ?? 0,
          mimeType: imageMeta.get(image.hash!)?.mimeType ?? 'image/webp',
          bytes: image.bytes,
        })),
    })),
  }
  await r2Put(client, 'catalog-import/payload.json', Buffer.from(JSON.stringify(payload)), 'application/json')
  await r2Put(client, 'catalog-import/cursor.json', Buffer.from(JSON.stringify({ offset: 0 })), 'application/json')
  logInfo('Importpayload naar R2 geschreven (catalog-import/payload.json).')

  const remoteD1 = await probeD1()
  if (!remoteD1) {
    logWarn(
      'Remote D1 weigert het R2-accounttoken. Import schrijft naar lokale D1. Na deploy: beheer → Verwerk importbatch voor cloth.',
    )
  }

  await ensureTaxonomy()
  let imported = 0
  const runId = `import-${Date.now()}`
  await d1Run(
    `INSERT INTO import_runs (id, started_at, status, products_scanned, products_valid, products_imported, products_skipped, images_scanned, images_uploaded, images_duplicate, errors)
     VALUES (?, ?, 'running', ?, ?, 0, 0, 0, 0, 0, 0)`,
    [runId, Date.now(), report.productsFound, valid.length],
  )

  for (const [index, product] of valid.entries()) {
    progress('Product verwerkt', index + 1, valid.length, product.name.slice(0, 60))
    try {
      const brandId = await ensureBrand(product.brandName)
      const parentId = await categoryId(product.parentSlug)
      const subId = await categoryId(product.categorySlug)
      const productId = await upsertProduct(product, parentId, subId, brandId)
      imported += 1
      await linkImages(productId, product, imageMeta)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logError(`Productfout ${product.name}: ${message}`)
      await d1Run(
        `INSERT INTO import_errors (id, import_run_id, source_path, product_source_id, severity, code, message, created_at)
         VALUES (?, ?, ?, ?, 'error', 'product_import', ?, ?)`,
        [`err-${Date.now()}-${index}`, runId, product.dir, product.sourceProductId, message, Date.now()],
      )
    }
  }

  const counts = await verify()
  await d1Run(
    `UPDATE import_runs SET finished_at=?, status='completed', products_imported=?, products_skipped=?, images_scanned=?, images_uploaded=?, images_duplicate=?, errors=? WHERE id=?`,
    [
      Date.now(),
      imported,
      valid.length - imported,
      imageCounts.scanned,
      imageCounts.uploaded,
      imageCounts.duplicate,
      imageCounts.failed,
      runId,
    ],
  )

  mkdirSync(path.join(root, 'data', 'import-reports'), { recursive: true })
  writeFileSync(
    path.join(root, 'data', 'import-reports', 'catalog-import-summary.json'),
    JSON.stringify(
      {
        imported,
        scanned: report.productsFound,
        valid: valid.length,
        imagesFound: report.imagesFound,
        imageCounts,
        d1: counts,
      },
      null,
      2,
    ),
  )
  logInfo(
    `Klaar. Producten upsert: ${imported}. R2 nieuw geüpload: ${imageCounts.uploaded}. Duplicates: ${imageCounts.duplicate}. Fouten: ${imageCounts.failed}.`,
  )
}

main().catch((error) => {
  logError(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
