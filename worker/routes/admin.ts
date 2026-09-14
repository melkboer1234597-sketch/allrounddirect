import { Hono } from 'hono'
import { and, desc, eq, gte, like, lt, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { createDb } from '../db'
import {
  auditLogs,
  brands,
  catalogCategories,
  coupons,
  customerProfiles,
  importJobs,
  mediaAssets,
  orderItems,
  orderNotes,
  orderStatusHistory,
  orders,
  productImages,
  products,
  productSpecifications,
  productVariants,
  quotes,
  quoteItems,
  refunds,
  returns,
  seoOverrides,
  shipments,
  siteContent,
  suppliers,
  user,
} from '../db/schema'
import { adminCsrf, requireStaff } from '../auth/rbac-guard'
import { writeAudit } from '../lib/audit'
import { parseCsv } from '../lib/csv'
import { marginFrom } from '../lib/margin'
import { newId } from '../lib/request'
import { allowedOrderTransitions, canTransitionOrder } from '../../shared/order-machine'
import { ORDER_STATUS_LABELS, isOrderStatus } from '../../shared/order-status'
import { emitOrderEvent } from '../services/order-events'
import {
  PRODUCT_STATUSES,
  QUOTE_STATUSES,
  RETURN_STATUSES,
  SUPPLIER_FEED_TYPES,
  isUserRole,
} from '../../shared/rbac'
import { ingestCatalogPayload } from '../services/r2-catalog-import'
import type { AppEnv } from '../types'

export const adminRoutes = new Hono<AppEnv>()

adminRoutes.use('*', adminCsrf)

const productBody = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  ean: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  subcategoryId: z.string().optional().nullable(),
  status: z.enum(PRODUCT_STATUSES).optional(),
  priceInclCents: z.number().int().nonnegative().nullable().optional(),
  vatPercent: z.number().int().min(0).max(100).optional(),
  compareAtInclCents: z.number().int().nonnegative().nullable().optional(),
  costPriceCents: z.number().int().nonnegative().nullable().optional(),
  supplierId: z.string().optional().nullable(),
  supplierSku: z.string().optional().nullable(),
  stockStatus: z.string().optional(),
  stockQuantity: z.number().int().nullable().optional(),
  leadTimeMinDays: z.number().int().nullable().optional(),
  leadTimeMaxDays: z.number().int().nullable().optional(),
  deliveryType: z.string().optional().nullable(),
  isOutlet: z.boolean().optional(),
  isBusinessOnly: z.boolean().optional(),
  specificationsJson: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  canonicalOverride: z.string().optional().nullable(),
  robots: z.string().optional(),
  ogImage: z.string().optional().nullable(),
  sourceName: z.string().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
  sourceProductId: z.string().optional().nullable(),
  sourceRightsStatus: z.string().optional().nullable(),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().optional() })).optional(),
})

adminRoutes.get('/session', async (c) => {
  const { staff, response } = await requireStaff(c)
  if (!staff) return response
  return c.json({ user: { id: staff.userId, email: staff.email, role: staff.role } })
})

adminRoutes.get('/dashboard', async (c) => {
  const { staff, response } = await requireStaff(c)
  if (!staff) return response
  const db = createDb(c.env)
  const now = Date.now()
  const monthStart = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1)

  const [revenue] = await db
    .select({ value: sql<number>`coalesce(sum(${orders.totalCents}), 0)` })
    .from(orders)
    .where(and(eq(orders.paymentStatus, 'paid'), gte(orders.placedAt, monthStart)))
  const [orderCount] = await db.select({ value: sql<number>`count(*)` }).from(orders)
  const [openOrders] = await db
    .select({ value: sql<number>`count(*)` })
    .from(orders)
    .where(sql`${orders.status} not in ('delivered', 'cancelled', 'refunded')`)
  const [newCustomers] = await db
    .select({ value: sql<number>`count(*)` })
    .from(user)
    .where(and(eq(user.role, 'customer'), gte(user.createdAt, monthStart)))
  const [openReturns] = await db
    .select({ value: sql<number>`count(*)` })
    .from(returns)
    .where(sql`${returns.status} not in ('refunded', 'rejected')`)
  const [openQuotes] = await db
    .select({ value: sql<number>`count(*)` })
    .from(quotes)
    .where(sql`${quotes.status} in ('lead', 'in_review', 'quoted')`)

  const recentOrders = await db.select().from(orders).orderBy(desc(orders.placedAt)).limit(8)
  const failedPayments = await db
    .select()
    .from(orders)
    .where(eq(orders.paymentStatus, 'failed'))
    .orderBy(desc(orders.placedAt))
    .limit(20)
  const allProducts = await db.select().from(products)
  const images = await db.select().from(productImages)
  const withImage = new Set(images.map((item) => item.productId))
  const withoutImage = allProducts.filter((item) => !withImage.has(item.id)).slice(0, 20)
  const withoutPrice = allProducts.filter((item) => item.priceInclCents == null).slice(0, 20)
  const lowStock = allProducts
    .filter(
      (item) =>
        item.stockStatus === 'unknown' || (item.stockQuantity != null && item.stockQuantity <= 3),
    )
    .slice(0, 20)
  const openReturnRows = await db
    .select()
    .from(returns)
    .where(sql`${returns.status} not in ('refunded', 'rejected')`)
    .limit(20)

  const chartDays: Array<{ date: string; orders: number; revenueCents: number }> = []
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(now - i * 86400000)
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate())
    const end = new Date(start.getTime() + 86400000)
    const dayOrders = await db
      .select()
      .from(orders)
      .where(and(gte(orders.placedAt, start), lt(orders.placedAt, end)))
    chartDays.push({
      date: start.toISOString().slice(0, 10),
      orders: dayOrders.length,
      revenueCents: dayOrders
        .filter((item) => item.paymentStatus === 'paid')
        .reduce((sum, item) => sum + item.totalCents, 0),
    })
  }
  const hasChartData = chartDays.some((day) => day.orders > 0)

  return c.json({
    cards: {
      revenueCents: Number(revenue?.value ?? 0),
      orders: Number(orderCount?.value ?? 0),
      openOrders: Number(openOrders?.value ?? 0),
      newCustomers: Number(newCustomers?.value ?? 0),
      openReturns: Number(openReturns?.value ?? 0),
      openQuotes: Number(openQuotes?.value ?? 0),
    },
    recentOrders: recentOrders.map((item) => ({
      id: item.id,
      orderNumber: item.orderNumber,
      placedAt: item.placedAt,
      totalCents: item.totalCents,
      status: item.status,
      statusLabel: isOrderStatus(item.status) ? ORDER_STATUS_LABELS[item.status] : item.status,
      paymentStatus: item.paymentStatus,
      customer: item.guestEmail,
    })),
    attention: {
      failedPayments: failedPayments.map((item) => ({
        orderNumber: item.orderNumber,
        placedAt: item.placedAt,
      })),
      productsWithoutImage: withoutImage.map((item) => ({ id: item.id, name: item.name })),
      productsWithoutPrice: withoutPrice.map((item) => ({ id: item.id, name: item.name })),
      lowOrUnknownStock: lowStock.map((item) => ({
        id: item.id,
        name: item.name,
        stockStatus: item.stockStatus,
        stockQuantity: item.stockQuantity,
      })),
      openReturns: openReturnRows.map((item) => ({ id: item.id, status: item.status })),
    },
    chart: hasChartData ? chartDays : null,
  })
})

