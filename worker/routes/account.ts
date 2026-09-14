import { Hono } from 'hono'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { createDb } from '../db'
import {
  accountDeletionRequests,
  addresses,
  customerProfiles,
  orderItems,
  orders,
  shipmentItems,
  shipments,
  user,
  wishlistItems,
} from '../db/schema'
import { requireSession } from '../auth/session'
import { newId } from '../lib/request'
import {
  ORDER_STATUS_LABELS,
  SHIPMENT_STATUS_LABELS,
  isOrderStatus,
  isShipmentStatus,
} from '../../shared/order-status'
import type { AppEnv } from '../types'

export const accountRoutes = new Hono<AppEnv>()

const addressSchema = z.object({
  label: z.string().trim().max(80).optional(),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  companyName: z.string().trim().max(120).optional(),
  street: z.string().trim().min(1).max(120),
  houseNumber: z.string().trim().min(1).max(20),
  addition: z.string().trim().max(20).optional(),
  postalCode: z.string().trim().min(4).max(12),
  city: z.string().trim().min(1).max(80),
  country: z.string().trim().length(2).default('NL'),
  phone: z.string().trim().max(30).optional(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
})

const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().max(30).optional().nullable(),
  companyName: z.string().trim().max(120).optional().nullable(),
  kvk: z.string().trim().max(20).optional().nullable(),
  vatNumber: z.string().trim().max(30).optional().nullable(),
})

const privacySchema = z.object({
  marketingOptIn: z.boolean(),
})

accountRoutes.get('/me', async (c) => {
  const { session, response } = await requireSession(c)
  if (!session) return response
  const db = createDb(c.env)
  const profiles = await db
    .select()
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, session.user.id))
    .limit(1)
  const profile = profiles[0]
  const authUser = session.user as typeof session.user & {
    firstName?: string
    lastName?: string
    marketingOptIn?: boolean
  }
  return c.json({
    user: {
      id: authUser.id,
      email: authUser.email,
      emailVerified: authUser.emailVerified,
      firstName: profile?.firstName ?? authUser.firstName,
      lastName: profile?.lastName ?? authUser.lastName,
      name: authUser.name,
      marketingOptIn: profile?.marketingOptIn ?? authUser.marketingOptIn ?? false,
      phone: profile?.phone ?? null,
      companyName: profile?.companyName ?? null,
      kvk: profile?.kvk ?? null,
      vatNumber: profile?.vatNumber ?? null,
      accountStatus: profile?.accountStatus ?? 'active',
      twoFactorEnabled: false,
    },
    session: {
      id: session.session.id,
      expiresAt: session.session.expiresAt,
    },
  })
})

accountRoutes.patch('/profile', async (c) => {
  const { session, response } = await requireSession(c)
  if (!session) return response
  const parsed = profileSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: 'Controleer de ingevulde gegevens.' }, 400)

  const db = createDb(c.env)
  const now = new Date()
  const name = `${parsed.data.firstName} ${parsed.data.lastName}`.trim()
  await db
    .update(user)
    .set({
      name,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      updatedAt: now,
    })
    .where(eq(user.id, session.user.id))
  await db
    .update(customerProfiles)
    .set({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone ?? null,
      companyName: parsed.data.companyName ?? null,
      kvk: parsed.data.kvk ?? null,
      vatNumber: parsed.data.vatNumber ?? null,
      updatedAt: now,
    })
    .where(eq(customerProfiles.userId, session.user.id))

  return c.json({ ok: true })
})

accountRoutes.patch('/privacy', async (c) => {
  const { session, response } = await requireSession(c)
  if (!session) return response
  const parsed = privacySchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: 'Ongeldige voorkeur.' }, 400)
  const db = createDb(c.env)
  const now = new Date()
  await db
    .update(user)
    .set({ marketingOptIn: parsed.data.marketingOptIn, updatedAt: now })
    .where(eq(user.id, session.user.id))
  await db
    .update(customerProfiles)
    .set({ marketingOptIn: parsed.data.marketingOptIn, updatedAt: now })
    .where(eq(customerProfiles.userId, session.user.id))
  return c.json({ ok: true })
})

