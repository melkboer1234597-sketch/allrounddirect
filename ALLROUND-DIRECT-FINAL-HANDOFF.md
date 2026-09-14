# ALLROUND DIRECT — FINAL PRODUCTION HANDOFF

Date: 2026-09-14  
Repository: `melkboer1234597-sketch/allrounddirect`  
Worker: `allrounddirect`  
Primary domain (from sitemap/config): `https://www.allrounddirect.nl`

---

## 1. FINAL STATUS

**READY WITH MANUAL CONFIGURATION**

The ecommerce platform (catalog, cart, checkout, Mollie architecture, accounts, admin, SEO foundation, delivery/free-shipping policy) is implemented and validated by typecheck, tests, and production build. Launch still requires owner actions for secrets, email domain, Mollie live mode, legal confirmation, and Cloudflare production verification.

---

## 2. STOREFRONT

### Checked
- Homepage (header/topbar/hero preserved; category grid, trust, featured rail, flooring/business/outlet/delivery/about/newsletter, footer)
- Product cards (4:3 frame, smart object-fit, delivery `1-3 werkdagen`, free shipping only when item ≥ €999)
- Featured section: one desktop row (4 / 5 on 2xl), mobile snap rail
- Category/search/related/wishlist share the same ProductCard
- Cookie consent: Alleen noodzakelijk / Voorkeuren / Alles accepteren
- Legal & service routes wired in `src/App.tsx`

### Fixed in this pass
- Production Worker vars no longer force `ENVIRONMENT=development` (which mocked Mollie)
- Local overrides documented via `.dev.vars.example`
- robots.txt Sitemap line added
- Account invoices/returns copy updated (no longer claims checkout is offline)
- Delivery + free-shipping policy centralized in `shared/commerce.ts`

### Remaining
- Some product titles still contain mixed DE/NL fragments flagged for admin review
- Account invoice PDF download and self-serve returns UI are honest placeholders
- Full visual QA across every breakpoint on the live domain still recommended after deploy

---

## 3. CATALOG

### Remote D1 snapshot (post-normalization)
- Products: **702** active
- With price: **693**
- Images: **2984**
- Delivery fields normalized to **1–3 business days** (`0010_normalize_delivery_policy.sql` applied remote)

### Dutch normalization
- Repeatable pipeline: `npm run catalog:normalize-dutch` (+ `--apply`)
- Preserves `original_source_name`
- Updates customer-facing name/description/specs/SEO
- Flags `translation_needs_review` when uncertain
- See `CATALOG-DUTCH-NORMALIZATION-REPORT.md`

### Remaining manual review
- ~68–100 products still `needs_review` / flagged (furniture naming quirks, incomplete source text)
- Hard German marker scan dropped from ~42 → near-zero for common tokens; residual title tokens may remain
- Do **not** delete scrape sources under the external scraper folder

---

## 4. CUSTOMER ACCOUNTS

### Status
- Better Auth registration/login/password reset architecture present
- Protected account routes + server APIs
- Wishlist, addresses, orders, profile, security, privacy pages exist
- Guest order lookup uses secure token / email+order combination (not order number alone)

### Remaining
- Turnstile production keys must be set or auth friction/fallback rules remain incomplete
- `BETTER_AUTH_SECRET` must exist as Cloudflare secret (not present in secret list at audit time)
- Invoice PDF + return request UIs are deferred placeholders

---

## 5. CART & CHECKOUT

### Status
- Server recalculates totals from catalog prices (client prices not trusted)
- Free shipping threshold: **99900 cents** on eligible merchandise subtotal (server-side)
- Countries: **NL / BE**
- Guest + logged-in checkout flows implemented
- Cloudflare country may preselect; customer selection remains authoritative
- Free-shipping progress on cart/checkout; subtle messaging (not spam)

### Remaining
- Below-threshold shipping rates are intentionally **not invented** (unknown until configured)
- Live Mollie end-to-end on production URL must be owner-verified after deploy

---

