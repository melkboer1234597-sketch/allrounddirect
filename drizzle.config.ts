import { defineConfig } from 'drizzle-kit'

/**
 * Lokale Drizzle-config voor D1/SQLite.
 * Remote D1-credentials zijn pas nodig bij push naar Cloudflare.
 */
export default defineConfig({
  schema: './worker/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
})
