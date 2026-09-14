# SEO-foundation — AllRound Direct

Architectuur voor duizenden categorie-, subcategorie- en product-URL’s zonder duplicate content of crawltraps. Demo-catalogus is **niet** live indexeerbaar.

## Gereed

- Stabiele taxonomy-URL’s tot drie niveaus, bijv. `/meubels/banken/hoekbanken`, `/vloeren/pvc/klik-pvc`, `/horeca/koeling`. Producten: `/product/[slug]` zonder query-ID’s.
- Categoriepagina: één H1, korte intro boven de listing, langere copy eronder, chips naar kinderen, breadcrumbs, CollectionPage + BreadcrumbList JSON-LD.
- Filters: querycombinaties (inclusief sort/prijs) krijgen `noindex,follow`. Canonical van gefilterde views wijst naar het schone pad. Paginatie `?page=N` is crawlbaar, zelf-canonical, niet blind naar pagina 1.
- Productlinks in de listing zijn gewone `<a>`/`<Link>`-URL’s; paginering ook.
- Demo-producten: `noindex,nofollow`, geen Product JSON-LD. Live Product+Offer alleen met echte prijs; availability/brand/SKU/GTIN alleen indien aanwezig. Geen AggregateRating.
- Sitemap-index: `sitemap.xml` → static / categories / products / content. Product-sitemaps splijten vanaf ~40k URL’s. Alleen canonieke indexeerbare paden. Geen admin, account, cart, checkout, zoeken, filters, demo.
- `robots.txt` + meta robots: account, favorieten, winkelwagen, afrekenen, bestelling, zoeken, admin (`/scotdejewish`), `/api`. Commentaar: robots.txt is geen beveiliging.
- 301-klaar: `shared/redirects.ts`; Worker + SPA `Navigate` voor oude 2-niveau-paden (`/meubels/hoekbanken` → `/meubels/banken/hoekbanken`).
- Contenthub `/advies` met clusters (leeg toegestaan) en drie inhoudelijke gidsen, geen artikel-spam.
- Interne links: home → hoofdgroepen; groepen → subgroepen; product → categorie; vloeren → advies/montage; horeca/zakelijk → offerte. Beschrijvende ankers.
- Open Graph, Twitter cards, canonical, titles/descriptions via `SeoHead`.
- 404: zoekveld, populaire categorieën, home. Geen grapjestekst.
- Core Web Vitals-basis: hero-preload alleen op de homepage (`SeoHead.preloadImage`), responsive `sizes` op kaarten, lazy images elders, geen globale hero-preload in `index.html`.

## Later nodig

- Echte HTTP-status 404 (nu SPA-fallback: onbekende paden kunnen **200 + client-404** zijn). Worker-HTML 404 of `run_worker_first` voor onbekende paden.
- Live productimport + indexeerbare product-URL’s in D1 (`status=active`, robots zonder `noindex`).
- Gecureerde facet-landings (bewust in taxonomy), nooit autogeneratie van `?type=&shape=`.
- SSR of prerender voor title/canonical in de eerste HTML-bytes (nu client-side upsert).
- Related products op productpagina’s uit echte catalogusdata.
- Extra adviesartikelen alleen met vakinhoud (koelcapaciteit, horecakeuken, keukennismaten).
- `rel=prev/next` is ondersteunend; Google gebruikt vooral interne listing-links.
- Code splitting van admin/legal-bundles (storefront blijft de prioriteit).
- CLS: vaste image-aspecten zijn gezet; bij live media width/height verplicht houden.
- INP: filters committen via gewone navigatie; zware admin-JS niet op de storefront laden (volgende pass).

## Product-import aandachtspunten

- Unieke, stabiele `slug`. Geen sessie- of filterparameters in de product-URL.
- `seo_title` / `seo_description` desnoods leeg: val terug op naam + korte, ware omschrijving. Geen keyword stuffing.
- `canonical_override` alleen bij samengevoegde SKU’s; default `/product/{slug}`.
- `robots`: draft/archived/`noindex`. Sitemap neemt alleen `active` zonder `noindex`.
- Schema: prijs incl. btw zoals op de pagina; Offer weglaten zonder prijs; GTIN/EAN alleen bij gevalideerd cijfer; brand alleen bij echte merknaam; geen review-aggregatie importeren of verzinnen.
- Categorie-ID’s mappen op de taxonomy-paden (`/root/child` of `/root/child/leaf`), niet op queryfilters.
- Afbeeldingen: echte alt, width/height, geen generieke stock zonder rechten.
- Voorraad: `unknown` liever dan een verzonnen “op voorraad”.
- Demo-SKU’s en demo-merken nooit publiceren als live.

## Cloudflare productie aandachtspunten

- Zet `VITE_SITE_URL` / `SITE_URL` op de canonieke host (www vs. apex, https). Canonicals volgen die origin.
- `wrangler.jsonc` `run_worker_first`: sitemaps, robots, bekende 301’s. Product-sitemaps komen uit D1 via de Worker; de Vite-build schrijft een lege `sitemap-products.xml` als fallback.
- Assets `not_found_handling: single-page-application` blijft tot er een Worker-404 is: crawlers zien dan 200 op dode URL’s. Plan: Worker checkt bekende routes of laat ASSETS 404 geven voor niet-bestaande paden.
- 301’s moeten in de Worker blijven (niet alleen React `Navigate`), anders blijft de status 200.
- Cache: sitemaps `Cache-Control` max-age 5 minuten in de Worker; purge na grote import.
- `robots.txt` blokkeert crawlen van private paden; authenticatie blijft verplicht voor admin. Disallow is geen autorisatie.
- Geen filter-URL’s in de sitemap. Paginatie-URL’s hoeven niet in de sitemap als producten via categoriepagina 1+ interne links bereikbaar zijn; pagina 2+ blijft crawlbaar via `rel` en listing-links.
- Trailing slash: canonicals strippen trailing slashes (behalve `/`).
- Turnstile, account en checkout blijven noindex; niet in Search Console als landings rapporteren.

Zie ook `CATALOG-SEO.md` (filters/paginatie) en `SEO-BACKLINK-PLAN.md` (links buiten de codebase).
