/** Cloudflare Worker bindings and environment. */
export type AppEnv = {
  Bindings: {
    DB: D1Database
    ASSETS: Fetcher
    ENVIRONMENT?: string
    MOLLIE_API_KEY?: string
    ADMIN_SESSION_SECRET?: string
  }
}
