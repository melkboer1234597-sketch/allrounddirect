import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { createDb } from '../db'
import { orders, payments } from '../db/schema'
import { enforceRateLimit } from '../lib/rate-limit'
import { getClientIp } from '../lib/request'
import { MollieConfigError } from '../services/mollie'
import { placePendingOrder } from '../services/checkout'
import { syncProviderPayment } from '../services/payment-sync'
import type { AppEnv } from '../types'

export const checkoutRoutes = new Hono<AppEnv>()

const address = z.object({
  name: z.string().trim().min(2).max(120),
  street: z.string().trim().min(1).max(120),
  houseNumber: z.string().trim().min(1).max(20),
  postalCode: z.string().trim().min(4).max(12),
  city: z.string().trim().min(1).max(80),
  country: z.string().trim().min(2).max(2).default('NL'),
  company: z.string().trim().max(120).optional(),
})

const placeSchema = z.object({
  email: z.string().trim().email(),
  customerType: z.enum(['consumer', 'business']).default('consumer'),
  billing: address,
  shipping: address,
  lines: z
    .array(
      z.object({
        productId: z.string().optional(),
        slug: z.string().optional(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
  shippingCents: z.number().int().min(0).max(1_000_000).optional(),
})

checkoutRoutes.post('/place', async (c) => {
  const ip = getClientIp(c.req.raw)
  const db = createDb(c.env)
  const limited = await enforceRateLimit(db, `checkout:${ip}`, 8, 15 * 60 * 1000)
  if (!limited.ok) return c.json({ error: 'Te veel verzoeken. Probeer het later opnieuw.' }, 429)

  const parsed = placeSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: 'Controleer de bestelgegevens.' }, 400)

  try {
    const result = await placePendingOrder(c.env, {
      ...parsed.data,
      userId: null,
    })
    return c.json({
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      confirmationToken: result.confirmationToken,
      checkoutUrl: result.checkoutUrl,
      mockPayment: result.mock,
      mode: result.mode,
    })
  } catch (error) {
    if (error instanceof MollieConfigError) {
      return c.json({ error: error.message }, 503)
    }
    const message = error instanceof Error ? error.message : 'Bestelling kon niet worden gestart.'
    return c.json({ error: message }, 400)
  }
})

checkoutRoutes.get('/status', async (c) => {
  const orderNumber = c.req.query('order')
  const token = c.req.query('token')
  if (!orderNumber || !token) return c.json({ error: 'Onvolledige aanvraag.' }, 400)
  const db = createDb(c.env)
  const order = (
    await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1)
  )[0]
  if (!order || order.confirmationToken !== token) {
    return c.json({ error: 'Bestelling niet gevonden.' }, 404)
  }
  const payment = (
    await db.select().from(payments).where(eq(payments.orderId, order.id)).limit(1)
  )[0]
  if (payment) {
    try {
      await syncProviderPayment(c.env, payment.providerPaymentId)
    } catch {
      /* status blijft de laatst bekende serverstatus */
    }
  }
  const fresh = (await db.select().from(orders).where(eq(orders.id, order.id)).limit(1))[0]
  return c.json({
    orderNumber: fresh?.orderNumber,
    status: fresh?.status,
    paymentStatus: fresh?.paymentStatus,
    totalCents: fresh?.totalCents,
    currency: fresh?.currency,
  })
})
