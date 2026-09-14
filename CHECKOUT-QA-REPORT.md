# CHECKOUT QA REPORT — ALLROUND DIRECT

**Role:** Independent ecommerce QA / payment / security review  
**Date:** 2026-09-14  
**Scope:** Checkout, Mollie TEST integration, webhooks, return page, guest/account access, admin refunds, email soft-fail  
**Stance:** Do not trust the implementation — try to break it.

---

## Executive verdict

The checkout money path is **server-authoritative** (client prices are not accepted). Several **deterministic payment bugs** were found and fixed during this review (canceled/expired collapsed to `failed`; duplicate webhooks re-emitted events/history; order idempotency index not unique in schema).  

Automated unit tests now cover the highest-risk pure logic (**43 tests, all passing**). End-to-end Mollie TEST payments, visual responsive passes, and keyboard QA still require **manual / external** verification listed at the bottom.

---

## Commands run

| Command | Result |
|---------|--------|
| `npm run typecheck` | Pass |
| `npm run test` (vitest) | **43/43 pass** |
| `npm run build` | Pass |
| `npm run lint` | Warnings only (repo-wide Prettier CRLF `Delete ␍`); **no ESLint errors** on new checkout/payment files (`eslint --quiet`) |
| `npm run db:migrate:local` (`0009`) | Pass |

---

## Bugs found and fixed (deterministic)

### 1. CRITICAL — Canceled/expired payments shown as failed
**Before:** `payment-sync` mapped Mollie `canceled` / `expired` → order `paymentStatus: 'failed'`, so the return page could not show CANCELED/EXPIRED.  
**After:** `mapOrderPaymentStatus` preserves `canceled` / `expired` / `authorized`.  
**Files:** `shared/payment-ui.ts`, `worker/services/payment-sync.ts`

### 2. CRITICAL — Duplicate Mollie webhooks re-fired emails & history
**Before:** Every `paid` sync emitted `PAYMENT_CONFIRMED` even when already paid; failed webhooks always appended history.  
**After:** Emit/history only on **first** transition (`shouldEmitPaymentConfirmed` / `shouldRecordFailedPaymentAttempt`). Failed-email event keys are per payment id.  
**Files:** `worker/services/payment-sync.ts`, `worker/services/email.ts`, `worker/services/order-events.ts`

### 3. HIGH — Duplicate checkout submit race
**Before:** `orders.idempotency_key` had a non-unique index in Drizzle schema (partial unique only in older SQL).  
**After:** Unique index `orders_idempotency_key_uidx` (migration `0009_order_idempotency_unique.sql`).  
**Files:** `worker/db/schema.ts`, `drizzle/0009_order_idempotency_unique.sql`

### 4. MEDIUM — Cart lines accepted unknown price fields
**Before:** Zod stripped unknown keys silently (price spoof ignored but not rejected).  
**After:** Checkout line schema is `.strict()` — client `unitPriceCents` / `totalCents` → **400**.  
**File:** `worker/routes/checkout.ts`

### 5. LOW — Payment radios missing accessible name/value
**After:** `value` + `aria-label` on payment method radios.  
**File:** `src/pages/CheckoutPage.tsx`

---

## Automated tests added

Location: `tests/*.test.ts` · Runner: Vitest (`npm test`)

| Area | Coverage |
|------|----------|
| Money | euros↔cents, Mollie amount strings, addCents, float hazard documentation |
| VAT | 21% / 9% from inclusive prices; invalid qty/price |
| Cart attacks (schema) | qty 0 / negative / 999999 rejected; strict reject of client prices |
| Country matrix | CF suggest NL/BE/none; override NL→BE and BE→NL; invalid override |
| Payment methods | NL iDEAL / BE Bancontact priority; does not invent methods |
| Delivery | NL/BE methods; unconfigured shipping → 0 + `priceKnown: false` |
| Mollie status map | paid/pending/failed/canceled/cancelled/expired/authorized/refunded |
| Webhook dedupe logic | first paid only; failed transition only on change |
| Payment retry allowlist | failed/canceled/expired only |
| Order machine | illegal jumps rejected; refund paths from paid states |
| Order numbers | `ARD-YYYY-######` format/parse |
| IDOR | order# alone denied; wrong token/email/user denied; owner/email/token allowed |
| Admin RBAC | `customer` has no `orders.write` / `admin.access` |
| Email idempotency | event-key claim pattern |
| Return without pay | open/pending ≠ PAID |
| Live key in TEST | `assertMollieAllowed` rejects `live_` when `MOLLIE_MODE=test` |

---

## Attack matrix results (logic / code review + tests)

### Cart attacks
| Attack | Expected | Result |
|--------|----------|--------|
| Frontend price change | Server recalculates from DB | **Pass** — no client price field; strict schema rejects extras |
| Negative / 0 / 999999 qty | Reject | **Pass** — Zod + `assertValidCheckoutQuantity` (max 99) |
| Inactive / missing product | Reject | **Pass** — `resolveCartLines` throws “niet beschikbaar” |
| Manipulated total / shipping | Ignore client | **Pass** — quote/place recompute; shipping from delivery service |
| Duplicate place submit | One order | **Pass (hardened)** — idempotency key + unique index |

