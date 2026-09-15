import type { Context } from 'hono'
import { createAuth } from '../auth/create-auth'
import type { AppEnv } from '../types'

export async function getSession(c: Context<AppEnv>) {
  if (!c.env.BETTER_AUTH_SECRET?.trim()) {
    return null
  }
  try {
    const auth = createAuth(c.env)
    return await auth.api.getSession({ headers: c.req.raw.headers })
  } catch (error) {
    console.error('[auth] getSession failed', {
      message: error instanceof Error ? error.message.slice(0, 200) : 'unknown',
    })
    return null
  }
}

export async function requireSession(c: Context<AppEnv>) {
  const session = await getSession(c)
  if (!session) {
    return { session: null as null, response: c.json({ error: 'Niet ingelogd.' }, 401) }
  }
  return { session, response: null as null }
}