adminRoutes.get('/products', async (c) => {
  const { staff, response } = await requireStaff(c)
  if (!staff) return response
  const db = createDb(c.env)
  const q = c.req.query('q')?.trim()
  const status = c.req.query('status')
  const categoryId = c.req.query('categoryId')
  const source = c.req.query('source')?.trim()
  const missingPrice = c.req.query('missingPrice') === '1'
  const missingImage = c.req.query('missingImage') === '1'
  const rightsReview = c.req.query('rightsReview') === '1'
  const conditions = []
  if (q) {
    conditions.push(
      or(
        like(products.name, `%${q}%`),
        like(products.sku, `%${q}%`),
        like(products.slug, `%${q}%`),
      ),
    )
  }
  if (status && PRODUCT_STATUSES.includes(status as (typeof PRODUCT_STATUSES)[number])) {
    conditions.push(eq(products.status, status))
  }
  if (categoryId) {
    conditions.push(or(eq(products.categoryId, categoryId), eq(products.subcategoryId, categoryId)))
  }
  if (source) {
    conditions.push(like(products.sourceName, `%${source}%`))
  }
  if (missingPrice) {
    conditions.push(sql`${products.priceInclCents} is null`)
  }
  if (rightsReview) {
    conditions.push(eq(products.sourceRightsStatus, 'needs_review'))
  }
  if (missingImage) {
    conditions.push(
      sql`not exists (select 1 from product_images pi where pi.product_id = ${products.id})`,
    )
  }
  const rows = await db
    .select()
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(products.updatedAt))
    .limit(200)
  const cats = await db.select().from(catalogCategories)
  const catMap = new Map(cats.map((item) => [item.id, item.name]))
  const images = await db.select().from(productImages)
  const firstImage = new Map<string, string>()
  for (const image of images) {
    if (!firstImage.has(image.productId)) firstImage.set(image.productId, image.url)
  }
  return c.json({
    products: rows.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.subcategoryId
        ? (catMap.get(item.subcategoryId) ?? catMap.get(item.categoryId ?? '') ?? null)
        : item.categoryId
          ? (catMap.get(item.categoryId) ?? null)
          : null,
      status: item.status,
      priceInclCents: item.priceInclCents,
      stockStatus: item.stockStatus,
      sourceName: item.sourceName,
      sourceRightsStatus: item.sourceRightsStatus,
      leadTime:
        item.leadTimeMinDays != null
          ? `${item.leadTimeMinDays}-${item.leadTimeMaxDays ?? item.leadTimeMinDays} dagen`
          : null,
      updatedAt: item.updatedAt,
      image: firstImage.get(item.id) ?? null,
    })),
  })
})

adminRoutes.get('/products/:id', async (c) => {
  const { staff, response } = await requireStaff(c)
  if (!staff) return response
  const db = createDb(c.env)
  const id = c.req.param('id')
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1)
  const product = rows[0]
  if (!product) return c.json({ error: 'Niet gevonden.' }, 404)
  const images = await db.select().from(productImages).where(eq(productImages.productId, id))
  const variants = await db.select().from(productVariants).where(eq(productVariants.productId, id))
  const specifications = await db
    .select()
    .from(productSpecifications)
    .where(eq(productSpecifications.productId, id))
  const margin = marginFrom(product.priceInclCents, product.vatPercent, product.costPriceCents)
  return c.json({
    product: {
      ...product,
      ...margin,
    },
    images,
    variants,
    specifications,
  })
})

