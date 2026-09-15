# AllRound Direct — Final Production Release Gate

Gate date: 2026-09-15  
Canonical domain: https://allrounddirect.com  
Git HEAD / origin/main: `cc7ba7d` (Productionize Resend transactional email for allrounddirect.com)  
Deployed Worker version: `580b6ffa-4ff3-4ec9-8a04-0440720b5a8d` (asset hashes match local `origin/main` build)

---

## FINAL STATUS:

READY WITH BLOCKERS

Production storefront, remote catalog, domain, SEO surfaces, free-shipping threshold, image filtering, and Cloudflare bindings are live. Checkout payments and operational admin/email are blocked until owner configuration below is completed.

---

## DOMAIN:

PASS

- `https://allrounddirect.com/` → HTTP 200
- `https://www.allrounddirect.com/...` → HTTP 308 to apex with path + query preserved (verified `/categorie/keuken?foo=1` and `/zoeken?q=bank`)
- HTTPS / Cloudflare edge serving custom domains on Worker `allrounddirect`
- `/api/health` → `{"status":"ok"}`

## GIT:

PASS

```
main cc7ba7d [origin/main] Productionize Resend transactional email for allrounddirect.com
cc7ba7d Productionize Resend transactional email for allrounddirect.com
0623968 Harden production checkout shipping, Mollie context, and thank-you UX
147d0b4 Add secure Better Auth admin bootstrap for super_admin
```

- Working tree clean of product code at gate time (only local QA temp dirs / optional visual script untracked; not committed)
- Secret scan: no live Mollie/Resend keys or private keys in tracked sources; `.env` / `.dev.vars` gitignored
- `npm test` → 66/66 pass
- `npm run typecheck` → pass
- `npm run lint` → 0 errors (CRLF prettier warnings only)
- `npm run build` → pass

## CLOUDFLARE:

PASS (after gate redeploy)

- Worker: `allrounddirect`
- Account: `melkboer1234597@gmail.com` / `6b3387c18299d307197d2a39a0d9093d`
- Custom domains: `allrounddirect.com`, `www.allrounddirect.com`
- Vars: `ENVIRONMENT=production`, `SITE_URL` / `PUBLIC_SITE_URL` / `BETTER_AUTH_URL` = `https://allrounddirect.com`, `EMAIL_FROM` / `EMAIL_REPLY_TO`, `MOLLIE_MODE=test`, live Mollie refunds blocked
- Secrets present: `BETTER_AUTH_SECRET`, `MOLLIE_API_KEY`
- Secrets missing: `RESEND_API_KEY` (and optional Turnstile if required later)
- Latest deploy verified against live HTML asset hashes (`index-e49paQpG.js` etc.)

## DATABASE:

PASS (remote D1 `cloth`)

- Remote D1 bound and queried from production account
- Products: 702 active
- Product images: 2984 (`ok` 2642 / `suspicious` 342)
- Orders table writable (gate created pending orders)
- Users: **0** (no staff account yet)

## R2:

PASS

- Bucket `piccas` bound as `MEDIA`
- Live product media returns `200` `image/webp` from `/media/products/by-hash/...`

## CATALOG:

PASS

- Production uses remote D1 + R2 (not empty local demo catalog)
- Sample live products verified via API (e.g. Hudson, Varinia, Xora, Beldomo, featured set)
- Search `/api/search?q=bank`, categories `/api/categories`, category products, featured, PDP by slug all return real data
- Navigation / category / product HTML routes return 200 SPA shell; data from API
- Wishlist / cart / account / guest-order routes are served (SPA); admin API unauthenticated → 404/denied (`/api/admin/me`)

### Images

PASS (filter active)

- Storefront mapping filters to `image_status = ok` only (`worker/lib/catalog-map.ts`)
- Spot-check Beldomo: DB has 2 ok + 3 suspicious; public API returns **2** images

### Delivery label

PASS

- All active products `lead_time_min_days=1` / `max=3`
- Public API `leadTime`: **`1-3 werkdagen`**
- No public **`Op aanvraag`** delivery on active catalog samples / featured

### Free shipping

PASS (server-side)

- Threshold **€999** (`99900` cents)
- Quote ≥ threshold: `freeShipping=true`, `shippingCents=0`, `rateSource=free_shipping_threshold`
- Quote &lt; threshold without configured rates: `shippingPriceKnown=false` + release blocker (place rejected)

## ADMIN:

FAIL (not bootstrapped)

