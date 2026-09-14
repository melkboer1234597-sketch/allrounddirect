import type { Context } from 'hono'
import { createDb } from '../db'
import { enforceRateLimit, incrementFailedLogins, kvGet } from './rate-limit'
import { getClientIp, sha256Hex } from './request'
import { turnstileTokenFromRequest, verifyTurnstile } from './turnstile'
import type { AppEnv } from '../types'

const GENERIC_RESET = 'Als dit e-mailadres bij ons bekend is, ontvangt u instructies.'

function authPath(url: string): string {
  return new URL(url).pathname.replace(/\/+$/, '')
}

export async function guardAuthRequest(c: Context<AppEnv>): Promise<Response | null> {
  if (c.req.method !== 'POST') return null

  const path = authPath(c.req.url)
  const db = createDb(c.env)
  const ip = getClientIp(c.req.raw)
  const clone = c.req.raw.clone()
  let body: Record<string, unknown> = {}
  try {
    body = (await clone.json()) as Record<string, unknown>
  } catch {
    body = {}
  }

  const email = typeof body.email === 'string' ? body.email : ''
  const emailHash = email ? await sha256Hex(email) : 'none'
  const token = turnstileTokenFromRequest(c.req.raw, body.turnstileToken)

  if (path.endsWith('/sign-up/email')) {
    if (!c.req.header('x-terms-accepted') && body.termsAccepted !== true) {
      return c.json({ error: 'Ga akkoord met de algemene voorwaarden en privacyverklaring.' }, 400)
    }
    const limited = await enforceRateLimit(db, `register:${ip}`, 5, 60 * 60 * 1000)
    if (!limited.ok) {
      return c.json({ error: 'Te veel pogingen. Probeer het later opnieuw.' }, 429)
    }
    const turnstile = await verifyTurnstile(c.env, token, ip)
    if (!turnstile.ok) return c.json({ error: turnstile.error }, 400)
    return null
  }

  if (path.endsWith('/sign-in/email')) {
    const limited = await enforceRateLimit(db, `login:${ip}:${emailHash}`, 8, 15 * 60 * 1000)
    if (!limited.ok) {
      return c.json({ error: 'Aanmelden is niet gelukt. Probeer het later opnieuw.' }, 429)
    }
    if (c.req.header('x-admin-login') === '1') {
      const adminLimited = await enforceRateLimit(db, `admin-login:${ip}`, 8, 15 * 60 * 1000)
      if (!adminLimited.ok) {
        return c.json({ error: 'Aanmelden is niet gelukt. Probeer het later opnieuw.' }, 429)
      }
      const turnstile = await verifyTurnstile(c.env, token, ip)
      if (!turnstile.ok) {
        return c.json({ error: 'Aanmelden is niet gelukt.' }, 400)
      }
    }
    const failures = Number((await kvGet(db, `fail-login:${ip}:${emailHash}`)) ?? '0')
    if (failures >= 2) {
      const turnstile = await verifyTurnstile(c.env, token, ip)
      if (!turnstile.ok) return c.json({ error: turnstile.error, turnstileRequired: true }, 400)
    }
    return null
  }

  if (path.endsWith('/request-password-reset') || path.endsWith('/forget-password')) {
    const limitedIp = await enforceRateLimit(db, `reset-ip:${ip}`, 5, 60 * 60 * 1000)
    const limitedEmail = await enforceRateLimit(db, `reset-email:${emailHash}`, 3, 60 * 60 * 1000)
    if (!limitedIp.ok || !limitedEmail.ok) {
      return c.json({ message: GENERIC_RESET, status: true })
    }
    const turnstile = await verifyTurnstile(c.env, token, ip)
    if (!turnstile.ok) {
      return c.json({ message: GENERIC_RESET, status: true })
    }
    return null
  }

  return null
}

export async function recordLoginFailure(c: Context<AppEnv>, email: string) {
  const db = createDb(c.env)
  const ip = getClientIp(c.req.raw)
  const emailHash = await sha256Hex(email)
  return incrementFailedLogins(db, `fail-login:${ip}:${emailHash}`)
}
