import { and, asc, desc, eq, inArray, like, or, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { createDb } from '../db'
import { brands, catalogCategories, productImages, products } from '../db/schema'
import { toCatalogProduct } from '../lib/catalog-map'
import { mediaPublicPath } from '../../shared/media'
import { getPresentationConfig } from '../../shared/product-presentation'
import type { AppEnv } from '../types'

export const catalogRoutes = new Hono<AppEnv>()

const MAX_LIMIT = 48
const D1_IN_CHUNK = 40
const HOME_MEDIA_SLUGS = [
  'meubels',
  'vloeren',
  'keuken',
  'koelen-vriezen',
  'horeca',
  'wonen',
  'outlet',
  'zakelijk',
  'huishouden',
] as const

function clampLimit(raw: string | undefined, fallback = 24) {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(MAX_LIMIT, Math.floor(n))
}

catalogRoutes.get('/home/media', async (c) => {
  const db = createDb(c.env)
  const cats = await db.select().from(catalogCategories)
  const bySlug: Record<string, string> = {}
  for (const slug of HOME_MEDIA_SLUGS) {
    const cat = cats.find((item) => item.slug === slug)
    if (!cat) continue
    const ids = [cat.id, ...descendantIdsFromRows(cats, cat.id)]
    const src = await firstImageForCategoryIds(db, ids)
    if (src) bySlug[slug] = src
  }
  const hero = bySlug.meubels ?? bySlug.wonen ?? bySlug.keuken ?? Object.values(bySlug)[0] ?? null
  if (hero) {
    for (const slug of HOME_MEDIA_SLUGS) {
      if (!bySlug[slug]) bySlug[slug] = hero
    }
  }
  return c.json({ hero, bySlug })
})

catalogRoutes.get('/categories', async (c) => {
  const db = createDb(c.env)
  const rows = await db
    .select()
    .from(catalogCategories)
    .where(eq(catalogCategories.active, true))
    .orderBy(asc(catalogCategories.sortOrder), asc(catalogCategories.name))
  return c.json({
    categories: rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      parentId: row.parentId,
      description: row.description,
    })),
  })
})

catalogRoutes.get('/categories/:slug/products', async (c) => {
  const db = createDb(c.env)
  const slug = c.req.param('slug')
  const page = Math.max(1, Number(c.req.query('page') ?? '1') || 1)
  const limit = clampLimit(c.req.query('limit'))
  const cat = await db
    .select()
    .from(catalogCategories)
    .where(eq(catalogCategories.slug, slug))
    .limit(1)
  if (!cat[0]) return c.json({ error: 'Categorie niet gevonden.' }, 404)
  const descendants = await descendantIds(db, cat[0].id)
  const ids = [cat[0].id, ...descendants]
  const offset = (page - 1) * limit
  const where = and(
    eq(products.status, 'active'),
    or(inArray(products.categoryId, ids), inArray(products.subcategoryId, ids)),
  )
  const [{ value: total }] = await db
    .select({ value: sql<number>`count(*)` })
    .from(products)
    .where(where)
  const rows = await db
    .select()
    .from(products)
    .where(where)
    .orderBy(desc(products.updatedAt))
    .limit(limit)
    .offset(offset)
  return c.json({
    items: await hydrateProducts(db, rows),
    total,
    page,
    pageSize: limit,
    pageCount: Math.max(1, Math.ceil(Number(total) / limit)),
  })
})

