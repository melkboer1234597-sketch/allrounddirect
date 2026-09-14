import type { Context } from 'hono'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { createDb } from '../db'
import { orderItems, orders, withdrawalItems, withdrawalRequests } from '../db/schema'
import { enforceRateLimit } from '../lib/rate-limit'
import { getClientIp, newId, sha256Hex } from '../lib/request'
import { turnstileTokenFromRequest, verifyTurnstile } from '../lib/turnstile'
import { createEmailService } from '../services/email'
import type { AppEnv } from '../types'
import { loadOrderDetail } from './account'

export const withdrawalRoutes = new Hono<AppEnv>()

const lookupSchema = z.object({
  orderNumber: z.string().trim().min(4).max(40),
  email: z.string().trim().email(),
  turnstileToken: z.string().optional(),
})

const confirmSchema = lookupSchema.extend({
  itemIds: z.array(z.string().min(1).max(80)).max(100).optional(),
  fullContract: z.boolean(),
  customerNote: z.string().trim().max(2000).optional(),
})

const GENERIC = 'We kunnen deze combinatie van ordernummer en e-mailadres niet vinden.'

async function protectForm(
  c: Context<AppEnv>,
  email: string | undefined,
  turnstileToken: string | undefined,
) {
  const db = createDb(c.env)
  const ip = getClientIp(c.req.raw)
  const emailHash = email ? await sha256Hex(email) : 'invalid'
  const limited = await enforceRateLimit(db, `withdrawal:${ip}:${emailHash}`, 5, 15 * 60 * 1000)
  if (!limited.ok) {
    return c.json({ error: 'Te veel verzoeken. Probeer het later opnieuw.' }, 429)
  }
  const token = turnstileTokenFromRequest(c.req.raw, turnstileToken)
  const turnstile = await verifyTurnstile(c.env, token, ip)
  if (!turnstile.ok) return c.json({ error: turnstile.error }, 400)
  return null
}

function makeConfirmationCode(): string {
  const day = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const bytes = crypto.getRandomValues(new Uint8Array(3))
  const tail = [...bytes]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 6)
  return `WR-${day}-${tail.toUpperCase()}`
}

withdrawalRoutes.post('/lookup', async (c) => {
  const parsed = lookupSchema.safeParse(await c.req.json())
  const blocked = await protectForm(
    c,
    parsed.success ? parsed.data.email : undefined,
    parsed.success ? parsed.data.turnstileToken : undefined,
  )
  if (blocked) return blocked
  if (!parsed.success) return c.json({ error: GENERIC }, 404)

  const data = parsed.data
  const detail = await loadOrderDetail(c.env, data.orderNumber, null, data.email)
  if (!detail) return c.json({ error: GENERIC }, 404)

  const db = createDb(c.env)
  const previous = await db
    .select()
    .from(withdrawalRequests)
    .where(eq(withdrawalRequests.orderNumber, detail.orderNumber))

  return c.json({
    order: detail,
    previousWithdrawals: previous.map((row) => ({
      confirmationCode: row.confirmationCode,
      recordedAt: row.recordedAt,
      scope: row.scope,
      status: row.status,
    })),
    notices: [
      'Herroepingsrecht geldt in beginsel voor consumenten, binnen de wettelijke termijn en met wettelijke uitzonderingen.',
      'Of u als consument of als ondernemer koopt, hangt af van de feitelijke situatie, niet van één vinkje in de webshop.',
      'Na ontvangst van dit verzoek beoordelen we de bestelling. Uitzonderingen (bijvoorbeeld maatwerk of verzegelde hygiëneproducten) worden niet automatisch aangenomen zonder toetsing.',
    ],
  })
})

withdrawalRoutes.post('/confirm', async (c) => {
  const parsed = confirmSchema.safeParse(await c.req.json())
  const blocked = await protectForm(
    c,
    parsed.success ? parsed.data.email : undefined,
    parsed.success ? parsed.data.turnstileToken : undefined,
  )
  if (blocked) return blocked
  if (!parsed.success) return c.json({ error: GENERIC }, 404)
  const data = parsed.data

  const db = createDb(c.env)
  const detail = await loadOrderDetail(c.env, data.orderNumber, null, data.email)
  if (!detail) return c.json({ error: GENERIC }, 404)

  const orderRows = (
    await db.select().from(orders).where(eq(orders.orderNumber, detail.orderNumber)).limit(1)
  )[0]
  if (!orderRows) return c.json({ error: GENERIC }, 404)

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderRows.id))
  const selected = data.fullContract
    ? items
    : items.filter((item) => (data.itemIds ?? []).includes(item.id))

  if (selected.length === 0) {
    return c.json({ error: 'Selecteer de hele overeenkomst of minstens één artikel.' }, 400)
  }

  const recordedAt = new Date()
  const confirmationCode = makeConfirmationCode()
  const withdrawalId = newId()
  const scope = data.fullContract || selected.length === items.length ? 'full' : 'items'

  await db.insert(withdrawalRequests).values({
    id: withdrawalId,
    orderId: orderRows.id,
    orderNumber: detail.orderNumber,
    email: data.email.trim().toLowerCase(),
    scope,
    status: 'received',
    customerNote: data.customerNote?.trim() || null,
    confirmationCode,
    recordedAt,
    createdAt: recordedAt,
  })

  await db.insert(withdrawalItems).values(
    selected.map((item) => ({
      id: newId(),
      withdrawalId,
      orderItemId: item.id,
      name: item.name,
      quantity: item.quantity,
    })),
  )

  const itemsLabel = selected.map((item) => `${item.name} × ${item.quantity}`).join(', ')
  const recordedAtLabel = new Intl.DateTimeFormat('nl-NL', {
    dateStyle: 'long',
    timeStyle: 'medium',
  }).format(recordedAt)

  try {
    await createEmailService(c.env).send({
      template: 'withdrawal_confirmation',
      to: data.email,
      data: {
        confirmationCode,
        orderNumber: detail.orderNumber,
        recordedAtLabel,
        itemsLabel,
      },
      related: { type: 'withdrawal', id: withdrawalId },
    })
  } catch (error) {
    console.error('[withdrawal] bevestigingsmail niet verzonden', error)
  }

  return c.json({
    confirmationCode,
    recordedAt: recordedAt.toISOString(),
    recordedAtLabel,
    scope,
    status: 'received',
    orderNumber: detail.orderNumber,
    items: selected.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
    })),
    emailQueued: true,
  })
})