## 6. MOLLIE

### Implemented
- Server-side payment creation
- Webhook sync with processed-webhook idempotency
- Return page polls server status (does not trust redirect alone)
- Payment retry on same order
- Admin refunds with validation + idempotency (live refunds blocked by default)
- Methods listed from Mollie for amount/country (not a blind hardcoded list)

### Cloudflare secret present
- `MOLLIE_API_KEY` ✅ (value not shown)

### Manual still required
1. Confirm key is **test** until go-live
2. Mollie Dashboard → enable NL/BE methods (iDEAL, Bancontact, etc.)
3. Set website/profile URLs to `https://www.allrounddirect.nl`
4. Ensure webhook URL reachable: `https://www.allrounddirect.nl/api/payments/webhook` (exact path as deployed)
5. Before real money: set Cloudflare vars `MOLLIE_MODE=live`, `MOLLIE_ALLOW_LIVE=true`, rotate to **live** API key, set `MOLLIE_BLOCK_LIVE_REFUNDS=false` only when intentional
6. Run a real TEST payment after production deploy

---

## 7. RESEND / EMAIL

### Implemented
- Central email service + templates (order/payment/shipment/refund/auth)
- Checkout does **not** hard-fail if email provider is missing
- Email event / idempotency architecture for transactional sends
- Admin email preview (staff-protected)

### Manual still required
1. Cloudflare → Worker `allrounddirect` → Settings → Variables  
   - Secret: `RESEND_API_KEY`  
   - Vars/secrets: `EMAIL_FROM`, `EMAIL_REPLY_TO`
2. Resend → Domains → verify sending domain DNS for allrounddirect.nl
3. Send a test order confirmation after DNS verifies

---

## 8. ADMIN (`/scotdejewish/`)

### Status
- Staff gate + RBAC permissions on APIs
- Dashboard, products (incl. quality), categories, brands, orders, customers, returns, quotes, suppliers, imports, SEO, settings, users, audit log, email preview
- Knowing the path is not access; customer sessions get unauthorized
- Effective storefront delivery policy shown in product admin

### Remaining
- Create/confirm at least one staff user with role via `npm run admin:set-role` (or existing process)
- Review products flagged `translation_needs_review` / quality warnings

---

## 9. SEO

### Status
- Titles/meta/canonical helpers
- robots disallow for account/cart/checkout/admin/search
- Sitemap index + category/product/content/static (canonical host `www.allrounddirect.nl`)
- Product JSON-LD Offer without fake ratings
- Admin noindex
- Draft/demo products avoid indexable Product schema

### Remaining
- Confirm `VITE_SITE_URL=https://www.allrounddirect.nl` in the Cloudflare/Workers Builds environment used for the frontend build
- Submit sitemap in Search Console after go-live
- Spot-check indexation of a few product URLs after deploy

---

## 10. CLOUDFLARE

### Confirmed via Wrangler
- Logged in; account matches `wrangler.jsonc`
- Worker name: `allrounddirect`
- D1 binding `DB` → database `cloth`
- R2 binding `MEDIA` → bucket `piccas`
- Secret names present: `MOLLIE_API_KEY`
- Recent deployments exist (GitHub/Workers Builds / upload)

### Code defaults now
- `ENVIRONMENT=production`
- `SITE_URL` / `BETTER_AUTH_URL` / `PUBLIC_SITE_URL` → `https://www.allrounddirect.nl`
- `MOLLIE_MODE=test` until intentionally switched

