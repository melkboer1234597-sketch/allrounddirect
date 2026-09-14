# Catalog storefront QA — AllRound Direct

Date: 2026-09-14  
Scope: homepage, category grids, PDP, language, images, responsiveness, card performance.

## Summary

Live storefront inspected at `http://localhost:5173` with remote D1 catalog. Checkout foundation work continued in the same session; catalog findings below.

## Homepage

| Check | Result |
| --- | --- |
| Duplicate category cards | **Pass** — single grid: Meubels, Vloeren, Keuken, Koelen & Vriezen, Horeca, Wonen, Outlet |
| Category labels | **Pass** — Dutch labels match links |
| Featured diversity | **Pass** — featured endpoint mixes multiple category slugs |
| Spacing / blank areas | **Pass** on mobile hero; professional density |
| Incorrect promotional banners on PDP | N/A on homepage |

## Product grids (sampled)

Populated categories audited via API (≥10 products where available):

| Category | Sampled | Card variants | No image | Price+Op aanvraag conflict |
| --- | --- | --- | --- | --- |
| meubels | 12 / 299 | 12 cardSrc | 0 | 0 |
| vloeren | 12 / 188 | 9 cardSrc | 3 | 0 |
| keuken | 12 / 49 | mostly card | low | 0 |
| koelen-vriezen | 12 / 38 | mostly card | low | 0 |
| horeca | 12 / 12 | mostly card | low | 0 |
| wonen | 12 / 97 | mostly card | low | 0 |
| huishouden | 12 / 19 | mostly card | low | 0 |

Price formatting uses `nl-NL` currency helpers. No contradictory “Op aanvraag” with a numeric price in samples.

## PDP (3 per major category)

| Check | Result |
| --- | --- |
| Gallery present when images exist | Pass |
| Title / price from server | Pass |
| Add to cart visible | Pass (except price-on-request / business-only) |
| Specs structured via presentation config | Pass (sparse data → few key specs) |
| Related products same category | Pass |
| No giant promotional banner overlays | Pass |

## Language

German residual content remains in **product titles/descriptions/specs** from source import (e.g. `aus Glas`, Wineo German marketing strings, some encoding mojibake like `VielfÔö£├▒ltig`).

**Not translated (correct):** brand names (Wicanders, Wineo, SMEG), collection/model codes, SKUs.

## Image quality

| Issue | Notes |
| --- | --- |
| Card vs full | Most products expose `cardSrc` ≠ full `src` — cards use optimized variants |
| Missing images | Some vloeren products still have no gallery image |
| Object-fit | Furniture/flooring `cover`; appliances `contain` |
| Banner-like / wrong product | Flagged for manual review where German title vs image uncertain |

## Performance

- Product cards prefer `image.cardSrc` when present.
- Lazy-load via `loading="lazy"` on cards.
- PDP uses full gallery images.

## Responsiveness

Homepage checked at mobile viewport (~390). Layout: sticky header, full-bleed hero, stacked CTAs — usable. Wider breakpoints rely on existing CSS grid (`sm`/`md`/`lg`); no layout-breaking regressions introduced in this pass.

## Issues found

1. **Fake brands** — scraper brands like `Salontafel`, `Wasmachinenumbvanchrank` shown as brand.
2. **German / mojibake titles** — residual import quality (manual).
3. **Missing images** — subset of vloeren (and possibly others).
4. **Sparse specifications** — many PDPs correctly show few/no key specs (no invented data).

## Issues automatically fixed

1. **Brand sanitization** in `worker/lib/catalog-map.ts` — suppress category-word / German garbage brands on the storefront.
2. **Checkout/cart copy** — removed “Mollie not live” dead-end messaging; cart/checkout now connected.
3. Presentation/spec noise filters (earlier) for German warranty fragments.

## Remaining manual-review products

Examples (not exhaustive):

- Titles containing `aus Glas`, `zum Klicken`, `Vielfältig`, `Strapazier…`
- Brands previously `Salontafel` / `Wasmachinenumbvanchrank` (now hidden; titles may still need rename)
- Vloeren without images
- Wineo products with encoding-corrupted names
- Horeca/kitchen products with German capacity wording in the title (`Brenner`, `Klimazone`)

Re-run catalog quality audit when source scrapes are available on this machine.

## Build

`npm run typecheck` and production `npm run build` required after checkout work (see session completion).
