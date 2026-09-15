import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppEnv } from './types'
import { healthRoutes } from './routes/health'
import { seoRoutes } from './routes/seo'
import { accountRoutes } from './routes/account'
import { guestOrderRoutes } from './routes/guest-orders'
import { withdrawalRoutes } from './routes/withdrawals'
import { contactRoutes } from './routes/contact'
import { checkoutRoutes } from './routes/checkout'
import { paymentRoutes } from './routes/payments'
import { devRoutes } from './routes/dev'
import { adminRoutes } from './routes/admin'
import { catalogRoutes } from './routes/catalog'
import { mediaRoutes } from './routes/media'
import { errorHandler } from './middleware/error'
import { createAuth } from './auth/create-auth'
import { guardAuthRequest, recordLoginFailure } from './lib/auth-guards'
import { getSiteOrigin, getTrustedOrigins } from './lib/request'

const app = new Hono<AppEnv>()

app.use('*', errorHandler)

app.use('/api/*', async (c, next) => {
  const origin = c.req.header('origin')
  const allowed = new Set(getTrustedOrigins(c.env))
  const corsMiddleware = cors({
    origin: origin && allowed.has(origin) ? origin : getSiteOrigin(c.env),
    credentials: true,
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'x-turnstile-token',
      'x-terms-accepted',
      'x-admin-intent',
      'x-admin-login',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
  return corsMiddleware(c, next)
})

app.route('/api/health', healthRoutes)
app.route('/api/account', accountRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api', catalogRoutes)
app.route('/media', mediaRoutes)
app.route('/api/guest-orders', guestOrderRoutes)
app.route('/api/withdrawals', withdrawalRoutes)
app.route('/api/contact', contactRoutes)
app.route('/api/checkout', checkoutRoutes)
app.route('/api/payments', paymentRoutes)
app.route('/api/dev', devRoutes)

app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
  const blocked = await guardAuthRequest(c)
  if (blocked) return blocked

  const clone = c.req.raw.clone()
  let email = ''
  try {
    const body = (await clone.json()) as { email?: string }
    email = body.email ?? ''
  } catch {
    email = ''
  }

  const auth = createAuth(c.env)
  const response = await auth.handler(c.req.raw)

  const path = new URL(c.req.url).pathname.replace(/\/+$/, '')
  if (
    c.req.method === 'POST' &&
    path.endsWith('/sign-in/email') &&
    response.status >= 400 &&
    email
  ) {
    await recordLoginFailure(c, email)
  }

  if (
    c.req.method === 'POST' &&
    (path.endsWith('/request-password-reset') || path.endsWith('/forget-password')) &&
    response.status < 500
  ) {
    return c.json({
      status: true,
      message: 'Als dit e-mailadres bij ons bekend is, ontvangt u instructies.',
    })
  }

  return response
})

app.route('/', seoRoutes)

app.notFound((c) => c.json({ error: 'Not found' }, 404))

const CANONICAL_HOST = 'allrounddirect.com'
const WWW_HOST = 'www.allrounddirect.com'

function shouldPassToAssets(pathname: string): boolean {
  if (pathname.startsWith('/api')) return false
  if (pathname.startsWith('/media/products')) return false
  if (pathname === '/sitemap.xml' || pathname.startsWith('/sitemap-')) return false
  if (pathname === '/robots.txt') return false
  return true
}

export default {
  async fetch(request: Request, env: AppEnv['Bindings'], ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // Canonical: www → apex (preserve path + query). Mollie webhooks use apex only.
    if (url.hostname === WWW_HOST) {
      url.hostname = CANONICAL_HOST
      return Response.redirect(url.toString(), 308)
    }

    const response = await app.fetch(request, env, ctx)

    // With run_worker_first, SPA/static routes fall through to Assets after Hono 404.
    if (response.status === 404 && env.ASSETS && shouldPassToAssets(url.pathname)) {
      return env.ASSETS.fetch(request)
    }

    return response
  },
}
