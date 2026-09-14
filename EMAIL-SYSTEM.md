# Transactional email system — AllRound Direct

Provider: **Resend** (HTTP API, Cloudflare Workers-compatible).  
No Resend SDK / Node-only dependencies.

## Behaviour (chosen)

For instant methods (iDEAL, Bancontact, cards, PayPal):

1. Checkout creates order `pending_payment` — **no confirmation email yet**
2. Mollie webhook confirms payment → **one** rich mail: order confirmation  
   Subject: *Bedankt voor uw bestelling bij AllRound Direct*

For pending methods (e.g. bank transfer):

1. `ORDER_CREATED` with `awaitingPayment=true` → *We hebben uw bestelling ontvangen* (wacht op betaling)
2. When paid → same confirmation as above (idempotent key differs)

Payment failed / canceled / expired → *Betaling voor bestelling … niet afgerond* with CTA “Betaling opnieuw proberen”.

Checkout and webhooks **never fail** because Resend is missing or errors.

## Cloudflare secrets (production)

Set with `wrangler secret put …` on worker `allrounddirect`:

| Secret | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Verified sender, e.g. `AllRound Direct <noreply@your-domain.nl>` |
| `EMAIL_REPLY_TO` | Optional reply-to address |

Also configure (vars or secrets):

| Name | Purpose |
| --- | --- |
| `SITE_URL` or `PUBLIC_SITE_URL` | Absolute origin for logo + CTA links |
| `ENVIRONMENT` | `production` when live |

Local `.dev.vars` / `.env.example` may leave `RESEND_API_KEY` empty.

## Architecture

| Piece | Path |
| --- | --- |
| Central service | `worker/services/email.ts` |
| Lifecycle bridge | `worker/services/order-events.ts` → `emitOrderEvent` |
| Templates | `worker/email/templates.ts` + `layout.ts` |
| Template IDs | `shared/email-templates.ts` |
| Idempotency | `email_events.event_key` UNIQUE (migration `0007_email_events.sql`) |
| Attempt log | `email_logs` (no full body) |
| Dev outbox | `dev_email_outbox` + `[EMAIL DEV]` console |

Named methods on `EmailService`:

- `sendOrderConfirmation`
- `sendPaymentFailed`
- `sendOrderReceivedPending`
- `sendShipmentNotification` (supports partial)
- `sendDeliveryConfirmation`
- `sendRefundConfirmation`
- `sendCancelled`
- `sendReturnRequested` / `sendReturnReceived`
- `sendQuoteReceived`
- `sendPasswordReset` / `sendEmailVerification`

## Idempotency keys (examples)

- `order:{uuid}:payment-confirmed`
- `order:{uuid}:payment-failed`
- `order:{uuid}:shipment:{shipmentId}`
- `order:{uuid}:delivered`
- `quote:{id}:received`

Duplicate Mollie webhooks do not resend mail.

## Admin preview

`/scotdejewish/email-preview`  
API: `GET /api/admin/email-preview?template=order_confirmation`  

Staff-only, **blocked in production**. Fixture data only — never sends.

## Dev without Resend

```
[EMAIL DEV]
template: order_confirmation
recipient: sa***@example.com
order: ARD-2026-000123
```

Message also stored in `dev_email_outbox` (peek via `GET /api/dev/emails?to=`).