catalogRoutes.get('/products/featured', async (c) => {
  const db = createDb(c.env)
  const pinned = await db
    .select()
    .from(products)
    .where(and(eq(products.status, 'active'), eq(products.isFeatured, true)))
    .orderBy(desc(products.updatedAt))
    .limit(8)

  const cats = await db.select().from(catalogCategories)
  const preferred = [
    'meubels',
    'vloeren',
    'koelen-vriezen',
    'horeca',
    'huishouden',
    'keuken',
    'wonen',
  ]
  const preferredSubcategories = ['tuinmeubels', 'banken', 'wasmachines']
  const poolRows = [...pinned]
  for (const slug of [...preferred, ...preferredSubcategories]) {
    const cat = cats.find((item) => item.slug === slug)
    if (!cat) continue
    const ids = [cat.id, ...descendantIdsFromRows(cats, cat.id)]
    for (let i = 0; i < ids.length; i += D1_IN_CHUNK) {
      const chunk = ids.slice(i, i + D1_IN_CHUNK)
      const rows = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.status, 'active'),
            sql`${products.priceInclCents} is not null`,
            or(inArray(products.categoryId, chunk), inArray(products.subcategoryId, chunk)),
          ),
        )
        .orderBy(desc(products.updatedAt))
        .limit(4)
      for (const row of rows) {
        if (!poolRows.some((item) => item.id === row.id)) poolRows.push(row)
      }
    }
  }

  const mapped = await hydrateProducts(db, poolRows)
  const withPhotos = mapped.filter((item) => item.images.length)
  const selected: typeof withPhotos = []
  const counts = new Map<string, number>()

  function take(item: (typeof withPhotos)[number], maxPerCategory = 1) {
    const count = counts.get(item.categorySlug) ?? 0
    if (count >= maxPerCategory) return false
    counts.set(item.categorySlug, count + 1)
    selected.push(item)
    return true
  }

  // Prefer pinned featured, but still one-per-category for homepage diversity.
  for (const item of withPhotos.filter((product) => product.isFeatured)) take(item, 1)
  for (const slug of preferred) {
    if (selected.length >= 5) break
    const match = withPhotos.find(
      (item) =>
        item.categorySlug === slug &&
        !selected.some((picked) => picked.id === item.id) &&
        !/ombouwkast|umbau/i.test(item.name),
    )
    if (match) take(match, 1)
  }
  // Prefer outdoor furniture once when available (maps to “Tuin” mix).
  if (selected.length < 5) {
    const tuin = withPhotos.find(
      (item) =>
        item.subcategorySlug === 'tuinmeubels' &&
        !selected.some((picked) => picked.id === item.id),
    )
    if (tuin) take(tuin, 1)
  }
  for (const item of withPhotos) {
    if (selected.length >= 5) break
    if (selected.some((picked) => picked.id === item.id)) continue
    if (/ombouwkast|umbau/i.test(item.name) && (counts.get('meubels') ?? 0) > 0) continue
    // Soft-cap flooring so the rail stays mixed.
    if (item.categorySlug === 'vloeren' && (counts.get('vloeren') ?? 0) >= 1) continue
    take(item, 1)
  }
  return c.json(selected.slice(0, 5))
})

catalogRoutes.get('/products/:slug', async (c) => {
  const db = createDb(c.env)
  const slug = c.req.param('slug')
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, 'active')))
    .limit(1)
  if (!rows[0]) return c.json({ error: 'Niet gevonden.' }, 404)
  const mapped = await hydrateProducts(db, rows)
  return c.json(mapped[0])
})

