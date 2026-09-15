# Transactional email system — AllRound Direct

Provider: **Resend** (HTTP API, Cloudflare Workers-compatible).  
Official site origin: **https://allrounddirect.com**

## Behaviour

For instant methods (iDEAL, Bancontact, cards, PayPal):

1. Checkout creates order `pending_payment` — **no confirmation email yet**
2. Mollie webhook confirms payment → **one** rich mail: order confirmation  
   Subject: *Bedankt voor uw bestelling bij AllRound Direct*

For pending methods (e.g. bank transfer):

1. `ORDER_CREATED` with `awaitingPayment=true` → *We hebben uw bestelling ontvangen*
2. When paid → same confirmation as above (idempotent key differs)

Payment failed / canceled / expired → *Betaling voor bestelling … niet afgerond* with CTA “Betaling opnieuw proberen”.

Checkout and webhooks **never fail** because Resend is missing or errors.

## Production sender

Configured via Worker vars (not secrets):

| Var | Value |
| --- | --- |
| `EMAIL_FROM` | `AllRound Direct <bestellingen@allrounddirect.com>` |
| `EMAIL_REPLY_TO` | `support@allrounddirect.com` |

## Cloudflare secrets

```bash
npx wrangler secret put RESEND_API_KEY
```

Optional if you prefer secrets over vars for from/reply:

```bash
npx wrangler secret put EMAIL_FROM
npx wrangler secret put EMAIL_REPLY_TO
```

Also ensure:

| Name | Purpose |
| --- | --- |
| `SITE_URL` / `PUBLIC_SITE_URL` | `https://allrounddirect.com` |
| `ENVIRONMENT` | `production` |

## Resend domain verification (Cloudflare DNS)

In Resend → Domains → add `allrounddirect.com`.  
Resend shows the exact SPF / DKIM / (optional) DMARC records to create.  
**Do not invent DNS values** — copy them from the Resend dashboard into the Cloudflare DNS zone for `allrounddirect.com`.

Until the domain is verified, Resend will reject sends from `bestellingen@allrounddirect.com`.

## Architecture

| Piece | Path |
| --- | --- |
| Central service | `worker/services/email.ts` |
| Lifecycle bridge | `worker/services/order-events.ts` → `emitOrderEvent` |
| Templates | `worker/email/templates.ts` + `layout.ts` |
| Template IDs | `shared/email-templates.ts` |
| Idempotency | `email_events.event_key` UNIQUE |
| Attempt log | `email_logs` |
| Admin retry | `POST /api/admin/orders/:id/emails/:eventId/retry` |

## Idempotency keys

- `order:{uuid}:payment-confirmed`
- `order:{uuid}:payment-failed:{paymentId}`
- `order:{uuid}:shipment:{shipmentId}`
- `order:{uuid}:delivered`
- `quote:{id}:received`

Duplicate Mollie webhooks do not resend mail.

## Guest order CTA

Secure link:

`https://allrounddirect.com/bestelling/bevestiging?order=…&token=…`

Logged-in:

`https://allrounddirect.com/account/bestellingen/{orderNumber}`

## Admin

Order detail shows email template, recipient, status, Resend message id, sent time, and retry for failed events.