adminRoutes.post('/products', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  const parsed = productBody.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: 'Controleer de productgegevens.' }, 400)
  const db = createDb(c.env)
  const id = newId()
  const now = new Date()
  const data = parsed.data
  await db.insert(products).values({
    id,
    name: data.name,
    slug: data.slug,
    description: data.description ?? null,
    shortDescription: data.shortDescription ?? null,
    sku: data.sku ?? null,
    ean: data.ean ?? null,
    brandId: data.brandId ?? null,
    categoryId: data.categoryId ?? null,
    subcategoryId: data.subcategoryId ?? null,
    status: data.status ?? 'draft',
    priceInclCents: data.priceInclCents ?? null,
    vatPercent: data.vatPercent ?? 21,
    compareAtInclCents: data.compareAtInclCents ?? null,
    costPriceCents: data.costPriceCents ?? null,
    supplierId: data.supplierId ?? null,
    supplierSku: data.supplierSku ?? null,
    stockStatus: data.stockStatus ?? 'unknown',
    stockQuantity: data.stockQuantity ?? null,
    leadTimeMinDays: data.leadTimeMinDays ?? null,
    leadTimeMaxDays: data.leadTimeMaxDays ?? null,
    deliveryType: data.deliveryType ?? null,
    isOutlet: data.isOutlet ?? false,
    isBusinessOnly: data.isBusinessOnly ?? false,
    specificationsJson: data.specificationsJson ?? null,
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? null,
    canonicalOverride: data.canonicalOverride ?? null,
    robots: data.robots ?? 'index,follow',
    ogImage: data.ogImage ?? null,
    createdAt: now,
    updatedAt: now,
  })
  await writeAudit(db, staff, {
    action: 'product.create',
    entity: 'product',
    entityId: id,
    summary: `Product aangemaakt: ${parsed.data.name}`,
  })
  return c.json({ id })
})

adminRoutes.patch('/products/:id', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  const parsed = productBody.partial().safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: 'Controleer de productgegevens.' }, 400)
  const db = createDb(c.env)
  const id = c.req.param('id')
  const existing = await db.select().from(products).where(eq(products.id, id)).limit(1)
  if (!existing[0]) return c.json({ error: 'Niet gevonden.' }, 404)
  const { images: _images, ...rest } = parsed.data
  await db
    .update(products)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(products.id, id))
  if (
    parsed.data.priceInclCents !== undefined &&
    parsed.data.priceInclCents !== existing[0].priceInclCents
  ) {
    await writeAudit(db, staff, {
      action: 'product.price_change',
      entity: 'product',
      entityId: id,
      summary: `Prijs gewijzigd voor ${existing[0].name}`,
    })
  } else {
    await writeAudit(db, staff, {
      action: 'product.update',
      entity: 'product',
      entityId: id,
      summary: `Product bijgewerkt: ${existing[0].name}`,
    })
  }
  return c.json({ ok: true })
})

adminRoutes.post('/products/:id/images', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  const productId = c.req.param('id')
  const contentType = c.req.header('content-type') ?? ''
  const db = createDb(c.env)
  if (contentType.includes('multipart/form-data')) {
    const body = await c.req.parseBody()
    const file = body.file
    if (!(file instanceof File)) return c.json({ error: 'Geen bestand.' }, 400)
    const bytes = new Uint8Array(await file.arrayBuffer())
    const key = `products/${productId}/uploads/${newId()}${extFromName(file.name)}`
    await c.env.MEDIA.put(key, bytes, {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
    })
    await db.insert(productImages).values({
      id: newId(),
      productId,
      url: `/media/${key}`,
      alt: file.name,
      sortOrder: 99,
      r2Key: key,
      originalFilename: file.name,
      mimeType: file.type || null,
      fileSize: bytes.byteLength,
      createdAt: new Date(),
    })
    return c.json({ ok: true, key })
  }
  const parsed = z
    .object({ url: z.string().url(), alt: z.string().optional() })
    .safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: 'Ongeldige afbeelding.' }, 400)
  await db.insert(productImages).values({
    id: newId(),
    productId,
    url: parsed.data.url,
    alt: parsed.data.alt ?? null,
    sortOrder: 0,
  })
  return c.json({ ok: true })
})

adminRoutes.patch('/products/:id/images', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  const body = z
    .object({
      items: z.array(
        z.object({
          id: z.string(),
          sortOrder: z.number().int(),
          isPrimary: z.boolean().optional(),
        }),
      ),
    })
    .safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldige sortering.' }, 400)
  const db = createDb(c.env)
  for (const item of body.data.items) {
    await db
      .update(productImages)
      .set({
        sortOrder: item.sortOrder,
        isPrimary: item.isPrimary ?? false,
      })
      .where(eq(productImages.id, item.id))
  }
  return c.json({ ok: true })
})

adminRoutes.delete('/products/:id/images/:imageId', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  const db = createDb(c.env)
  await db.delete(productImages).where(eq(productImages.id, c.req.param('imageId')))
  return c.json({ ok: true })
})

