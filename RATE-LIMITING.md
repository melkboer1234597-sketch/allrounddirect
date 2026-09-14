# Rate limiting en Cloudflare WAF (productie)

De worker heeft D1-gebaseerde limieten. Dat is **geen vervanging** voor edge rate limiting. Configureer in Cloudflare vóór livegang:

## Applicatielimieten (nu)

| Endpoint | Limiet | Toelichting |
| --- | --- | --- |
| Registratie | 5 / uur / IP | Plus Turnstile |
| Login | 8 / 15 min / IP+e-mail | Turnstile na 2 mislukte pogingen |
| Wachtwoordreset | 5 / uur / IP en 3 / uur / e-mailhash | Altijd hetzelfde antwoord, geen enumeratie |
| Guest order lookup | 5 / 15 min / IP+e-mailhash | Alleen bij juiste combinatie |

Better Auth heeft daarnaast ingebouwde rate limits op auth-routes.

## Cloudflare (later, productie)

1. **WAF custom rules / Rate limiting rules**
   - `POST /api/auth/sign-in/email` en `POST /api/auth/sign-up/email`: streng, per IP
   - `POST /api/auth/request-password-reset` (en eventuele `/forget-password`): streng, per IP
   - `POST /api/guest-orders/lookup`: streng, per IP
   - `POST /api/account/*` voor anonieme misbruikpatronen
2. **Bot Fight Mode** of Super Bot Fight, plus Turnstile op de genoemde formulieren
3. **Managed ruleset** OWASP + Cloudflare managed
4. Geen `TURNSTILE_SECRET` of `BETTER_AUTH_SECRET` in frontend of repo
5. Cookies alleen over HTTPS (`ENVIRONMENT=production`)

Lokaal: `npm run db:migrate:local` na `npm run db:generate`.
