# Beheerplatform (ALLROUND DIRECT)

De URL `/scotdejewish/` is alleen de locatie van het panel. **De URL is geen beveiliging.** Elke `/api/admin/*` call vereist een ingelogde sessie plus een staff-rol in de database.

## Rollen

| Rol | Toegang |
| --- | --- |
| `customer` | Geen beheer (403 op admin API) |
| `support` | Lezen orders/klanten |
| `catalog_manager` | Catalogus + imports |
| `order_manager` | Orders/retouren/offertes schrijven |
| `admin` | Bijna alles behalve rolwijziging |
| `super_admin` | Inclusief gebruikersrollen |

Publieke registratie zet altijd `customer`. Extra velden `role` in signup worden genegeerd en na insert opnieuw op `customer` gezet.

## Eerste beheerder (voorkeur)

Gebruik Better Auth-hashing via bootstrap. **Zet nooit een wachtwoord in Git, `.env*`, migrations of docs.**

```powershell
# PowerShell — wachtwoord alleen in dit proces
$env:ADMIN_BOOTSTRAP_EMAIL = "admin@allrounddirect.com"
$secure = Read-Host -AsSecureString "Admin password"
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$env:ADMIN_BOOTSTRAP_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

# Lokaal
npm run admin:bootstrap -- --local

# Productie D1 (Wrangler moet op het juiste Cloudflare-account staan)
npm run admin:bootstrap -- --remote

# Daarna wachtwoord uit de shell halen
Remove-Item Env:ADMIN_BOOTSTRAP_PASSWORD
Remove-Item Env:ADMIN_BOOTSTRAP_EMAIL -ErrorAction SilentlyContinue
```

Idempotent: tweede run bevestigt `super_admin` en `email_verified` zonder het wachtwoord te wijzigen. Wachtwoord rotatie alleen met `--reset-password`.

Alleen rol wijzigen (bestaand account):

```bash
npm run admin:set-role -- --email=admin@allrounddirect.com --role=super_admin --remote
```

Open daarna `/scotdejewish/login` (productie: `https://allrounddirect.com/scotdejewish/`).

Er is geen publieke registratie voor adminrollen. Password reset loopt via de normale Better Auth + Resend flow.

## Security

- Server-side RBAC (`worker/auth/rbac-guard.ts`)
- Mutaties: vertrouwde `Origin` + header `x-admin-intent: 1` (CSRF)
- Turnstile + extra rate limit op admin-login (`x-admin-login: 1`)
- HttpOnly sessiecookies (Better Auth)
- Inkoopprijs en marge alleen via `/api/admin/products/:id`
- Production build zonder sourcemaps
- robots: `Disallow: /scotdejewish` + `noindex,nofollow` op alle adminpagina’s
- Geen links naar beheer vanaf de publieke site

## 2FA (later)

Better Auth heeft een onderhouden `twoFactor` TOTP-plugin. Die kan later op staff-accounts worden gezet (`requireEmailVerification` blijft). Geen custom TOTP in deze codebase.

## Orderstatus

Statuswijzigingen volgen `shared/order-machine.ts`. Ongeldige sprongen geven 400.

## Imports

Flow: upload CSV → kolommen mappen → valideren → dry-run → bevestigen. Geen massainsert zonder die stappen.