adminRoutes.post('/products/:id/variants', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  const body = z
    .object({
      name: z.string().min(1),
      optionsJson: z.string().optional(),
      sku: z.string().optional().nullable(),
      priceInclCents: z.number().int().nullable().optional(),
      stockStatus: z.string().optional(),
      stockQuantity: z.number().int().nullable().optional(),
      imageUrl: z.string().optional().nullable(),
      supplierSku: z.string().optional().nullable(),
    })
    .safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldige variant.' }, 400)
  const db = createDb(c.env)
  const now = new Date()
  const id = newId()
  await db.insert(productVariants).values({
    id,
    productId: c.req.param('id'),
    name: body.data.name,
    optionsJson: body.data.optionsJson ?? '{}',
    sku: body.data.sku ?? null,
    priceInclCents: body.data.priceInclCents ?? null,
    stockStatus: body.data.stockStatus ?? 'unknown',
    stockQuantity: body.data.stockQuantity ?? null,
    imageUrl: body.data.imageUrl ?? null,
    supplierSku: body.data.supplierSku ?? null,
    createdAt: now,
    updatedAt: now,
  })
  return c.json({ id })
})

adminRoutes.delete('/products/:id/variants/:variantId', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  const db = createDb(c.env)
  await db.delete(productVariants).where(eq(productVariants.id, c.req.param('variantId')))
  return c.json({ ok: true })
})

adminRoutes.post('/products/bulk', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  const body = z
    .object({
      ids: z.array(z.string()).min(1),
      action: z.enum(['archive', 'activate', 'draft', 'set_category']),
      categoryId: z.string().optional(),
    })
    .safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldige selectie.' }, 400)
  if (body.data.action === 'set_category' && !body.data.categoryId) {
    return c.json({ error: 'Kies een categorie.' }, 400)
  }
  const status =
    body.data.action === 'archive'
      ? 'archived'
      : body.data.action === 'activate'
        ? 'active'
        : body.data.action === 'draft'
          ? 'draft'
          : null
  const db = createDb(c.env)
  for (const id of body.data.ids) {
    if (body.data.action === 'set_category' && body.data.categoryId) {
      await db
        .update(products)
        .set({ subcategoryId: body.data.categoryId, updatedAt: new Date() })
        .where(eq(products.id, id))
    } else if (status) {
      await db.update(products).set({ status, updatedAt: new Date() }).where(eq(products.id, id))
    }
  }
  await writeAudit(db, staff, {
    action: 'product.bulk',
    entity: 'product',
    summary: `Bulk ${body.data.action} op ${body.data.ids.length} producten`,
  })
  return c.json({ ok: true })
})

adminRoutes.get('/categories', async (c) => {
  const { staff, response } = await requireStaff(c)
  if (!staff) return response
  const db = createDb(c.env)
  return c.json({
    items: await db.select().from(catalogCategories).orderBy(catalogCategories.sortOrder),
  })
})

adminRoutes.post('/categories', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  const body = z
    .object({
      name: z.string().min(1),
      slug: z.string().min(1),
      parentId: z.string().nullable().optional(),
    })
    .safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldige categorie.' }, 400)
  const db = createDb(c.env)
  const now = new Date()
  const id = newId()
  await db.insert(catalogCategories).values({
    id,
    name: body.data.name,
    slug: body.data.slug,
    parentId: body.data.parentId ?? null,
    sortOrder: 0,
    active: true,
    robots: 'index,follow',
    createdAt: now,
    updatedAt: now,
  })
  return c.json({ id })
})

adminRoutes.patch('/categories/:id', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  const body = z
    .object({
      name: z.string().optional(),
      slug: z.string().optional(),
      seoTitle: z.string().nullable().optional(),
      seoDescription: z.string().nullable().optional(),
      robots: z.string().optional(),
      active: z.boolean().optional(),
    })
    .safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldige categorie.' }, 400)
  const db = createDb(c.env)
  await db
    .update(catalogCategories)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(catalogCategories.id, c.req.param('id')))
  return c.json({ ok: true })
})

adminRoutes.get('/brands', async (c) => {
  const { staff, response } = await requireStaff(c)
  if (!staff) return response
  const db = createDb(c.env)
  return c.json({ items: await db.select().from(brands).orderBy(brands.name) })
})

adminRoutes.post('/brands', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  const body = z
    .object({ name: z.string().min(1), slug: z.string().min(1) })
    .safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldig merk.' }, 400)
  const db = createDb(c.env)
  const id = newId()
  const now = new Date()
  await db.insert(brands).values({
    id,
    name: body.data.name,
    slug: body.data.slug,
    active: true,
    createdAt: now,
    updatedAt: now,
  })
  return c.json({ id })
})

adminRoutes.get('/suppliers', async (c) => {
  const { staff, response } = await requireStaff(c)
  if (!staff) return response
  const db = createDb(c.env)
  return c.json({ items: await db.select().from(suppliers).orderBy(suppliers.name) })
})

adminRoutes.post('/suppliers', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  const body = z
    .object({
      name: z.string().min(1),
      internalCode: z.string().min(1),
      contactName: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
      website: z.string().optional().nullable(),
      orderEmail: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      defaultLeadTime: z.string().optional().nullable(),
      feedType: z.enum(SUPPLIER_FEED_TYPES).optional(),
      active: z.boolean().optional(),
    })
    .safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldige leverancier.' }, 400)
  const db = createDb(c.env)
  const id = newId()
  const now = new Date()
  await db.insert(suppliers).values({
    id,
    ...body.data,
    feedType: body.data.feedType ?? 'manual',
    active: body.data.active ?? true,
    createdAt: now,
    updatedAt: now,
  })
  await writeAudit(db, staff, {
    action: 'supplier.create',
    entity: 'supplier',
    entityId: id,
    summary: `Leverancier aangemaakt: ${body.data.name}`,
  })
  return c.json({ id })
})

