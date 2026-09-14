import { Hono } from 'hono'
import { z } from 'zod'
import { createDb } from '../db'
import { loadOrderDetail } from './account'
import { enforceRateLimit } from '../lib/rate-limit'
import { getClientIp, sha256Hex } from '../lib/request'
import { turnstileTokenFromRequest, verifyTurnstile } from '../lib/turnstile'
import type { AppEnv } from '../types'

export const guestOrderRoutes = new Hono<AppEnv>()

const lookupSchema = z.object({
  orderNumber: z.string().trim().min(4).max(40),
  email: z.string().trim().email(),
  turnstileToken: z.string().optional(),
})

const GENERIC = 'We kunnen deze combinatie van ordernummer en e-mailadres niet vinden.'

guestOrderRoutes.post('/lookup', async (c) => {
  const db = createDb(c.env)
  const ip = getClientIp(c.req.raw)
  const parsed = lookupSchema.safeParse(await c.req.json())
  const emailHash = parsed.success ? await sha256Hex(parsed.data.email) : 'invalid'
  const limited = await enforceRateLimit(db, `guest-lookup:${ip}:${emailHash}`, 5, 15 * 60 * 1000)
  if (!limited.ok) {
    return c.json({ error: 'Te veel verzoeken. Probeer het later opnieuw.' }, 429)
  }

  const token = parsed.success
    ? turnstileTokenFromRequest(c.req.raw, parsed.data.turnstileToken)
    : null
  const turnstile = await verifyTurnstile(c.env, token, ip)
  if (!turnstile.ok) return c.json({ error: turnstile.error }, 400)

  if (!parsed.success) return c.json({ error: GENERIC }, 404)

  const detail = await loadOrderDetail(c.env, parsed.data.orderNumber, null, parsed.data.email)
  if (!detail) return c.json({ error: GENERIC }, 404)
  return c.json(detail)
})

/** Secure guest access via order number + confirmation token (non-guessable). */
guestOrderRoutes.get('/access', async (c) => {
  const orderNumber = c.req.query('order')?.trim()
  const token = c.req.query('token')?.trim()
  if (!orderNumber || !token || token.length < 8) {
    return c.json({ error: 'Onvolledige toegangslink.' }, 400)
  }

  const db = createDb(c.env)
  const ip = getClientIp(c.req.raw)
  const tokenHash = await sha256Hex(token)
  const limited = await enforceRateLimit(db, `guest-access:${ip}:${tokenHash}`, 30, 15 * 60 * 1000)
  if (!limited.ok) {
    return c.json({ error: 'Te veel verzoeken. Probeer het later opnieuw.' }, 429)
  }

  const detail = await loadOrderDetail(c.env, orderNumber, null, null, token)
  if (!detail) return c.json({ error: 'Bestelling niet gevonden.' }, 404)
  return c.json(detail)
})
