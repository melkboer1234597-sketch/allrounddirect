import { eq } from 'drizzle-orm'
import { formatOrderNumber } from '../../shared/order-numbers'
import { createDb } from '../db'
import { orderNumberCounters } from '../db/schema'
import type { AppEnv } from '../types'

export async function nextOrderNumber(env: AppEnv['Bindings']): Promise<string> {
  const year = new Date().getUTCFullYear()
  const db = createDb(env)
  const existing = await db
    .select()
    .from(orderNumberCounters)
    .where(eq(orderNumberCounters.year, year))
    .limit(1)
  const next = (existing[0]?.lastValue ?? 0) + 1
  if (existing[0]) {
    await db
      .update(orderNumberCounters)
      .set({ lastValue: next })
      .where(eq(orderNumberCounters.year, year))
  } else {
    await db.insert(orderNumberCounters).values({ year, lastValue: next })
  }
  return formatOrderNumber(year, next)
}
