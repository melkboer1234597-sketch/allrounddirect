import type { AppEnv } from '../types'

export function isDevelopment(env: AppEnv['Bindings']): boolean {
  return (env.ENVIRONMENT ?? 'development') !== 'production'
}

export function getSiteOrigin(env: AppEnv['Bindings']): string {
  const fromPublic = env.PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (fromPublic) return fromPublic
  const fromSite = env.SITE_URL?.replace(/\/$/, '')
  if (fromSite) return fromSite
  const fromAuth = env.BETTER_AUTH_URL?.replace(/\/$/, '')
  if (fromAuth) return fromAuth
  return 'http://localhost:5173'
}

export function getTrustedOrigins(env: AppEnv['Bindings']): string[] {
  const origin = getSiteOrigin(env)
  const extra = [
    origin,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5176',
    'http://localhost:8787',
    'http://127.0.0.1:8787',
  ]
  return [...new Set(extra)]
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

export function newId(): string {
  return crypto.randomUUID()
}

export async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase())
  const hash = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function redactEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***'
  const prefix = local.slice(0, 2)
  return `${prefix}***@${domain}`
}

export function isLocalHost(request: Request): boolean {
  const host = new URL(request.url).hostname
  return host === 'localhost' || host === '127.0.0.1'
}
