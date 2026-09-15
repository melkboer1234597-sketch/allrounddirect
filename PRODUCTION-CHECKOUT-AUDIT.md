# PRODUCTION CHECKOUT AUDIT

**Date:** 2026-09-15  
**Domain:** https://allrounddirect.com  
**Worker:** `allrounddirect` (account `6b3387…` / `melkboer1234597@gmail.com`)  
**Deploy version:** post-session-fix deploy (custom domains attached)

## Cloudflare account note

Wrangler was previously logged in as `chartsbezorgd@gmail.com` because that OAuth token already lived in the local Wrangler config on this machine (leftover session), **not** because the project pointed there.  
Logged out and re-authenticated as **`melkboer1234597@gmail.com`** (account id matches `wrangler.jsonc`).

## What was repaired

| Area | Change |
|------|--------|
| Auth session | `getSession` no longer crashes checkout when secret missing / auth errors |
| Production secret | `BETTER_AUTH_SECRET` set on Worker (value never logged) |
| Shipping config | Central `loadShippingSettings` (env + admin `site_content`) |
| Admin | `/scotdejewish/settings` can edit NL/BE shipping cents |
| Checkout UI | Contactgegevens, delivery blocker, VAT optional, stronger CTA gating |
| Thank-you | Items + totals + guest account CTA; retry copy |
| Deploy | Worker + assets + custom domains `allrounddirect.com` / `www` |

## Live API checks (via Cloudflare edge)

### Health
`GET /api/health` → `{"status":"ok"}`

### Checkout context NL (`amountCents=50000`)
- Delivery: **Bezorging op adres**, 1–3 werkdagen  
- Shipping: **unconfigured** → RELEASE BLOCKER surfaced (no silent €0)  
- Mollie: **test**, configured, not mock  
- Methods (Mollie-returned): `ideal` (preferred), `creditcard`, `paypal`, `banktransfer`, `in3`, `kbc`, `belfius`

### Checkout context BE (`amountCents=120000`)
- Locale: `nl_BE`  
- Methods: `creditcard` (preferred among returned), `paypal`, `banktransfer`, `kbc`, `belfius`, `ideal`  
- **Bancontact not returned by Mollie** for this profile/amount → cannot invent it in UI

### Homepage / checkout SPA
`/` and `/afrekenen` serve the SPA shell successfully.

### www
`www.allrounddirect.com/keuken?page=2` resolves through Cloudflare (Worker custom domain). Local DNS on this Windows machine is flaky (SOA only / ENOTFOUND); edge fetch works.

## Shipping rates

| Country | Production rate |
|---------|-----------------|
| NL | **null — RELEASE BLOCKER** |
| BE | **null — RELEASE BLOCKER** |

Dev fallbacks (local only): NL `695`, BE `995`.  
Free shipping threshold: **99900** cents (server-side). Orders **≥ €999** can still complete without configured standard rates.

## Mollie payment creation / webhook / thank-you / admin order

Not fully end-to-end exercised with a real Mollie hosted payment in this pass because:

1. Standard shipping below €999 is blocked until owner sets rates  
2. Full browser Mollie redirect + webhook observation needs a completed test payment session  
3. Admin login requires `admin:bootstrap --remote` (password interactive) — remote user count was **0**

Architecture already present: server-priced `place`, Mollie payment create with apex redirect/webhook URLs, idempotent webhook sync, status polling thank-you, retry-payment for same order.

## Automated tests

- `npm test` → **64 passed**  
- `npm run typecheck` → **0**  
- `npm run lint` → **0 errors** (prettier warnings only)  
- `npm run build` → **ok**  
- Deploy → **ok**

## Remaining owner decisions

1. **Set NL + BE standard shipping cents** in `/scotdejewish/settings` (or env `SHIPPING_STANDARD_NL_CENTS` / `SHIPPING_STANDARD_BE_CENTS`)  
2. Confirm Mollie profile enables **Bancontact** for BE if required  
3. Bootstrap `admin@allrounddirect.com` with `npm run admin:bootstrap -- --remote`  
4. Set remaining secrets if missing: `RESEND_API_KEY`, `TURNSTILE_SECRET`, `EMAIL_FROM`  
5. Run one Mollie **test** payment end-to-end after shipping rates are set  
6. Keep `MOLLIE_MODE=test` until live sign-off  
7. Fix local/ISP DNS if apex does not resolve on office PCs (zone is on Cloudflare; custom domains attached)

## Verdict snapshot

See status block in chat / end of this file after updates.