adminRoutes.patch('/suppliers/:id', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  const db = createDb(c.env)
  const body = (await c.req.json()) as Record<string, unknown>
  await db
    .update(suppliers)
    .set({ ...body, updatedAt: new Date() } as never)
    .where(eq(suppliers.id, c.req.param('id')))
  await writeAudit(db, staff, {
    action: 'supplier.update',
    entity: 'supplier',
    entityId: c.req.param('id'),
    summary: 'Leverancier bijgewerkt',
  })
  return c.json({ ok: true })
})

adminRoutes.get('/orders', async (c) => {
  const { staff, response } = await requireStaff(c, 'orders.read')
  if (!staff) return response
  const db = createDb(c.env)
  const rows = await db.select().from(orders).orderBy(desc(orders.placedAt)).limit(200)
  return c.json({
    orders: rows.map((item) => ({
      id: item.id,
      orderNumber: item.orderNumber,
      customer: item.guestEmail,
      placedAt: item.placedAt,
      paymentStatus: item.paymentStatus,
      status: item.status,
      statusLabel: isOrderStatus(item.status) ? ORDER_STATUS_LABELS[item.status] : item.status,
      totalCents: item.totalCents,
    })),
  })
})

adminRoutes.get('/orders/:id', async (c) => {
  const { staff, response } = await requireStaff(c, 'orders.read')
  if (!staff) return response
  const db = createDb(c.env)
  const id = c.req.param('id')
  const found = await db
    .select()
    .from(orders)
    .where(or(eq(orders.id, id), eq(orders.orderNumber, id)))
    .limit(1)
  const order = found[0]
  if (!order) return c.json({ error: 'Niet gevonden.' }, 404)
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  const notes = await db.select().from(orderNotes).where(eq(orderNotes.orderId, order.id))
  const refundRows = await db.select().from(refunds).where(eq(refunds.orderId, order.id))
  const shipRows = await db.select().from(shipments).where(eq(shipments.orderId, order.id))
  return c.json({
    order: {
      ...order,
      statusLabel: isOrderStatus(order.status) ? ORDER_STATUS_LABELS[order.status] : order.status,
      billing: JSON.parse(order.billingSnapshot),
      shipping: JSON.parse(order.shippingSnapshot),
    },
    items,
    notes,
    refunds: refundRows,
    shipments: shipRows,
    allowedTransitions: isOrderStatus(order.status) ? allowedOrderTransitions(order.status) : [],
  })
})

adminRoutes.patch('/orders/:id/status', async (c) => {
  const { staff, response } = await requireStaff(c, 'orders.write')
  if (!staff) return response
  const body = z.object({ status: z.string() }).safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldige status.' }, 400)
  const db = createDb(c.env)
  const found = await db
    .select()
    .from(orders)
    .where(eq(orders.id, c.req.param('id')))
    .limit(1)
  const order = found[0]
  if (!order) return c.json({ error: 'Niet gevonden.' }, 404)
  if (!canTransitionOrder(order.status, body.data.status)) {
    return c.json({ error: 'Deze statuswijziging is niet toegestaan.' }, 400)
  }
  await db
    .update(orders)
    .set({ status: body.data.status, updatedAt: new Date() })
    .where(eq(orders.id, order.id))
  await db.insert(orderStatusHistory).values({
    id: newId(),
    orderId: order.id,
    fromStatus: order.status,
    toStatus: body.data.status,
    source: 'admin',
    actorUserId: staff.userId,
    note: null,
    createdAt: new Date(),
  })
  await writeAudit(db, staff, {
    action: 'order.status_change',
    entity: 'order',
    entityId: order.id,
    summary: `Order ${order.orderNumber}: ${order.status} → ${body.data.status}`,
  })
  const eventByStatus: Record<
    string,
    | 'ORDER_PROCESSING'
    | 'SHIPMENT_SENT'
    | 'ORDER_DELIVERED'
    | 'ORDER_CANCELLED'
    | 'RETURN_REQUESTED'
    | 'REFUND_COMPLETED'
  > = {
    processing: 'ORDER_PROCESSING',
    shipped: 'SHIPMENT_SENT',
    partially_shipped: 'SHIPMENT_SENT',
    delivered: 'ORDER_DELIVERED',
    cancelled: 'ORDER_CANCELLED',
    return_requested: 'RETURN_REQUESTED',
    refunded: 'REFUND_COMPLETED',
  }
  const eventType = eventByStatus[body.data.status]
  if (eventType) {
    await emitOrderEvent(c.env, {
      type: eventType,
      orderId: order.id,
      entityType: 'order',
      entityId: `${order.id}:${body.data.status}`,
      data: {
        partial: body.data.status === 'partially_shipped' ? 'true' : 'false',
      },
    })
  }
  return c.json({ ok: true })
})

adminRoutes.post('/orders/:id/notes', async (c) => {
  const { staff, response } = await requireStaff(c, 'orders.write')
  if (!staff) return response
  const body = z.object({ body: z.string().min(1) }).safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Notitie ontbreekt.' }, 400)
  const db = createDb(c.env)
  await db.insert(orderNotes).values({
    id: newId(),
    orderId: c.req.param('id'),
    authorUserId: staff.userId,
    body: body.data.body,
    createdAt: new Date(),
  })
  return c.json({ ok: true })
})

