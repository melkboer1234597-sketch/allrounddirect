import { drizzle } from 'drizzle-orm/d1'
import type { AppEnv } from '../types'
import * as schema from './schema'

export function createDb(env: AppEnv['Bindings']) {
  return drizzle(env.DB, { schema })
}

export type Database = ReturnType<typeof createDb>
