import type { Context } from 'hono'
import { createAuth } from '../auth/create-auth'
import type { AppEnv } from '../types'

export async function getSession(c: Context<AppEnv>) {
  const auth = createAuth(c.env)
  return auth.api.getSession({ headers: c.req.raw.headers })
}

export async function requireSession(c: Context<AppEnv>) {
  const session = await getSession(c)
  if (!session) {
    return { session: null as null, response: c.json({ error: 'Niet ingelogd.' }, 401) }
  }
  return { session, response: null as null }
}