adminRoutes.post('/orders/:id/refunds', async (c) => {
  const { staff, response } = await requireStaff(c, 'orders.write')
  if (!staff) return response
  const body = z
    .object({ amountCents: z.number().int().positive(), reason: z.string().optional() })
    .safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldige terugbetaling.' }, 400)
  const db = createDb(c.env)
  const id = newId()
  await db.insert(refunds).values({
    id,
    orderId: c.req.param('id'),
    paymentId: null,
    providerRefundId: null,
    amountCents: body.data.amountCents,
    reason: body.data.reason ?? null,
    status: 'pending',
    createdAt: new Date(),
  })
  await writeAudit(db, staff, {
    action: 'order.refund',
    entity: 'order',
    entityId: c.req.param('id'),
    summary: `Terugbetaling ${body.data.amountCents} cent`,
  })
  return c.json({ id })
})

adminRoutes.get('/returns', async (c) => {
  const { staff, response } = await requireStaff(c, 'orders.read')
  if (!staff) return response
  const db = createDb(c.env)
  return c.json({ items: await db.select().from(returns).orderBy(desc(returns.createdAt)) })
})

adminRoutes.patch('/returns/:id', async (c) => {
  const { staff, response } = await requireStaff(c, 'orders.write')
  if (!staff) return response
  const body = z
    .object({ status: z.enum(RETURN_STATUSES).optional(), adminNotes: z.string().optional() })
    .safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldige retour.' }, 400)
  const db = createDb(c.env)
  await db
    .update(returns)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(returns.id, c.req.param('id')))
  if (body.data.status === 'received') {
    const row = (
      await db
        .select()
        .from(returns)
        .where(eq(returns.id, c.req.param('id')))
        .limit(1)
    )[0]
    if (row) {
      await emitOrderEvent(c.env, {
        type: 'RETURN_RECEIVED',
        orderId: row.orderId,
        entityType: 'return',
        entityId: row.id,
      })
    }
  }
  return c.json({ ok: true })
})

adminRoutes.get('/quotes', async (c) => {
  const { staff, response } = await requireStaff(c, 'orders.read')
  if (!staff) return response
  const db = createDb(c.env)
  const rows = await db.select().from(quotes).orderBy(desc(quotes.createdAt))
  const items = await db.select().from(quoteItems)
  return c.json({
    items: rows.map((quote) => ({
      ...quote,
      products: items.filter((item) => item.quoteId === quote.id),
    })),
  })
})

adminRoutes.patch('/quotes/:id', async (c) => {
  const { staff, response } = await requireStaff(c, 'orders.write')
  if (!staff) return response
  const body = z.object({ status: z.enum(QUOTE_STATUSES) }).safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldige offerte.' }, 400)
  const db = createDb(c.env)
  await db
    .update(quotes)
    .set({ status: body.data.status, updatedAt: new Date() })
    .where(eq(quotes.id, c.req.param('id')))
  if (body.data.status === 'quoted') {
    const quote = (
      await db
        .select()
        .from(quotes)
        .where(eq(quotes.id, c.req.param('id')))
        .limit(1)
    )[0]
    if (quote) {
      await emitOrderEvent(c.env, {
        type: 'BUSINESS_QUOTE_READY',
        entityType: 'quote',
        entityId: quote.id,
        data: { email: quote.email },
      })
    }
  }
  return c.json({ ok: true })
})

adminRoutes.get('/customers', async (c) => {
  const { staff, response } = await requireStaff(c, 'customers.read')
  if (!staff) return response
  const db = createDb(c.env)
  const rows = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
    })
    .from(user)
    .where(eq(user.role, 'customer'))
    .orderBy(desc(user.createdAt))
    .limit(200)
  return c.json({ customers: rows })
})

adminRoutes.get('/customers/:id', async (c) => {
  const { staff, response } = await requireStaff(c, 'customers.read')
  if (!staff) return response
  const db = createDb(c.env)
  const id = c.req.param('id')
  const users = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1)
  if (!users[0]) return c.json({ error: 'Niet gevonden.' }, 404)
  const profiles = await db
    .select()
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, id))
    .limit(1)
  const customerOrders = await db.select().from(orders).where(eq(orders.userId, id))
  return c.json({
    customer: users[0],
    profile: profiles[0]
      ? {
          phone: profiles[0].phone,
          companyName: profiles[0].companyName,
          accountStatus: profiles[0].accountStatus,
        }
      : null,
    orders: customerOrders.map((item) => ({
      id: item.id,
      orderNumber: item.orderNumber,
      totalCents: item.totalCents,
      status: item.status,
      placedAt: item.placedAt,
    })),
  })
})

adminRoutes.get('/coupons', async (c) => {
  const { staff, response } = await requireStaff(c)
  if (!staff) return response
  const db = createDb(c.env)
  return c.json({ items: await db.select().from(coupons).orderBy(desc(coupons.createdAt)) })
})

adminRoutes.post('/coupons', async (c) => {
  const { staff, response } = await requireStaff(c, 'marketing.write')
  if (!staff) return response
  const body = z
    .object({
      code: z.string().min(2),
      type: z.enum(['percent', 'fixed']),
      valueCents: z.number().int().optional().nullable(),
      percent: z.number().int().optional().nullable(),
    })
    .safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldige code.' }, 400)
  const db = createDb(c.env)
  const id = newId()
  const now = new Date()
  await db.insert(coupons).values({
    id,
    code: body.data.code.toUpperCase(),
    type: body.data.type,
    valueCents: body.data.valueCents ?? null,
    percent: body.data.percent ?? null,
    active: true,
    createdAt: now,
    updatedAt: now,
  })
  return c.json({ id })
})

