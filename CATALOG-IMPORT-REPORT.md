# Catalog import report — ALLROUND DIRECT

Bronmap (niet in Git, ongewijzigd): `C:\Users\Tins\Desktop\scraper\Allround\scraped_producten`

De eerdere telling (~518 producten / ~1919 foto's) is een snapshot. De huidige bronmap is leidend.

## Source

- Productmappen gescand: **733**
- Geldig genormaliseerd: **702**
- Ongeldig / ontbrekende JSON: **31**
- Afbeeldingen gescand: **2990**
- Unieke SHA-256 hashes: **2611**
- Exacte image-duplicates (extra kopieën): **379**
- Exacte product-duplicates (URL/SKU): **7 groepen**
- Mogelijke naam-duplicates: **13 groepen** (niet automatisch samengevoegd)

## Validatie

- Waarschuwingen: **10** (o.a. 9 zonder prijs, 1 zonder omschrijving)
- Missing names: **0**
- Missing images: **0**
- Status geïmporteerde producten: **draft** (`source_rights_status = needs_review`)

## R2 (`piccas`)

- Object keys: `products/by-hash/<hash>/full|card|thumb.webp`
- Nieuwe objecten eerste run: **7797** (3 varianten per unieke foto)
- Hervatting: **24** extra (SSL-retries), daarna **0 fouten**
- Payload voor remote D1: `catalog-import/payload.json`
- Geen `r2.dev` public URL; Worker streamt via `/media/*`

## D1 (`cloth` / `e41adef2-8318-483e-9847-de4cb71ca545`)

Het R2-accounttoken heeft **geen D1-rechten**. Remote HTTP-import naar `cloth` is daardoor geblokkeerd.

- Lokale Miniflare D1 (na `db:migrate:local`): **702 products**, **2984 product_images**, **26 categories**, **178 brands**
- Remote `cloth`: migratie `0004_catalog_import.sql` staat in de repo. Cloudflare Git deploy kan die toepassen.
- Daarna in beheer (`/scotdejewish/`): **Verwerk importbatch** (R2 payload → remote D1). Herhaal tot `done: true`.

Maak eventueel een Cloudflare API-token met **D1 Edit** (niet het R2 S3-paar) als je remote migraties vanaf de laptop wilt draaien. Zet dat token alleen in `.env.import.local`. Zet S3 keys **niet** als Worker secrets.

## App

- Publieke API toont alleen `status = active` (bulkimport is draft)
- Admin: filters, bulk publiceren/concept/categorie, Bron-tab, R2-upload
- Media: `GET /media/*` uit `env.MEDIA`, branding valt terug op assets

## Aanbevolen handmatige checks

1. Cloudflare dashboard: migratie 0004 op `cloth` toegepast?
2. Beheer: importbatch tot `done`
3. Random sample: Vloeren, Banken, Tegels, Koelkasten, Keukens, Gastro
4. Rechtenstatus (`needs_review`) vóór publiceren
5. Prijzen in centen controleren (bron `current_price` als eurostring)
6. 12 eerder mislukte R2-uploads: tweede run heeft ze nagezet; spot-check thumbs
