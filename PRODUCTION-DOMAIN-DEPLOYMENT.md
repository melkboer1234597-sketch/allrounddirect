# AllRound Direct — Production Domain Deployment

**Date:** 2026-09-15  
**Target canonical URL:** https://allrounddirect.com  
**Worker:** `allrounddirect`  
**Account ID (config):** `6b3387c18299d307197d2a39a0d9093d`  
**D1:** `cloth` (`e41adef2-8318-483e-9847-de4cb71ca545`)  
**R2:** `piccas`  
**Repo:** `melkboer1234597-sketch/allrounddirect`

## Verdict

**https://allrounddirect.com is NOT WORKING as a live production site yet.**

Code and Wrangler config are prepared for the `.com` cutover, but Cloudflare deploy and DNS are blocked from this machine. Do not treat the domain as live until the manual actions below are completed and smoke tests pass.

## What was completed in code

- Canonical production origin set to `https://allrounddirect.com` in:
  - `wrangler.jsonc` vars (`ENVIRONMENT`, `SITE_URL`, `PUBLIC_SITE_URL`, `BETTER_AUTH_URL`, `MOLLIE_MODE=test`)
  - Worker custom domain routes for apex + www
  - `assets.run_worker_first: true` + SPA fallthrough after Hono 404
  - Worker www → apex **HTTP 308** (path + query preserved)
  - Frontend `VITE_SITE_URL` via `.env.production`
  - Sitemap / robots host → `https://allrounddirect.com`
  - Email layout branding host → `allrounddirect.com`
  - Frontend `getSiteOrigin()` defaults / www normalization
- Trusted CORS origins include `.com` apex + www; temporary `.nl` allowlist kept for cutover only (`worker/lib/request.ts`)
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` — all passed (lint warnings only)

## Architecture (intended)

```
GitHub main
  → Cloudflare Workers Builds / wrangler deploy
  → Worker allrounddirect
  → Static Assets + /api (Hono) + /media
  → D1 cloth + R2 piccas
```

No separate Cloudflare Pages production site was created.

## Git

| Item | Value |
|------|--------|
| Local branch | `main` |
| Remote | `git@github.com:melkboer1234597-sketch/allrounddirect.git` |
| Pre-push HEAD | `6cc2a20` (matched `origin/main`) |
| Auth identity (SSH) | `rooiekabel/kebbers` |
| `gh auth` | Not logged in |

Push result is recorded in the final status block after the commit/push attempt in this session.

## Cloudflare auth blocker

`npx wrangler whoami` is logged in as **Chartsbezorgd@gmail.com** / account `43ed20c407cb6a80a41153c5a7ca170b`.

Wrangler config targets account `6b3387c18299d307197d2a39a0d9093d` (ALLROUND DIRECT).

Consequence: all remote API calls fail with auth `10000` / account `7403`:

- `wrangler secret list` — failed
- `wrangler d1 execute cloth --remote` — failed
- `wrangler deployments list` — failed
- Deploy cannot proceed from this environment

## DNS

As of 2026-09-15 from this machine:

- `allrounddirect.com` — **no A/AAAA** (does not resolve)
- `www.allrounddirect.com` — **NXDOMAIN**

Custom Domains on the Worker cannot serve traffic until the zone DNS is present in the Cloudflare account that owns Worker `allrounddirect`, and routes/custom domains are attached.

## Secrets (names only — values never printed)

Could **not** list production secret names (wrong Cloudflare account).

Expected secret names (set on Worker `allrounddirect` when authenticated to the correct account):

- `MOLLIE_API_KEY`
- `BETTER_AUTH_SECRET`
- `RESEND_API_KEY`
- `TURNSTILE_SECRET`
- (optional) `EMAIL_FROM`, `EMAIL_REPLY_TO`, `ADMIN_SESSION_SECRET`

## D1 / R2 remote verification

**Not verified** — remote queries blocked by account mismatch.

Local config still binds:

- `DB` → D1 `cloth`
- `MEDIA` → R2 `piccas`

No catalog re-import, drop, or reset was performed.

## Runtime `.nl` references

| Location | Count / note |
|----------|----------------|
| `worker/lib/request.ts` trusted origins | **2** temporary CORS hosts (`allrounddirect.nl`, `www.allrounddirect.nl`) |
| Frontend / SEO / sitemaps / wrangler vars | **0** production canonical `.nl` |

## Smoke tests (https://allrounddirect.com)

**Not executed successfully** — domain does not resolve; no HTTPS response to assert.

Intended checklist once DNS + deploy work:

- [ ] `/` homepage
- [ ] category / product / search
- [ ] product image (`/media/...`)
- [ ] cart / account / checkout
- [ ] admin route SPA
- [ ] `/sitemap.xml`, `/robots.txt`
- [ ] `https://www.allrounddirect.com/...` → **308** → apex with path+query

## Manual actions still required

1. **Cloudflare login** to the account that owns Worker `allrounddirect` / D1 `cloth` / R2 `piccas` (`account_id` `6b3387…`), then re-run:
   - `npx wrangler whoami` (must show that account)
   - `npx wrangler secret list` (confirm expected names)
   - `npx wrangler d1 execute cloth --remote --command "..."` (product/image counts)
   - `npx wrangler deploy` **or** confirm Workers Builds from `main`
2. **DNS / Custom Domains** for `allrounddirect.com` and `www.allrounddirect.com` on that same Cloudflare account (remove conflicting Hostinger A/AAAA/CNAME if any; prefer Worker Custom Domains).
3. **GitHub write access** for the identity used to push (`rooiekabel/kebbers` via SSH, or `gh auth login` as repo owner `melkboer1234597-sketch`), then ensure `origin/main` has the production commit.
4. After deploy: set any missing secrets; set `VITE_TURNSTILE_SITE_KEY` for frontend builds when ready.
5. Run full production smoke tests on apex + www redirect.
6. Mollie live sign-off later (`MOLLIE_MODE` stays `test` until then).
