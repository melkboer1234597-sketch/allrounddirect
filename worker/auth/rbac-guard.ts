import type { Context, Next } from 'hono'
import { eq } from 'drizzle-orm'
import { createDb } from '../db'
import { user } from '../db/schema'
import { getSession } from './session'
import { getTrustedOrigins } from '../lib/request'
import { hasPermission, type Permission } from '../../shared/rbac'
import type { AppEnv } from '../types'

export type StaffContext = {
  userId: string
  email: string
  role: string
}

export async function requireStaff(
  c: Context<AppEnv>,
  permission: Permission = 'admin.access',
): Promise<{ staff: StaffContext; response: null } | { staff: null; response: Response }> {
  const session = await getSession(c)
  if (!session) {
    return { staff: null, response: c.json({ error: 'Niet ingelogd.' }, 401) }
  }

  const db = createDb(c.env)
  const rows = await db
    .select({ id: user.id, email: user.email, role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  const row = rows[0]
  if (!row || !hasPermission(row.role, permission)) {
    return { staff: null, response: c.json({ error: 'Geen toegang.' }, 403) }
  }

  return {
    staff: { userId: row.id, email: row.email, role: row.role },
    response: null,
  }
}

export function staffGuard(permission: Permission = 'admin.access') {
  return async (c: Context<AppEnv>, next: Next) => {
    const { staff, response } = await requireStaff(c, permission)
    if (!staff) return response
    c.set('staff', staff)
    await next()
  }
}

/** CSRF: mutating admin calls moeten van een vertrouwde origin komen plus custom header. */
export async function adminCsrf(c: Context<AppEnv>, next: Next) {
  const method = c.req.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    await next()
    return
  }

  const origin = c.req.header('origin')
  const allowed = new Set(getTrustedOrigins(c.env))
  if (!origin || !allowed.has(origin)) {
    return c.json({ error: 'Ongeldige herkomst.' }, 403)
  }
  if (c.req.header('x-admin-intent') !== '1') {
    return c.json({ error: 'Ongeldige aanvraag.' }, 403)
  }
  await next()
}

declare module 'hono' {
  interface ContextVariableMap {
    staff: StaffContext
  }
}