accountRoutes.post('/deletion-request', async (c) => {
  const { session, response } = await requireSession(c)
  if (!session) return response
  const db = createDb(c.env)
  const now = new Date()
  await db.insert(accountDeletionRequests).values({
    id: newId(),
    userId: session.user.id,
    status: 'pending',
    note: 'Aangevraagd via accountprivacy. Orderadministratie blijft bewaard.',
    requestedAt: now,
  })
  await db
    .update(customerProfiles)
    .set({
      accountStatus: 'deletion_requested',
      deletionRequestedAt: now,
      marketingOptIn: false,
      updatedAt: now,
    })
    .where(eq(customerProfiles.userId, session.user.id))
  await db
    .update(user)
    .set({ marketingOptIn: false, updatedAt: now })
    .where(eq(user.id, session.user.id))
  return c.json({
    ok: true,
    message:
      'We hebben uw verzoek tot verwijdering ontvangen. Bestellingen en factuurgegevens blijven bewaard zolang dat wettelijk verplicht is.',
  })
})

accountRoutes.get('/addresses', async (c) => {
  const { session, response } = await requireSession(c)
  if (!session) return response
  const db = createDb(c.env)
  const rows = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, session.user.id))
    .orderBy(desc(addresses.createdAt))
  return c.json({ addresses: rows })
})

accountRoutes.post('/addresses', async (c) => {
  const { session, response } = await requireSession(c)
  if (!session) return response
  const parsed = addressSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: 'Controleer het adres.' }, 400)
  const db = createDb(c.env)
  if (parsed.data.isDefaultShipping) {
    await db
      .update(addresses)
      .set({ isDefaultShipping: false })
      .where(eq(addresses.userId, session.user.id))
  }
  if (parsed.data.isDefaultBilling) {
    await db
      .update(addresses)
      .set({ isDefaultBilling: false })
      .where(eq(addresses.userId, session.user.id))
  }
  const id = newId()
  await db.insert(addresses).values({
    id,
    userId: session.user.id,
    ...parsed.data,
    companyName: parsed.data.companyName ?? null,
    addition: parsed.data.addition ?? null,
    phone: parsed.data.phone ?? null,
    label: parsed.data.label ?? null,
    isDefaultShipping: parsed.data.isDefaultShipping ?? false,
    isDefaultBilling: parsed.data.isDefaultBilling ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return c.json({ ok: true, id })
})

accountRoutes.patch('/addresses/:id', async (c) => {
  const { session, response } = await requireSession(c)
  if (!session) return response
  const id = c.req.param('id')
  const parsed = addressSchema.partial().safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: 'Controleer het adres.' }, 400)
  const db = createDb(c.env)
  const existing = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, session.user.id)))
    .limit(1)
  if (!existing[0]) return c.json({ error: 'Adres niet gevonden.' }, 404)
  if (parsed.data.isDefaultShipping) {
    await db
      .update(addresses)
      .set({ isDefaultShipping: false })
      .where(eq(addresses.userId, session.user.id))
  }
  if (parsed.data.isDefaultBilling) {
    await db
      .update(addresses)
      .set({ isDefaultBilling: false })
      .where(eq(addresses.userId, session.user.id))
  }
  await db
    .update(addresses)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(addresses.id, id), eq(addresses.userId, session.user.id)))
  return c.json({ ok: true })
})

accountRoutes.delete('/addresses/:id', async (c) => {
  const { session, response } = await requireSession(c)
  if (!session) return response
  const db = createDb(c.env)
  await db
    .delete(addresses)
    .where(and(eq(addresses.id, c.req.param('id')), eq(addresses.userId, session.user.id)))
  return c.json({ ok: true })
})

accountRoutes.get('/wishlist', async (c) => {
  const { session, response } = await requireSession(c)
  if (!session) return response
  const db = createDb(c.env)
  const items = await db
    .select()
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, session.user.id))
    .orderBy(desc(wishlistItems.createdAt))
  return c.json({ items })
})

