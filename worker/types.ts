/** Cloudflare Worker bindings and environment. */
export type AppEnv = {
  Bindings: {
    DB: D1Database
    MEDIA: R2Bucket
    ASSETS: Fetcher
    ENVIRONMENT?: string
    MOLLIE_API_KEY?: string
    ADMIN_SESSION_SECRET?: string
    BETTER_AUTH_SECRET?: string
    BETTER_AUTH_URL?: string
    SITE_URL?: string
    TURNSTILE_SECRET?: string
    RESEND_API_KEY?: string
    EMAIL_FROM?: string
    EMAIL_REPLY_TO?: string
    MOLLIE_MODE?: string
    MOLLIE_ALLOW_LIVE?: string
  }
}