adminRoutes.get('/content', async (c) => {
  const { staff, response } = await requireStaff(c)
  if (!staff) return response
  const db = createDb(c.env)
  const rows = await db.select().from(siteContent)
  const map: Record<string, unknown> = {}
  for (const row of rows) map[row.key] = JSON.parse(row.valueJson)
  return c.json({
    content: {
      heroText: map.heroText ?? '',
      featuredCategories: map.featuredCategories ?? [],
      announcementBar: map.announcementBar ?? '',
      businessSection: map.businessSection ?? '',
      outletSection: map.outletSection ?? '',
    },
  })
})

adminRoutes.put('/content', async (c) => {
  const { staff, response } = await requireStaff(c, 'marketing.write')
  if (!staff) return response
  const body = z.record(z.string(), z.unknown()).safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldige content.' }, 400)
  const db = createDb(c.env)
  const now = new Date()
  for (const [key, value] of Object.entries(body.data)) {
    await db
      .insert(siteContent)
      .values({
        key,
        valueJson: JSON.stringify(value),
        updatedAt: now,
        updatedBy: staff.userId,
      })
      .onConflictDoUpdate({
        target: siteContent.key,
        set: { valueJson: JSON.stringify(value), updatedAt: now, updatedBy: staff.userId },
      })
  }
  await writeAudit(db, staff, {
    action: 'settings.change',
    entity: 'content',
    summary: 'Sitecontent bijgewerkt',
  })
  return c.json({ ok: true })
})

adminRoutes.get('/seo', async (c) => {
  const { staff, response } = await requireStaff(c)
  if (!staff) return response
  const db = createDb(c.env)
  return c.json({ items: await db.select().from(seoOverrides) })
})

adminRoutes.put('/seo', async (c) => {
  const { staff, response } = await requireStaff(c, 'marketing.write')
  if (!staff) return response
  const body = z
    .object({
      entityType: z.enum(['product', 'category', 'page']),
      entityId: z.string(),
      seoTitle: z.string().nullable().optional(),
      seoDescription: z.string().nullable().optional(),
      canonicalOverride: z.string().nullable().optional(),
      robots: z.string().nullable().optional(),
      ogImage: z.string().nullable().optional(),
    })
    .safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldige SEO.' }, 400)
  const db = createDb(c.env)
  const existing = await db
    .select()
    .from(seoOverrides)
    .where(
      and(
        eq(seoOverrides.entityType, body.data.entityType),
        eq(seoOverrides.entityId, body.data.entityId),
      ),
    )
    .limit(1)
  if (existing[0]) {
    await db
      .update(seoOverrides)
      .set({ ...body.data, updatedAt: new Date() })
      .where(eq(seoOverrides.id, existing[0].id))
  } else {
    await db.insert(seoOverrides).values({ id: newId(), ...body.data, updatedAt: new Date() })
  }
  return c.json({ ok: true })
})

adminRoutes.get('/media', async (c) => {
  const { staff, response } = await requireStaff(c)
  if (!staff) return response
  const db = createDb(c.env)
  return c.json({ items: await db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)) })
})

adminRoutes.post('/media', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  const body = z
    .object({ url: z.string().url(), filename: z.string().optional(), alt: z.string().optional() })
    .safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldige media.' }, 400)
  const db = createDb(c.env)
  const id = newId()
  await db.insert(mediaAssets).values({
    id,
    url: body.data.url,
    filename: body.data.filename ?? null,
    alt: body.data.alt ?? null,
    createdAt: new Date(),
  })
  return c.json({ id })
})

adminRoutes.get('/imports', async (c) => {
  const { staff, response } = await requireStaff(c, 'imports.write')
  if (!staff) return response
  const db = createDb(c.env)
  return c.json({ items: await db.select().from(importJobs).orderBy(desc(importJobs.createdAt)) })
})

adminRoutes.post('/imports', async (c) => {
  const { staff, response } = await requireStaff(c, 'imports.write')
  if (!staff) return response
  const body = z
    .object({ filename: z.string(), csv: z.string().max(2_000_000) })
    .safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Ongeldig bestand.' }, 400)
  const parsed = parseCsv(body.data.csv)
  const db = createDb(c.env)
  const id = newId()
  const now = new Date()
  await db.insert(importJobs).values({
    id,
    filename: body.data.filename,
    status: 'uploaded',
    headersJson: JSON.stringify(parsed.headers),
    previewJson: JSON.stringify(parsed.rows.slice(0, 25)),
    rowCount: parsed.rows.length,
    createdAt: now,
    updatedAt: now,
  })
  return c.json({
    id,
    headers: parsed.headers,
    preview: parsed.rows.slice(0, 25),
    rowCount: parsed.rows.length,
  })
})

