# AllRound Direct — foundation audit

## Nu gebouwd

- React/Vite storefront met header, homepage, categorie- en infopagina’s, footer.
- Hono Worker (`/api/health`, `/sitemap.xml`, `/robots.txt`).
- SEO-helper (`SeoHead`): unieke title, description, canonical, robots, Open Graph, Twitter.
- JSON-LD: Organization + WebSite (homepage). Geen adres/telefoon/socials verzonnen.
- Catalogustypes + service-laag; demo-producten centraal in `src/data/demo-products.ts`.
- Productkaarten via TanStack Query (`getFeaturedProducts`).

## Production-ready (fundering)

- Routing, metadata per publieke pagina, noindex op private routes.
- robots.txt + sitemap-architectuur (statisch in `public/`, Worker kan origin-absolute URL’s serveren).
- Semantic landmarks (header/nav/main/footer), skip-link, form labels, focus-visible, mobiel menu.
- LCP: hero preload, geen lazy-load op hero.
- Types voor later D1-productmodel (sku, voorraad, leverancier, R2-images, btw, outlet, B2B).
- Let op: de SPA geeft HTTP 200 op onbekende paden; indexering wordt afgevangen met `noindex`. Absolute sitemap-URL’s volgen na `VITE_SITE_URL`.

## Nog mock

- Homepage-producten en `/product/:slug` (layout, **noindex**, geen Product JSON-LD).
- Prijzen, voorraad, checkout, account, offerteformulier, nieuwsbrief-submit.
- Placeholder copy op categorie- en servicepagina’s.

## Later koppelen

| Onderdeel | Doel |
| --- | --- |
| **D1** | Producten, orders, klanten, content |
| **R2** | Geoptimaliseerde productbeelden (WebP/AVIF; masters in `allround-direct-assets-ready` niet overschrijven) |
| **Mollie** | Alleen Worker, nooit frontend |
| **Resend** | Transactioneel + nieuwsbrief |
| **Admin** | Catalogus, orders, `/admin` blijft noindex |
| **Productimport** | Leveranciersfeeds → D1 |
| **Orders/checkout** | Winkelwagen → Worker → Mollie |
| **Cloudflare** | Pages (frontend) + Worker + D1-binding; `VITE_SITE_URL` voor canonical/sitemap |

## Beelden

Huidige PNG’s zijn groot (ca. 2 MB per hero/categorie). Later afgeleiden naar WebP/AVIF + srcset; originelen behouden.

## JSON-LD later

Helpers in `src/lib/seo.ts`: Product, Offer, BreadcrumbList, FAQPage. Alleen vullen met live data.
