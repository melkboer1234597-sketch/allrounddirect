import { Hono } from 'hono'
import { z } from 'zod'
import { createDb } from '../db'
import { contactMessages } from '../db/schema'
import { enforceRateLimit } from '../lib/rate-limit'
import { getClientIp, newId, sha256Hex } from '../lib/request'
import { turnstileTokenFromRequest, verifyTurnstile } from '../lib/turnstile'
import type { AppEnv } from '../types'

export const contactRoutes = new Hono<AppEnv>()

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(4000),
  turnstileToken: z.string().optional(),
})

contactRoutes.post('/', async (c) => {
  const db = createDb(c.env)
  const ip = getClientIp(c.req.raw)
  const parsed = schema.safeParse(await c.req.json())
  const emailHash = parsed.success ? await sha256Hex(parsed.data.email) : 'invalid'
  const limited = await enforceRateLimit(db, `contact:${ip}:${emailHash}`, 5, 15 * 60 * 1000)
  if (!limited.ok) {
    return c.json({ error: 'Te veel berichten. Probeer het later opnieuw.' }, 429)
  }

  const token = parsed.success
    ? turnstileTokenFromRequest(c.req.raw, parsed.data.turnstileToken)
    : null
  const turnstile = await verifyTurnstile(c.env, token, ip)
  if (!turnstile.ok) return c.json({ error: turnstile.error }, 400)
  if (!parsed.success) {
    return c.json({ error: 'Controleer naam, e-mailadres en bericht.' }, 400)
  }

  await db.insert(contactMessages).values({
    id: newId(),
    name: parsed.data.name,
    email: parsed.data.email.trim().toLowerCase(),
    subject: parsed.data.subject,
    body: parsed.data.message,
    createdAt: new Date(),
  })

  return c.json({
    ok: true,
    message:
      'Uw bericht is ontvangen. We nemen contact op via het opgegeven e-mailadres. Een automatische ontvangstbevestiging via e-mail volgt later wanneer Resend is gekoppeld.',
  })
})