adminRoutes.post('/imports/:id/validate', async (c) => {
  const { staff, response } = await requireStaff(c, 'imports.write')
  if (!staff) return response
  const body = z.object({ mapping: z.record(z.string(), z.string()) }).safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Mapping ontbreekt.' }, 400)
  const db = createDb(c.env)
  const jobs = await db
    .select()
    .from(importJobs)
    .where(eq(importJobs.id, c.req.param('id')))
    .limit(1)
  const job = jobs[0]
  if (!job) return c.json({ error: 'Niet gevonden.' }, 404)
  const headers = JSON.parse(job.headersJson ?? '[]') as string[]
  const errors: string[] = []
  if (!Object.values(body.data.mapping).includes('name')) errors.push('Kolom naam is verplicht.')
  if (
    !Object.values(body.data.mapping).includes('sku') &&
    !Object.values(body.data.mapping).includes('slug')
  ) {
    errors.push('SKU of slug is verplicht.')
  }
  await db
    .update(importJobs)
    .set({
      mappingJson: JSON.stringify(body.data.mapping),
      status: errors.length ? 'invalid' : 'validated',
      reportJson: JSON.stringify({ errors, headers }),
      updatedAt: new Date(),
    })
    .where(eq(importJobs.id, job.id))
  return c.json({ errors, dryRunRequired: true })
})

adminRoutes.post('/imports/:id/dry-run', async (c) => {
  const { staff, response } = await requireStaff(c, 'imports.write')
  if (!staff) return response
  const db = createDb(c.env)
  const jobs = await db
    .select()
    .from(importJobs)
    .where(eq(importJobs.id, c.req.param('id')))
    .limit(1)
  const job = jobs[0]
  if (!job || job.status === 'invalid') return c.json({ error: 'Valideer eerst de mapping.' }, 400)
  await db
    .update(importJobs)
    .set({ status: 'dry_run', updatedAt: new Date() })
    .where(eq(importJobs.id, job.id))
  return c.json({
    wouldImport: job.rowCount,
    message: 'Dry-run voltooid. Er zijn geen records weggeschreven. Bevestig om te importeren.',
  })
})

adminRoutes.post('/imports/:id/confirm', async (c) => {
  const { staff, response } = await requireStaff(c, 'imports.write')
  if (!staff) return response
  const db = createDb(c.env)
  const jobs = await db
    .select()
    .from(importJobs)
    .where(eq(importJobs.id, c.req.param('id')))
    .limit(1)
  const job = jobs[0]
  if (!job || job.status !== 'dry_run') {
    return c.json({ error: 'Voer eerst een dry-run uit.' }, 400)
  }
  await db
    .update(importJobs)
    .set({ status: 'imported', updatedAt: new Date() })
    .where(eq(importJobs.id, job.id))
  await writeAudit(db, staff, {
    action: 'import.confirm',
    entity: 'import_job',
    entityId: job.id,
    summary: `Import bevestigd: ${job.filename} (${job.rowCount} rijen). Productinsert volgt in een latere batch.`,
  })
  return c.json({
    ok: true,
    imported: 0,
    note: 'Bevestigd. Daadwerkelijke productinsert volgt na mapping-goedkeuring per feed.',
  })
})

adminRoutes.get('/users', async (c) => {
  const { staff, response } = await requireStaff(c, 'users.roles')
  if (!staff) return response
  const db = createDb(c.env)
  const rows = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
  return c.json({ users: rows })
})

adminRoutes.patch('/users/:id/role', async (c) => {
  const { staff, response } = await requireStaff(c, 'users.roles')
  if (!staff) return response
  const body = z.object({ role: z.string() }).safeParse(await c.req.json())
  if (!body.success || !isUserRole(body.data.role)) return c.json({ error: 'Ongeldige rol.' }, 400)
  const db = createDb(c.env)
  const id = c.req.param('id')
  if (id === staff.userId && body.data.role !== 'super_admin') {
    return c.json({ error: 'U kunt uw eigen super-adminrol niet intrekken.' }, 400)
  }
  await db.update(user).set({ role: body.data.role, updatedAt: new Date() }).where(eq(user.id, id))
  await writeAudit(db, staff, {
    action: 'user.role_change',
    entity: 'user',
    entityId: id,
    summary: `Rol gewijzigd naar ${body.data.role}`,
  })
  return c.json({ ok: true })
})

adminRoutes.get('/audit-log', async (c) => {
  const { staff, response } = await requireStaff(c, 'audit.read')
  if (!staff) return response
  const db = createDb(c.env)
  const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(200)
  return c.json({ items: rows })
})

adminRoutes.post('/catalog-import/process', async (c) => {
  const { staff, response } = await requireStaff(c, 'catalog.write')
  if (!staff) return response
  let last: Awaited<ReturnType<typeof ingestCatalogPayload>> | null = null
  for (let i = 0; i < 8; i += 1) {
    last = await ingestCatalogPayload(c.env)
    if (!last.ok || ('done' in last && last.done)) break
  }
  await writeAudit(createDb(c.env), staff, {
    action: 'catalog.import_r2',
    entity: 'import_run',
    summary: 'R2 catalogusimport verwerkt',
  })
  return c.json(last)
})

function extFromName(name: string) {
  const ext = name.toLowerCase().match(/\.(webp|png|jpe?g|avif|gif)$/)
  return ext ? ext[0] : '.webp'
}

adminRoutes.get('/settings', async (c) => {
  const { staff, response } = await requireStaff(c, 'settings.write')
  if (!staff) return response
  return c.json({
    settings: {
      twoFactor: {
        enabled: false,
        note: 'Better Auth twoFactor (TOTP) plugin later koppelen. Geen custom TOTP.',
      },
    },
  })
})
