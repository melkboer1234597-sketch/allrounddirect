import { and, eq, gt, lt, sql } from 'drizzle-orm'
import { authKv, rateLimitHits } from '../db/schema'
import type { Database } from '../db'

type LimitResult = { ok: true } | { ok: false; retryAfterSec: number }

export async function enforceRateLimit(
  db: Database,
  bucket: string,
  max: number,
  windowMs: number,
): Promise<LimitResult> {
  const now = Date.now()
  const windowStart = now - windowMs

  await db.delete(rateLimitHits).where(lt(rateLimitHits.createdAt, new Date(windowStart)))

  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(rateLimitHits)
    .where(
      and(eq(rateLimitHits.bucket, bucket), gt(rateLimitHits.createdAt, new Date(windowStart))),
    )

  const count = Number(rows[0]?.count ?? 0)
  if (count >= max) {
    return { ok: false, retryAfterSec: Math.ceil(windowMs / 1000) }
  }

  await db.insert(rateLimitHits).values({
    bucket,
    createdAt: new Date(now),
  })

  return { ok: true }
}

export async function kvGet(db: Database, key: string): Promise<string | null> {
  const now = new Date()
  const rows = await db.select().from(authKv).where(eq(authKv.key, key)).limit(1)
  const row = rows[0]
  if (!row) return null
  if (row.expiresAt.getTime() <= now.getTime()) {
    await db.delete(authKv).where(eq(authKv.key, key))
    return null
  }
  return row.value
}

export async function kvSet(
  db: Database,
  key: string,
  value: string,
  ttlMs: number,
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlMs)
  await db.insert(authKv).values({ key, value, expiresAt }).onConflictDoUpdate({
    target: authKv.key,
    set: { value, expiresAt },
  })
}

export async function kvDelete(db: Database, key: string): Promise<void> {
  await db.delete(authKv).where(eq(authKv.key, key))
}

export async function incrementFailedLogins(db: Database, key: string): Promise<number> {
  const current = Number((await kvGet(db, key)) ?? '0')
  const next = current + 1
  await kvSet(db, key, String(next), 15 * 60 * 1000)
  return next
}
