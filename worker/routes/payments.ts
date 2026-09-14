import { Hono } from 'hono'
import { syncProviderPayment } from '../services/payment-sync'
import type { AppEnv } from '../types'

export const paymentRoutes = new Hono<AppEnv>()

/**
 * Mollie webhook. De browser-redirect is niet leidend.
 * We lezen het payment-id en verifiëren de actuele status bij Mollie (of de testmock).
 */
paymentRoutes.post('/mollie/webhook', async (c) => {
  const contentType = c.req.header('content-type') ?? ''
  let providerId = ''
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const form = await c.req.parseBody()
    providerId = typeof form.id === 'string' ? form.id : ''
  } else {
    try {
      const json = (await c.req.json()) as { id?: string }
      providerId = json.id ?? ''
    } catch {
      const text = await c.req.text()
      const match = text.match(/(?:^|&)id=([^&]+)/)
      providerId = match ? decodeURIComponent(match[1]) : ''
    }
  }
  if (!providerId.startsWith('tr_')) {
    return c.json({ error: 'Ongeldige webhook.' }, 400)
  }
  try {
    await syncProviderPayment(c.env, providerId)
  } catch {
    console.error('[mollie-webhook] verwerking mislukt')
    return c.json({ error: 'Webhook kon niet worden verwerkt.' }, 500)
  }
  return c.body(null, 200)
})