catalogRoutes.get('/products/:slug/related', async (c) => {
  const db = createDb(c.env)
  const slug = c.req.param('slug')
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, 'active')))
    .limit(1)
  const product = rows[0]
  if (!product) return c.json({ items: [] })

  const cats = await db.select().from(catalogCategories)
  const category = cats.find((item) => item.id === product.categoryId)
  const subcategory = cats.find((item) => item.id === product.subcategoryId)
  const categorySlug = category?.slug ?? subcategory?.slug
  const subcategorySlug = subcategory?.slug ?? category?.slug
  const presentation = getPresentationConfig(categorySlug, subcategorySlug)

  const complementaryIds = cats
    .filter(
      (item) =>
        presentation.related.complementaryCategorySlugs.includes(item.slug) ||
        presentation.related.complementarySubcategorySlugs.includes(item.slug),
    )
    .map((item) => item.id)

  const base = [
    eq(products.status, 'active'),
    sql`${products.id} != ${product.id}`,
    sql`${products.priceInclCents} is not null`,
  ]

  const pools: Array<typeof rows> = []
  if (presentation.related.preferSubcategory && product.subcategoryId) {
    pools.push(
      await db
        .select()
        .from(products)
        .where(and(...base, eq(products.subcategoryId, product.subcategoryId)))
        .orderBy(desc(products.updatedAt))
        .limit(24),
    )
  }
  if (product.categoryId) {
    pools.push(
      await db
        .select()
        .from(products)
        .where(
          and(
            ...base,
            or(eq(products.categoryId, product.categoryId), eq(products.subcategoryId, product.categoryId)),
          ),
        )
        .orderBy(desc(products.updatedAt))
        .limit(24),
    )
  }
  if (complementaryIds.length) {
    pools.push(
      await db
        .select()
        .from(products)
        .where(
          and(
            ...base,
            or(
              inArray(products.categoryId, complementaryIds),
              inArray(products.subcategoryId, complementaryIds),
            ),
          ),
        )
        .orderBy(desc(products.updatedAt))
        .limit(24),
    )
  }

  const merged = []
  const seenIds = new Set<string>()
  for (const pool of pools) {
    for (const row of pool) {
      if (seenIds.has(row.id)) continue
      seenIds.add(row.id)
      merged.push(row)
    }
  }

  const mapped = (await hydrateProducts(db, merged)).filter((item) => item.images.length)
  const selected: typeof mapped = []
  const seenNames = new Set<string>()
  for (const item of mapped) {
    const key = item.name.slice(0, 40).toLowerCase()
    if (seenNames.has(key)) continue
    seenNames.add(key)
    selected.push(item)
    if (selected.length >= 4) break
  }
  return c.json({ items: selected })
})

catalogRoutes.get('/search', (c) => queryProducts(c))
catalogRoutes.get('/catalog/query', (c) => queryProducts(c))

