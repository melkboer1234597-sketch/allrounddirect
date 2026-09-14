import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '../types'

export const errorHandler: MiddlewareHandler<AppEnv> = async (c, next) => {
  try {
    await next()
  } catch (error) {
    console.error('[worker]', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}