### Payment return
| Case | Result |
|------|--------|
| Visit return URL without paying | UI uses server `/checkout/status`; open/pending → **PENDING**, not PAID (**tested**) |
| Trust browser redirect alone | **Must not** — page always polls backend |

### IDOR
| Case | Result |
|------|--------|
| Change order number in account URL | Requires session ownership — fail |
| Guest order# only | Fail (`canAccessOrderDetail`) |
| Wrong email / wrong token | Fail |
| Valid token / email / owner | Allow |
| Sequential order enumeration via token | Tokens are UUIDs, not sequential — **design OK** |

### Admin
| Case | Result |
|------|--------|
| Customer calls refund / status / admin APIs | `requireStaff` + RBAC — customer has **no** permissions (**tested**) |
| Support role refund | No `orders.write` — denied |

### Country
| Case | Result |
|------|--------|
| CF predicts NL, user chooses BE | Override wins (**tested**) |
| CF predicts BE, user chooses NL | Override wins (**tested**) |
| No geolocation | Suggest NL (**tested**) |
| Shipping country drives Mollie restrict | Place uses address country — **pass by design** |

### Payment methods
| Case | Result |
|------|--------|
| Inactive Mollie methods | UI only renders `listMethods` response — unavailable methods never appear |
| Mock filters | BE drops iDEAL; NL drops Bancontact in mock service |

### Email without Resend
| Case | Result |
|------|--------|
| Missing `RESEND_API_KEY` | Checkout continues; email soft-fails / logs / event_key claim — **no crash** (by design in `email.ts`) |

---

## Payment states (Mollie TEST) — verification status

| State | Automated | Live Mollie TEST |
|-------|-----------|------------------|
| paid | Mapping + transition logic | **Manual required** |
| pending / open | UI ≠ PAID | Manual |
| failed | Retry allowlist + mapping | Manual |
| canceled | Preserved (bugfix) | Manual |
| expired | Preserved (bugfix) | Manual |
| authorized | Maps to pending UI / `authorized` payment status | Manual if method enabled |

**Do not** treat D1 hand-edits as Mollie verification. Use Mollie TEST dashboard / mock `tr_dev_*` + webhook in development.

Webhook scenarios (before return / after return / multi-delivery) are covered at the **idempotency logic** layer; full HTTP webhook soak still needs Mollie TEST.

---

## Responsive & accessibility (checkout)

| Viewport | Automated | Notes |
|----------|-----------|-------|
| 320–430 | Structural | Grid uses `min-w-0`, mobile collapsible summary, sticky desktop summary — **no fixed overflow found in code**; visual QA still required |
| 768 / 1024 / 1440 | Structural | `lg:` two-column layout |

| A11y item | Status |
|-----------|--------|
| Keyboard field focus on first error | Implemented (`focusFirstError`) |
| Payment method radios | Fixed `value` + `aria-label` |
| Full keyboard-only checkout pass | **Manual required** |

---

## Remaining risks (not fully closed)

1. **Order number generator** is read-increment-write (not atomic under extreme concurrency) — residual race under load.  
2. **Mollie TEST E2E** (paid/failed/canceled/expired + webhook timing) not executed in this session against live Mollie API.  
3. **Visual responsive** at 320px and full keyboard audit not browser-automated here.  
4. **Remote D1 `0009` file import** hit a transient auth error on `--file`; local migrate succeeded. Confirm remote unique index if deploy uses remote D1.  
5. Repo-wide Prettier CRLF warnings remain noise on `npm run lint` (pre-existing).

---

## Remaining external configuration only

Configure in Cloudflare / secrets / dashboard (not code):

1. **`MOLLIE_API_KEY`** — `test_…` for TEST; never commit.  
2. **`MOLLIE_MODE=test`** (default) until deliberate live cutover.  
3. **`MOLLIE_ALLOW_LIVE=true`** + `ENVIRONMENT=production` + `live_` key — only for live.  
4. **`MOLLIE_BLOCK_LIVE_REFUNDS=true`** in CI / non-prod (already in wrangler example).  
5. **Mollie webhook URL** pointing at `/api/payments/mollie/webhook` (HTTPS, production host).  
6. **`RESEND_API_KEY`**, **`EMAIL_FROM`**, **`EMAIL_REPLY_TO`** for real mail; checkout works without them.  
7. **`PUBLIC_SITE_URL` / `SITE_URL`** for email links and Mollie redirects.  
8. **Turnstile** keys for guest order lookup / auth forms.  
9. **Delivery `amountCents`** business rules when shipping prices are known (currently honest `null` → 0 + not advertised free).  
10. Confirm remote D1 migration `0009_order_idempotency_unique` applied in the target environment.

---

## Sign-off checklist for go-live (TEST first)

- [ ] Place guest NL/BE and logged-in NL/BE orders in Mollie TEST  
- [ ] Force paid / failed / canceled / expired; confirm return UI copy  
- [ ] Replay webhook 5×; confirm one payment transition, one order transition, one confirmation email event  
- [ ] Open return URL for unpaid order → not thank-you  
- [ ] Attempt IDOR on guest token and account order URLs  
- [ ] Customer session cannot hit `/api/admin/*`  
- [ ] Checkout at 320px width + keyboard-only pass  
- [ ] Disable Resend → place order still redirects to Mollie  

**Automated gate for CI:** `npm run typecheck && npm run test && npm run build`
