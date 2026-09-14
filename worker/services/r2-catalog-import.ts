import { FOLDER_MAP } from '../../shared/catalog-taxonomy'
import { eq } from 'drizzle-orm'
import { createDb } from '../db'
import { brands, catalogCategories, productImages, products } from '../db/schema'
import { mediaPublicPath, r2KeysForHash } from '../../shared/media'
import type { AppEnv } from '../types'

export type ImportPayloadProduct = {
  id: string
  slug: string
  name: string
  sku: string | null
  description: string
  shortDescription: string
  priceCents: number | null
  compareAtCents: number | null
  currency: string
  sourceName: string
  sourceUrl: string
  sourceProductId: string
  sourceRightsStatus: string
  parentSlug: string
  categorySlug: string
  brandName: string | null
  images: Array<{
    hash: string
    filename: string
    width: number
    height: number
    mimeType: string
    bytes: number
  }>
}

const BATCH = 35

export async function ingestCatalogPayload(env: AppEnv['Bindings']) {
  const object = await env.MEDIA.get('catalog-import/payload.json')
  if (!object) return { ok: false as const, error: 'Geen catalog-import/payload.json in R2.' }
  const payload = (await object.json()) as { products: ImportPayloadProduct[] }
  const cursorObj = await env.MEDIA.get('catalog-import/cursor.json')
  const cursor = cursorObj ? ((await cursorObj.json()) as { offset: number }) : { offset: 0 }
  const db = createDb(env)
  await seedCategories(db)
  const cats = await db.select().from(catalogCategories)
  const catBySlug = new Map(cats.map((item) => [item.slug, item.id]))
  const slice = payload.products.slice(cursor.offset, cursor.offset + BATCH)
  const now = new Date()

  let imported = 0
  for (const product of slice) {
    const brandId = await ensureBrand(db, product.brandName, now)
    const parentId = catBySlug.get(product.parentSlug) ?? null
    const subId = catBySlug.get(product.categorySlug) ?? parentId
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.sourceUrl, product.sourceUrl))
      .limit(1)
    const id = existing[0]?.id || product.id
    const values = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      sku: product.sku,
      brandId,
      categoryId: parentId,
      subcategoryId: subId,
      priceInclCents: product.priceCents,
      compareAtInclCents: product.compareAtCents,
      currency: product.currency,
      sourceName: product.sourceName,
      sourceUrl: product.sourceUrl,
      sourceProductId: product.sourceProductId,
      sourceRightsStatus: product.sourceRightsStatus,
      updatedAt: now,
    }
    if (existing[0]) {
      await db.update(products).set({ ...values, status: 'active', robots: 'index,follow' }).where(eq(products.id, id))
    } else {
      await db.insert(products).values({
        id,
        status: 'active',
        vatPercent: 21,
        stockStatus: 'unknown',
        isOutlet: false,
        isBusinessOnly: false,
        seoTitle: product.name,
        seoDescription: product.shortDescription,
        robots: 'index,follow',
        createdAt: now,
        ...values,
      })
    }
    let sort = 0
    for (const image of product.images) {
      if (!image.hash) continue
      sort += 1
      const keys = r2KeysForHash(image.hash)
      const imageId = `${id}-${image.hash.slice(0, 16)}`
      const found = await db
        .select()
        .from(productImages)
        .where(eq(productImages.id, imageId))
        .limit(1)
      const row = {
        url: mediaPublicPath(keys.full),
        r2Key: keys.full,
        originalFilename: image.filename,
        alt: product.name,
        sortOrder: sort - 1,
        isPrimary: sort === 1,
        width: image.width,
        height: image.height,
        mimeType: image.mimeType,
        fileSize: image.bytes,
        contentHash: image.hash,
      }
      if (found[0]) {
        await db.update(productImages).set(row).where(eq(productImages.id, imageId))
      } else {
        await db.insert(productImages).values({
          id: imageId,
          productId: id,
          createdAt: now,
          ...row,
        })
      }
    }
    imported += 1
  }

  const nextOffset = cursor.offset + slice.length
  await env.MEDIA.put('catalog-import/cursor.json', JSON.stringify({ offset: nextOffset }))
  return {
    ok: true as const,
    imported,
    offset: nextOffset,
    total: payload.products.length,
    done: nextOffset >= payload.products.length,
  }
}

async function seedCategories(db: ReturnType<typeof createDb>) {
  const now = new Date()
  const parents = new Map<string, string>()
  for (const row of FOLDER_MAP) {
    parents.set(row.parentSlug, row.parentName)
  }
  for (const [slug, name] of parents) {
    await upsertCategory(db, `cat-${slug}`, name, slug, null, now)
  }
  const all = await db.select().from(catalogCategories)
  const bySlug = new Map(all.map((item) => [item.slug, item.id]))
  for (const row of FOLDER_MAP) {
    if (row.categorySlug === row.parentSlug) continue
    await upsertCategory(
      db,
      `cat-${row.categorySlug}`,
      row.categoryName,
      row.categorySlug,
      bySlug.get(row.parentSlug) ?? null,
      now,
    )
  }
  const vloerenId = bySlug.get('vloeren') ?? `cat-vloeren`
  await upsertCategory(db, 'cat-pvc', 'PVC', 'pvc', vloerenId, now)
  const refreshed = await db.select().from(catalogCategories)
  const map = new Map(refreshed.map((item) => [item.slug, item.id]))
  await upsertCategory(db, 'cat-laminaat', 'Laminaat', 'laminaat', map.get('vloeren') ?? null, now)
  await upsertCategory(db, 'cat-parket', 'Parket', 'parket', map.get('vloeren') ?? null, now)
  await upsertCategory(db, 'cat-klik-pvc', 'Klik-PVC', 'klik-pvc', map.get('pvc') ?? null, now)
  await upsertCategory(db, 'cat-plak-pvc', 'Plak-PVC', 'plak-pvc', map.get('pvc') ?? null, now)
}

async function upsertCategory(
  db: ReturnType<typeof createDb>,
  id: string,
  name: string,
  slug: string,
  parentId: string | null,
  now: Date,
) {
  const existing = await db
    .select()
    .from(catalogCategories)
    .where(eq(catalogCategories.slug, slug))
    .limit(1)
  if (existing[0]) {
    await db
      .update(catalogCategories)
      .set({ name, parentId, updatedAt: now })
      .where(eq(catalogCategories.id, existing[0].id))
    return
  }
  await db.insert(catalogCategories).values({
    id,
    name,
    slug,
    parentId,
    sortOrder: 0,
    active: true,
    robots: 'index,follow',
    createdAt: now,
    updatedAt: now,
  })
}

async function ensureBrand(db: ReturnType<typeof createDb>, name: string | null, now: Date) {
  if (!name) return null
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  if (!slug) return null
  const existing = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1)
  if (existing[0]) return existing[0].id
  const id = `brand-${slug}`
  await db.insert(brands).values({ id, name, slug, active: true, createdAt: now, updatedAt: now })
  return id
}
