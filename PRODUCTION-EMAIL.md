# Production email status — AllRound Direct

**Date:** 2026-09-15  
**Origin:** https://allrounddirect.com  
**Provider:** Resend  

## Status

| Item | Result |
|------|--------|
| Architecture | Existing EmailService reused (no duplicate stack) |
| `EMAIL_FROM` var | `AllRound Direct <bestellingen@allrounddirect.com>` |
| `EMAIL_REPLY_TO` var | `support@allrounddirect.com` |
| `RESEND_API_KEY` secret | **NOT CONFIGURED** on Worker |
| Domain verification | **MANUAL CHECK** in Resend dashboard |
| Idempotency | `email_events.event_key` unique (`order:{id}:payment-confirmed`) |
| Guest CTA | Secure `/bestelling/bevestiging?order=&token=` |
| Auth links | Better Auth `baseURL` = site origin |
| Admin | Events + Resend id + sent time + retry |

## Owner actions

1. Verify `allrounddirect.com` in Resend (copy SPF/DKIM from Resend into Cloudflare DNS — do not invent values).
2. Set the API key:

```bash
npx wrangler secret put RESEND_API_KEY
```

3. Send a Resend dashboard test to an approved inbox.
4. Run one Mollie **test** checkout after shipping rates + Resend are live; confirm one payment-confirmation email.
5. Bootstrap admin if needed to inspect order email events.
