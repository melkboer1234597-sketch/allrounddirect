import type { AppEnv } from '../types'
import { isDevelopment } from './request'

export type TurnstileResult = { ok: true } | { ok: false; error: string }

/**
 * Cloudflare Turnstile Siteverify (server-side verplicht).
 * Development fallback alleen als ENVIRONMENT !== production én secret ontbreekt.
 */
export async function verifyTurnstile(
  env: AppEnv['Bindings'],
  token: string | null | undefined,
  ip: string,
): Promise<TurnstileResult> {
  const secret = env.TURNSTILE_SECRET?.trim()

  if (!secret) {
    if (isDevelopment(env)) {
      console.warn(
        '[turnstile] DEVELOPMENT FALLBACK: TURNSTILE_SECRET ontbreekt. Siteverify is overgeslagen. Niet gebruiken in productie.',
      )
      return { ok: true }
    }
    return { ok: false, error: 'Beveiligingscontrole is niet geconfigureerd.' }
  }

  if (!token) {
    return { ok: false, error: 'Bevestig dat u geen robot bent.' }
  }

  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', token)
  if (ip && ip !== 'unknown') body.set('remoteip', ip)

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) {
    return { ok: false, error: 'Beveiligingscontrole mislukt. Probeer het later opnieuw.' }
  }

  const data = (await response.json()) as { success?: boolean }
  if (!data.success) {
    return { ok: false, error: 'Beveiligingscontrole mislukt. Probeer het opnieuw.' }
  }

  return { ok: true }
}

export function turnstileTokenFromRequest(request: Request, bodyToken?: unknown): string | null {
  const header = request.headers.get('x-turnstile-token')
  if (header) return header
  if (typeof bodyToken === 'string' && bodyToken.length > 0) return bodyToken
  return null
}
