# Account, authenticatie en dataretentie

AllRound Direct gebruikt **Better Auth** (Hono + Drizzle + Cloudflare D1) voor klantdaccounts. Er is geen zelfgebouwd sessiesysteem. Checkout blijft later mogelijk **zonder verplicht account**.

## Omgeving

Zie `.env.example` en `.dev.vars.example`.

| Variabele | Waar | Toelichting |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | Worker (geheim) | Minimaal 32 tekens, uniek per omgeving |
| `BETTER_AUTH_URL` / `SITE_URL` | Worker | Publieke origine (lokaal `http://localhost:5173`) |
| `TURNSTILE_SECRET` | Worker (geheim) | Alleen server-side. Siteverify is verplicht |
| `VITE_TURNSTILE_SITE_KEY` | Frontend | Publieke site key |
| `RESEND_API_KEY` | Worker (geheim) | Later. Leeg in development: lokale e-mailoutbox |
| `EMAIL_FROM` | Worker | Afzender voor Resend |

Sessiecookies: **HttpOnly**, **SameSite=Lax**, **Secure in production**. Geen tokens in `localStorage`.

Frontend route-guards zijn geen beveiliging. Account-API’s controleren de sessie server-side.

## E-mail

`worker/services/email.ts` is de EmailService-abstractie. Resend volgt. In development zonder API-key gaan verificatie- en resetmails naar `dev_email_outbox` (alleen localhost). Tokens worden niet gelogd.

## Turnstile

Actief (of voorbereid) op registratie, wachtwoordreset, guest order lookup, en login na mislukte pogingen. Contactformulieren gebruiken dezelfde `verifyTurnstile`-helper.

Zonder `TURNSTILE_SECRET` in development is er een **duidelijk gemarkeerde fallback**. Dat mag nooit in productie.

## Accountverwijdering vs orderdata

- `customer_profiles.accountStatus` wordt `deletion_requested`.
- Inlogsessies worden ingetrokken; marketingopt-in gaat uit.
- `orders.userId` is nullable (`ON DELETE SET NULL`). Gast-e-mail en adres-snapshots blijven op de order voor wettelijke bewaarplicht (facturen, belasting, garantie).
- Wishlist/adressen hangen aan de user; die kunnen later worden opgeschoond. Orders niet automatisch wissen.

## 2FA

Nog niet ingeschakeld. Better Auth `twoFactor` plugin kan later op deze sessie-infrastructuur.

## Wishlist

Ingelogd: `wishlist_items`. Gast: `localStorage` (`allround-direct.wishlist.v1`). Merge na login volgt later.
