import { and, asc, desc, eq, inArray, like, or, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { createDb } from '../db'
import { brands, catalogCategories, productImages, products } from '../db/schema'
import { toCatalogProduct } from '../lib/catalog-map'
import type { AppEnv } from '../types'

export const catalogRoutes = new Hono<AppEnv>()

const MAX_LIMIT = 48

function clampLimit(raw: string | undefined, fallback = 24) {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(MAX_LIMIT, Math.floor(n))
}

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
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.status, 'active'))
    .orderBy(desc(products.updatedAt))
    .limit(8)
  return c.json(await hydrateProducts(db, rows))
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
  const walk = (id: string) => {
    for (const child of cats.filter((item) => item.parentId === id)) {
      result.push(child.id)
      walk(child.id)
    }
  }
  walk(parentId)
  return result
}

async function hydrateProducts(
  db: ReturnType<typeof createDb>,
  rows: Array<typeof products.$inferSelect>,
) {
  if (!rows.length) return []
  const ids = rows.map((item) => item.id)
  const images = await db.select().from(productImages).where(inArray(productImages.productId, ids))
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
