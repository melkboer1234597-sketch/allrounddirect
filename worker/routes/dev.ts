import { Hono } from 'hono'
import { getLatestDevEmail } from '../services/email'
import { isDevelopment, isLocalHost } from '../lib/request'
import { setDevMollieStatus } from '../services/mollie'
import { placePendingOrder } from '../services/checkout'
import { syncProviderPayment } from '../services/payment-sync'
import { ingestCatalogPayload } from '../services/r2-catalog-import'
import type { AppEnv } from '../types'

export const devRoutes = new Hono<AppEnv>()

function guardDev(c: { env: AppEnv['Bindings']; req: { raw: Request } }) {
  return isDevelopment(c.env) && isLocalHost(c.req.raw)
}

devRoutes.get('/emails', async (c) => {
  if (!guardDev(c)) return c.json({ error: 'Not found' }, 404)
  const to = c.req.query('to')
  if (!to) return c.json({ error: 'E-mailadres ontbreekt.' }, 400)
  const row = await getLatestDevEmail(c.env, to)
  if (!row) return c.json({ email: null })
  return c.json({
    email: {
      subject: row.subject,
      type: row.type,
      actionUrl: row.actionUrl,
      createdAt: row.createdAt,
    },
  })
})

/** Development-fixture: pending order + mock Mollie, geen live betaling. */
devRoutes.post('/orders/fixture', async (c) => {
  if (!guardDev(c)) return c.json({ error: 'Not found' }, 404)
  const result = await placePendingOrder(c.env, {
    email: 'fixture@localhost',
    customerType: 'consumer',
    billing: {
      firstName: 'Test',
      lastName: 'Consument',
      street: 'Voorbeeldstraat',
      houseNumber: '1',
      postalCode: '1234 AB',
      city: 'Amsterdam',
      country: 'NL',
    },
    shipping: {
      firstName: 'Test',
      lastName: 'Consument',
      street: 'Voorbeeldstraat',
      houseNumber: '1',
      postalCode: '1234 AB',
      city: 'Amsterdam',
      country: 'NL',
    },
    lines: [{ slug: 'fixture-dev', quantity: 1 }],
    paymentMethod: 'ideal',
    idempotencyKey: `fixture-${Date.now()}`,
  })
  return c.json(result)
})

/** Simuleer Mollie webhook/status (twee keer aanroepen moet idempotent zijn). */
devRoutes.post('/payments/:id/settle', async (c) => {
  if (!guardDev(c)) return c.json({ error: 'Not found' }, 404)
  const id = c.req.param('id')
  await setDevMollieStatus(c.env, id, 'paid')
  const first = await syncProviderPayment(c.env, id)
  const second = await syncProviderPayment(c.env, id)
  return c.json({ first, second, idempotent: second.duplicate === true })
})

devRoutes.post('/catalog-ingest', async (c) => {
  if (!guardDev(c)) return c.json({ error: 'Not found' }, 404)
  let last: Awaited<ReturnType<typeof ingestCatalogPayload>> | null = null
  for (let i = 0; i < 2; i += 1) {
    last = await ingestCatalogPayload(c.env)
    if (!last.ok || last.done) break
  }
  return c.json(last)
})