### Manual remaining
1. Cloudflare Dashboard → Workers → `allrounddirect` → Settings → Variables and Secrets  
   Add/confirm: `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `TURNSTILE_SECRET`, `EMAIL_FROM`, `EMAIL_REPLY_TO`  
   Confirm production `SITE_URL` / `BETTER_AUTH_URL` match the live domain
2. Workers Builds / GitHub: confirm production branch `main` builds `npm run build` then deploys Worker + assets
3. Custom domain: confirm `www.allrounddirect.nl` (and apex if desired) routes to this Worker
4. Optional: R2 custom media host; WAF rate rules for `/api/auth/*`, `/api/checkout/*`, `/api/guest-orders/*`, `/api/contact`
5. After this git push: verify the new deployment succeeded in the dashboard

---

## 11. SECURITY

### Verified / present
- Staff RBAC on admin APIs
- Checkout price recalculation server-side
- Guest order access not by sequential number alone
- Dev routes gated to development + localhost
- Rate limiting helpers + Turnstile hooks on sensitive flows
- No API key values found in tracked source during scan
- Refund live-block defaults

### Remaining production config
- Set all auth/email/turnstile secrets
- Cloudflare WAF rate limiting recommended
- Rotate any historical secrets if they were ever pasted into chat/logs
- Legal/privacy final review before claiming compliance

---

## 12. LEGAL

### Pages ready (Dutch draft content)
- Privacy, Cookies, Algemene voorwaarden, Bezorgen, Retourneren, Garantie en klachten, Betalen, Herroepen, Herroepingsformulier, Disclaimer, Contact, Zakelijke voorwaarden

### Owner/legal still required
- Final company details (KVK, VAT, address, support phone/email)
- Return cost policy confirmation
- Shipping rate policy below €999
- Formal legal review of terms/privacy before marketing “compliant”

---

## 13. MANUAL ACTIONS FOR OWNER

1. **Cloudflare → Worker `allrounddirect` → Settings → Variables**  
   Add secrets/vars: `BETTER_AUTH_SECRET` (≥32 chars), `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `TURNSTILE_SECRET` (+ matching `VITE_TURNSTILE_SITE_KEY` in frontend build env).
2. **Confirm domain** `https://www.allrounddirect.nl` is attached to Worker `allrounddirect` (www + optional apex).
3. **Workers Builds**: confirm latest `main` push built and deployed successfully.
4. **Mollie Dashboard**: website URL, webhook URL, NL/BE methods enabled; keep TEST until ready.
5. **Resend**: verify sending domain DNS; send one test transactional email.
6. **Create/verify admin staff account** for `/scotdejewish/`.
7. **Admin → Quality / products needing review**: clear remaining DE/NL title fragments (~dozens flagged).
8. **Decide below-€999 shipping rates** (platform will show “Wordt berekend” until configured).
9. **Legal**: confirm KVK/VAT/support copy; have terms/privacy reviewed.
10. **Go-live Mollie**: only when ready — live API key + `MOLLIE_MODE=live` + `MOLLIE_ALLOW_LIVE=true`.

---

## 14. PRODUCTION LAUNCH CHECKLIST

- [ ] Secrets set (auth, Mollie, Resend, Turnstile)
- [ ] Domain resolves to Worker; HTTPS OK
- [ ] Latest GitHub → Cloudflare build green
- [ ] Homepage + category + PDP + cart load on production
- [ ] Mollie TEST checkout NL + BE succeeds end-to-end
- [ ] Webhook updates order to paid (idempotent on retry)
- [ ] Guest order lookup works with token/email
- [ ] Admin login works; customer cannot access admin APIs
- [ ] Transactional email delivers (or consciously deferred)
- [ ] Sitemap/robots reviewed in Search Console
- [ ] Shipping-below-threshold decision documented
- [ ] Legal/company details confirmed
- [ ] Switch Mollie to live only after TEST sign-off

---

## Validation run (this handoff)

- `npm test` — 50 passed
- `npm run typecheck` — pass
- `npm run build` — run as part of final gate
- Secret scan of tracked patterns — no live secret values found in source
- Remote D1 migration `0010` applied
- Dutch normalization applied (idempotent pipeline)

Git push completed status is recorded by the final operator response after push.

**Local commit created:** `1d1ea0d` on `main`  
**Push attempt:** failed with GitHub 403 (`Permission denied to fxmusa79-web` for `melkboer1234597-sketch/allrounddirect`). Owner must push with an account that has write access:
`git push origin main`