- `admin@allrounddirect.com` **does not exist** in remote `user` (0 users)
- Bootstrap tooling present: `npm run admin:bootstrap -- --remote` (password never logged; do not commit)
- Unauthenticated admin API does not expose staff data

## CHECKOUT:

PARTIAL / BLOCKED

Verified:

- Checkout context NL/BE works; production mode does **not** silently use development shipping fallbacks
- Free-shipping path can create orders (NL + BE ≥ €999)
- Below-threshold checkout correctly rejected until rates exist

Gate place attempts (Hudson €1249.99, free shipping):

| Country | Order | Payment |
|---------|-------|---------|
| NL | `ARD-2026-000002` created | **failed** — Mollie redirect URL domain mismatch |
| BE | `ARD-2026-000003` created | **failed** — same Mollie domain error |

Mollie error: `The redirect URL doesn't match your profile URL or any of your registered domains`  
→ redirect uses `https://allrounddirect.com/bestelling/bevestiging?...` but Mollie profile still lacks this domain.

Historical `ARD-2026-000001` is a **fixture/mock** payment (`tr_dev_…`, `dev-outbox` email) — not a production Mollie proof.

Thank-you / webhook / paid status / admin visibility / customer email **not proven** on real Mollie test payments in this gate.

## MOLLIE:

PARTIAL

- Test mode configured (`MOLLIE_MODE=test`, secret present, `isMock=false`)
- NL methods include iDEAL; BE methods returned (card/PayPal/etc.; Bancontact not currently returned by Mollie for this profile)
- **Blocker:** website/profile redirect domains must include `https://allrounddirect.com`
- Full NL/BE TEST payment → webhook → paid → thank-you **not completed** in this gate

## RESEND:

FAIL (secret missing)

- Code path productionized (`EMAIL_FROM` / `EMAIL_REPLY_TO` on Worker)
- `RESEND_API_KEY` **not** set on Worker secrets
- Existing `email_logs` “sent” rows are fixture/`dev-outbox` only — not Resend production proof
- Without key, sends are skipped (logged `missing_resend_key`); checkout is not hard-blocked by email

## SEO:

PASS (with client-side schema note)

- Canonical origin config: `https://allrounddirect.com` (no production canonical on `.nl` in site config / sitemaps)
- Live sitemap index + child sitemaps use `https://allrounddirect.com/...`
- `robots.txt` allows crawl, disallows private paths, Sitemap → `https://allrounddirect.com/sitemap.xml`
- Product / Breadcrumb / Organization JSON-LD implemented in app (`src/lib/seo.ts`); Product schema has **no** reviews / aggregateRating
- SPA injects schema client-side (HTML shell alone does not contain JSON-LD)
- Temporary CORS allowlist still includes `.nl` hosts in `worker/lib/request.ts` (cutover leftover; not used as canonical)

## SECURITY:

PASS with notes

- No secrets committed; env files ignored
- Admin route/API gated; no public staff user yet
- Mollie live mode / live refunds blocked by vars
- Customers cannot reach admin without staff role (and no staff users exist yet)
- Do not commit passwords; bootstrap interactively only

---

## OWNER ACTIONS REMAINING:

1. **Mollie dashboard** — Register website/profile / redirect domains for `https://allrounddirect.com` (and www if required). Then complete NL + BE Mollie **TEST** checkouts through paid → webhook → thank-you.
2. **Shipping rates** — Set standard NL and BE rates via admin Instellingen **or** Worker vars `SHIPPING_STANDARD_NL_CENTS` / `SHIPPING_STANDARD_BE_CENTS` (required for carts under €999).
3. **Admin account** — Run remote bootstrap for `admin@allrounddirect.com` as `super_admin` (`npm run admin:bootstrap -- --remote`). Choose a strong password locally; do not put it in git/chat.
4. **Resend** — Add Worker secret `RESEND_API_KEY`. Verify sending domain DNS for `allrounddirect.com` in Resend. Confirm order/payment emails after a successful TEST payment.
5. **Optional** — Enable Bancontact (or other BE methods) in Mollie if required for Belgian checkout UX; remove temporary `.nl` CORS entries after cutover is fully retired; switch Mollie to live only after TEST E2E is green.

---

## Gate evidence (selected)

- Remote catalog: 702 active products; media 200 from R2
- Free shipping quote ≥ €999: `shippingCents=0`
- Below-threshold place: rejected with unconfigured shipping message
- Mollie place ≥ €999: order rows created; payment failed on redirect domain mismatch
- Deploy: `580b6ffa-…` assets match `origin/main` build