async function queryProducts(c: Context<AppEnv>) {
  const db = createDb(c.env)
  const q = c.req.query('q')?.trim()
  const categorySlug = c.req.query('categorySlug') ?? c.req.query('category')
  const subcategory = c.req.query('subcategorySlug')
  const subcategories = (c.req.query('subcategorySlugs') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const page = Math.max(1, Number(c.req.query('page') ?? '1') || 1)
  const limit = clampLimit(c.req.query('limit') ?? c.req.query('pageSize'))
  const sort = c.req.query('sort') ?? 'recommended'
  const outlet = c.req.query('outlet') === '1'
  const priceMin = c.req.query('priceMin')
    ? Math.round(Number(c.req.query('priceMin')) * 100)
    : null
  const priceMax = c.req.query('priceMax')
    ? Math.round(Number(c.req.query('priceMax')) * 100)
    : null

  const conditions = [eq(products.status, 'active')]
  if (q) {
    conditions.push(
      or(
        like(products.name, `%${q}%`),
        like(products.sku, `%${q}%`),
        like(products.slug, `%${q}%`),
        like(products.description, `%${q}%`),
      )!,
    )
  }
  if (outlet) conditions.push(eq(products.isOutlet, true))
  if (priceMin != null && Number.isFinite(priceMin)) {
    conditions.push(sql`${products.priceInclCents} >= ${priceMin}`)
  }
  if (priceMax != null && Number.isFinite(priceMax)) {
    conditions.push(sql`${products.priceInclCents} <= ${priceMax}`)
  }

  const slugs = [...subcategories, subcategory, categorySlug].filter(Boolean) as string[]
  if (slugs.length) {
    const cats = await db.select().from(catalogCategories)
    const wanted = new Set(slugs)
    const matched = cats.filter((item) => wanted.has(item.slug))
    const ids = new Set<string>()
    for (const match of matched) {
      ids.add(match.id)
      for (const child of descendantIdsFromRows(cats, match.id)) ids.add(child)
    }
    const categoryIds = [...ids]
    if (categoryIds.length) {
      conditions.push(
        or(
          inArray(products.categoryId, categoryIds),
          inArray(products.subcategoryId, categoryIds),
        )!,
      )
    }
  }

  const [{ value: total }] = await db
    .select({ value: sql<number>`count(*)` })
    .from(products)
    .where(and(...conditions))

  const order =
    sort === 'price-asc'
      ? asc(products.priceInclCents)
      : sort === 'price-desc'
        ? desc(products.priceInclCents)
        : sort === 'newest'
          ? desc(products.createdAt)
          : desc(products.updatedAt)

  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(order)
    .limit(limit)
    .offset((page - 1) * limit)

  return c.json({
    items: await hydrateProducts(db, rows),
    total: Number(total),
    page,
    pageSize: limit,
    pageCount: Math.max(1, Math.ceil(Number(total) / limit)),
    facets: {},
  })
}

async function descendantIds(db: ReturnType<typeof createDb>, parentId: string) {
  const cats = await db.select().from(catalogCategories)
  return descendantIdsFromRows(cats, parentId)
}

function descendantIdsFromRows(
  cats: Array<{ id: string; parentId: string | null }>,
  parentId: string,
): string[] {
  const result: string[] = []
  const seen = new Set<string>([parentId])
  const walk = (id: string) => {
    for (const child of cats.filter((item) => item.parentId === id)) {
      if (seen.has(child.id)) continue
      seen.add(child.id)
      result.push(child.id)
      walk(child.id)
    }
  }
  walk(parentId)
  return result
}

async function firstImageForCategoryIds(
  db: ReturnType<typeof createDb>,
  categoryIds: string[],
) {
  for (let i = 0; i < categoryIds.length; i += D1_IN_CHUNK) {
    const chunk = categoryIds.slice(i, i + D1_IN_CHUNK)
    const row = await db
      .select({
        r2Key: productImages.r2Key,
        url: productImages.url,
      })
      .from(productImages)
      .innerJoin(products, eq(productImages.productId, products.id))
      .where(
        and(
          eq(products.status, 'active'),
          or(inArray(products.categoryId, chunk), inArray(products.subcategoryId, chunk)),
        ),
      )
      .limit(1)
    const image = row[0]
    if (!image) continue
    return image.r2Key ? mediaPublicPath(image.r2Key) : image.url
  }
  return null
}

async function hydrateProducts(
  db: ReturnType<typeof createDb>,
  rows: Array<typeof products.$inferSelect>,
) {
  if (!rows.length) return []
  const ids = rows.map((item) => item.id)
  const images: Array<typeof productImages.$inferSelect> = []
  for (let i = 0; i < ids.length; i += D1_IN_CHUNK) {
    const chunk = ids.slice(i, i + D1_IN_CHUNK)
    images.push(
      ...(await db.select().from(productImages).where(inArray(productImages.productId, chunk))),
    )
  }
  const cats = await db.select().from(catalogCategories)
  const brandRows = await db.select().from(brands)
  const catMap = new Map(cats.map((item) => [item.id, item]))
  const brandMap = new Map(brandRows.map((item) => [item.id, item]))
  const imagesByProduct = new Map<string, typeof images>()
  for (const image of images) {
    const list = imagesByProduct.get(image.productId) ?? []
    list.push(image)
    imagesByProduct.set(image.productId, list)
  }
  return rows.map((row) =>
    toCatalogProduct(
      row,
      imagesByProduct.get(row.id) ?? [],
      row.categoryId ? catMap.get(row.categoryId) : undefined,
      row.subcategoryId ? catMap.get(row.subcategoryId) : undefined,
      row.brandId ? brandMap.get(row.brandId) : undefined,
    ),
  )
}