accountRoutes.post('/wishlist', async (c) => {
  const { session, response } = await requireSession(c)
  if (!session) return response
  const body = (await c.req.json()) as { productSlug?: string }
  const slug = body.productSlug?.trim()
  if (!slug) return c.json({ error: 'Product ontbreekt.' }, 400)
  const db = createDb(c.env)
  await db
    .insert(wishlistItems)
    .values({
      id: newId(),
      userId: session.user.id,
      productSlug: slug,
      createdAt: new Date(),
    })
    .onConflictDoNothing()
  return c.json({ ok: true })
})

accountRoutes.delete('/wishlist/:slug', async (c) => {
  const { session, response } = await requireSession(c)
  if (!session) return response
  const db = createDb(c.env)
  await db
    .delete(wishlistItems)
    .where(
      and(
        eq(wishlistItems.userId, session.user.id),
        eq(wishlistItems.productSlug, c.req.param('slug')),
      ),
    )
  return c.json({ ok: true })
})

accountRoutes.get('/orders', async (c) => {
  const { session, response } = await requireSession(c)
  if (!session) return response
  const db = createDb(c.env)
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.placedAt))
  const items = await db.select().from(orderItems)
  const itemCountByOrder = new Map<string, number>()
  for (const item of items) {
    itemCountByOrder.set(item.orderId, (itemCountByOrder.get(item.orderId) ?? 0) + item.quantity)
  }
  return c.json({
    orders: rows.map((order) => ({
      orderNumber: order.orderNumber,
      placedAt: order.placedAt,
      totalCents: order.totalCents,
      currency: order.currency,
      status: order.status,
      statusLabel: isOrderStatus(order.status) ? ORDER_STATUS_LABELS[order.status] : order.status,
      itemCount: itemCountByOrder.get(order.id) ?? 0,
    })),
  })
})

accountRoutes.get('/orders/:orderNumber', async (c) => {
  const { session, response } = await requireSession(c)
  if (!session) return response
  const detail = await loadOrderDetail(c.env, c.req.param('orderNumber'), session.user.id, null)
  if (!detail) return c.json({ error: 'Bestelling niet gevonden.' }, 404)
  return c.json(detail)
})

export async function loadOrderDetail(
  env: AppEnv['Bindings'],
  orderNumber: string,
  userId: string | null,
  guestEmail: string | null,
) {
  const db = createDb(env)
  const found = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1)
  const order = found[0]
  if (!order) return null
  if (userId && order.userId !== userId) return null
  if (guestEmail && order.guestEmail.trim().toLowerCase() !== guestEmail.trim().toLowerCase()) {
    return null
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  const shipmentRows = await db.select().from(shipments).where(eq(shipments.orderId, order.id))
  const links = await db.select().from(shipmentItems)

  return {
    orderNumber: order.orderNumber,
    placedAt: order.placedAt,
    status: order.status,
    statusLabel: isOrderStatus(order.status) ? ORDER_STATUS_LABELS[order.status] : order.status,
    paymentMethod: order.paymentMethod,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    vatCents: order.vatCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    billing: JSON.parse(order.billingSnapshot) as Record<string, string>,
    shipping: JSON.parse(order.shippingSnapshot) as Record<string, string>,
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      vatRate: item.vatRate,
    })),
    shipments: shipmentRows.map((shipment, index) => ({
      id: shipment.id,
      label: shipment.publicLabel || `Zending ${index + 1}`,
      status: shipment.status,
      statusLabel: isShipmentStatus(shipment.status)
        ? SHIPMENT_STATUS_LABELS[shipment.status]
        : shipment.status,
      supplierName: shipment.showSupplierToCustomer ? shipment.supplierPublicName : null,
      carrier: shipment.carrier,
      trackingCode: shipment.trackingCode,
      trackingUrl: shipment.trackingUrl,
      shippedAt: shipment.shippedAt,
      deliveredAt: shipment.deliveredAt,
      items: links
        .filter((link) => link.shipmentId === shipment.id)
        .map((link) => {
          const item = items.find((row) => row.id === link.orderItemId)
          return {
            name: item?.name ?? 'Artikel',
            quantity: link.quantity,
          }
        }),
    })),
  }
}
