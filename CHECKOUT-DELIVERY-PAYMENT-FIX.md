# CHECKOUT DELIVERY + PAYMENT FIX

Date: 2026-09-14

## LOCAL MOLLIE

**configured:** NO (key empty in `.dev.vars`)  
**mode:** TEST  
**local behaviour after fix:** development Mollie **mock** when `ENVIRONMENT=development` and key missing

### Cause
- Cloudflare production has `MOLLIE_API_KEY`, but local Wrangler reads **`.dev.vars`**, not production secrets.
- Local `.dev.vars` had `MOLLIE_API_KEY=` **empty**.
- `wrangler.jsonc` defaulted `ENVIRONMENT=production`, so the Worker refused the mock and threw; checkout **swallowed** the error and returned `paymentMethods: []`.

### Required owner action for REAL Mollie test methods locally
1. Open **`.dev.vars`** (project root)
2. Set: `MOLLIE_API_KEY=test_...` (your Mollie test key)
3. Keep: `ENVIRONMENT=development`, `MOLLIE_MODE=test`
4. Restart `npm run dev` / `wrangler dev`

Do **not** put the production live key in `.dev.vars`.

---

## DELIVERY NL

**working:** YES  
**rate (local/dev):** **€6,95** (`695` cents) — **DEVELOPMENT FALLBACK ONLY**  
**label:** Bezorging op adres  
**time:** Levering binnen 1 tot 3 werkdagen / 1-3 werkdagen

## DELIVERY BE

**working:** YES  
**rate (local/dev):** **€9,95** (`995` cents) — **DEVELOPMENT FALLBACK ONLY**

## FREE SHIPPING

**working:** YES  
**threshold:** `99900` cents  
**€998.99:** no free shipping  
**€999.00 / €1250:** free shipping (`Gratis`)

---

## MOLLIE METHODS NL (local mock — key empty)

`ideal`, `creditcard`, `paypal`, `banktransfer`  
Preferred: **ideal**

## MOLLIE METHODS BE (local mock — key empty)

`bancontact`, `creditcard`, `paypal`, `banktransfer`  
Preferred: **bancontact**

> With a real `test_` key these become Mollie’s live-returned **test** methods (not inventable here without the key).

---

## MOLLIE PAYMENT CREATION

**local mock:** YES (returns local checkout URL with `devPayment=`)  
**real Mollie test checkout URL:** NO until `.dev.vars` has `test_` key  
**production webhook from localhost:** not reachable without tunnel / deployed URL

---

## CHECKOUT UI

**working:** YES after fix  
- Delivery selectable card with time + price  
- Payment methods with loading / error / retry  
- Empty arrays no longer silent  
- Sticky summary; free-shipping progress  

---

## WHAT WAS FIXED

1. Local `.dev.vars` now sets `ENVIRONMENT=development` + localhost site URLs  
2. Shipping config centralized; explicit **dev-only** NL/BE fallback rates  
3. Single clear delivery method: Bezorging op adres / 1–3 werkdagen  
4. Mollie errors no longer swallowed → `paymentMethodsError` + UI retry  
5. `GET /api/checkout/payment-methods` added  
6. Mollie methods list parsing hardened; preference NL→iDEAL / BE→Bancontact  
7. Checkout UI loading/error/empty states for delivery + payment  

---

## REMAINING OWNER ACTIONS

1. Put Mollie **test_** API key in **`.dev.vars`** for real Mollie methods + redirect  
2. Confirm production below-€999 shipping rates (today production rates are `null` until set in `shared/commerce.ts` / env)  
3. For real webhook + return testing: use deployed `https://www.allrounddirect.nl` or a tunnel  
4. Before live: set production shipping rates intentionally (do not keep using development fallbacks)
