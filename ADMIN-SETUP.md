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

## Eerste beheerder

1. Maak een gewoon account via de webshop (e-mailverificatie).
2. Wijs de rol lokaal toe:

```bash
node scripts/set-role.mjs --email=jouw@email.nl --role=super_admin --local
```

Remote D1: zelfde command zonder `--local` (met Wrangler-auth).

3. Open `http://localhost:5173/scotdejewish/login`.

Er is geen publieke registratie voor adminrollen.

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
