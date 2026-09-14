import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

let db: DatabaseSync | null = null

export function openLocalD1(root = process.cwd()) {
  if (db) return db
  const dir = path.join(root, '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject')
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.sqlite') && name !== 'metadata.sqlite' && !name.includes('-shm') && !name.includes('-wal'))
    .map((name) => {
      const abs = path.join(dir, name)
      return { abs, mtime: statSync(abs).mtimeMs }
    })
    .sort((a, b) => b.mtime - a.mtime)
  if (!files[0]) throw new Error('Lokale D1 sqlite niet gevonden. Run eerst: npm run db:migrate:local')
  db = new DatabaseSync(files[0].abs)
  return db
}

export function localQuery<T>(sql: string, params: unknown[] = []): T[] {
  const database = openLocalD1()
  const stmt = database.prepare(sql)
  return stmt.all(...(params as never[])) as T[]
}

export function localRun(sql: string, params: unknown[] = []) {
  const database = openLocalD1()
  database.prepare(sql).run(...(params as never[]))
}
