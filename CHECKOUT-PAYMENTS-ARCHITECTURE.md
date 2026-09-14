# Checkout & payments architecture — AllRound Direct

## Journey

Cart (localStorage identifiers + qty)  
→ `/afrekenen` (NL/BE)  
→ `POST /api/checkout/quote` (server prices)  
→ `POST /api/checkout/place` (order `pending_payment` + Mollie payment)  
→ Redirect to Mollie  
→ `POST /api/payments/mollie/webhook` (verify with Mollie, never trust body alone)  
→ `/bestelling/bevestiging?order=&token=` polls `GET /api/checkout/status`  
→ Account `/account/bestellingen` when `userId` set · Admin `/scotdejewish/orders`

## Trust boundaries

- Browser never sees `MOLLIE_API_KEY`.
- Frontend sends only slug/qty + customer fields; **prices always from D1**.
- Redirect return is **not** proof of payment; webhook + `getPayment` are authoritative.
- Idempotency: `orders.idempotency_key` (place) + `processed_webhooks` (`mollie:{paymentId}:{status}`).
- Failed/canceled/expired payments leave the order `pending_payment` so **Opnieuw betalen** can create a new payment without duplicating the order.

## Country & methods

- `GET /api/checkout/context` suggests country from `request.cf.country` when present; otherwise defaults to NL (no fake geolocation).
- Customer-selected shipping country is authoritative.
- Delivery countries: **NL, BE** only (Zod + shared validators).
- Payment methods from Mollie Methods API (or dev mock), sorted by NL/BE preference lists — never invent availability.
- `restrictPaymentMethodsToCountry` + locale `nl_NL` / `nl_BE` (`fr_BE` prepared).

## Money

- Integer cents in D1 and services (`shared/money.ts`).
- Mollie amount: `{ currency: "EUR", value: "187.89" }` via `centsToMollieValue`.

## Delivery

- `worker/services/delivery.ts` — extensible methods; `amountCents: null` means **not configured** (charged 0, UI says “Volgens leverancier”). Do not invent flat rates.

## Key files

| Area | Path |
| --- | --- |
| Shared country/locale | `shared/checkout.ts` |
| Money | `shared/money.ts` |
| Mollie | `worker/services/mollie.ts` |
| Place / quote / retry | `worker/services/checkout.ts` |
| Routes | `worker/routes/checkout.ts`, `payments.ts` |
| Sync / webhook | `worker/services/payment-sync.ts` |
| UI | `src/pages/CheckoutPage.tsx`, `OrderConfirmationPage.tsx` |
| Migration | `drizzle/0006_checkout_foundation.sql` |

## Environments

- `MOLLIE_MODE=test|live`, live requires `MOLLIE_ALLOW_LIVE=true` + production.
- Dev without key: mock payments (`dev_mollie_payments`) + `POST /api/dev/payments/:id/settle`.
- Admin sees label only (`Mollie testmodus` / livemodus) — never the key.

## Order numbers

Human-friendly `ARD-YYYY-######` via `order_number_counters`. Internal security uses order id + confirmation token.
