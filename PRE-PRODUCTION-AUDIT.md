# Pre-productie-audit — AllRound Direct

Extern bureau-oordeel, 14 september 2026. Geen “het werkt wel”: de shop is een sterke storefront-architectuur, **niet** live-ready voor omzet.

In deze pass zijn redelijke code- en UX-gaten gedicht (winkelwagen lokaal, offerteformulier, servicepagina’s, open redirect, toetsenbordvallen, dode eindes, Engelse checkout-copy, nep-nieuwsbrief). Wat hieronder staat is wat **overblijft**.

---

## Critical

Niets in de codebase blokkeert een technische deploy, maar **live verkoop** is onverantwoord tot dit buiten de repo is geregeld:

1. **Geen echte catalogus.** Demo-producten, demo-merken, lokale winkelwagen. Mollie-plaatsen blijft geblokkeerd tot bewuste live-config.
2. **Juridische teksten zijn concept.** Bedrijfsgegevens, privacy, voorwaarden en herroeping moeten door een jurist en met echte KvK-gegevens.
3. **HTTP-status voor dode URL’s.** Cloudflare SPA-fallback kan **200** teruggeven op niet-bestaande paden. Crawlers en monitoring zien geen echte 404 tot de Worker dat afdwingt.
4. **Productiegeheimen en bindings ontbreken** (zie slot). Zonder D1, auth-secret, Turnstile en mail is account/contact/offerte in productie kapot of onveilig.

---

## High

1. **Geen geautomatiseerde tests.** Geen unit-, integratie- of E2E-suite. Auth, checkout, IDOR en Turnstile zijn code-review, geen CI-bewijs.
2. **SEO-tags in de client.** Title, canonical, robots en JSON-LD worden na hydratie gezet. Eerste HTML is de homepage-shell. Voor duizenden URL’s is prerender/SSR later nodig.
3. **301’s alleen als de Worker eerst draait.** `Navigate` in React blijft 200. `run_worker_first` dekt bekende aliases; nieuwe redirects moeten daar bij.
4. **Winkelwagen is lokaal (`localStorage`).** Geen server-cart, geen voorraadreservering, geen prijsbron van D1. Klaar om de flow te oefenen, niet om te factureren.
5. **Facturen en retouren in het account** zijn toelichting, geen werkende modules. Uitleg en uitwegen staan er; beloven dat “mijn facturen” werkt mag niet.

---

## Medium

1. Mega-menu op desktop: hover/focus, Escape, blur. Geen pijltjestoetsen tussen kolommen.
2. Zoeksuggesties: geen visuele “laden”-staat; recente zoekopdrachten in `localStorage`.
3. Filterdrawer: focusval en Escape; desktopfilters zonder dialog.
4. Hero/LCP: preload alleen op home. Fonts van Google blijven render-blocking.
5. Logo-filters (`mix-blend-mode`) zijn een visuele hack; controleer contrast op echte PNG’s.
6. `shared/taxonomy-paths.ts` moet met `src/data/taxonomy.ts` meegroeien.
7. Admin-UI is functioneel, geen gepolijste backoffice. Kostprijs blijft admin-only (geen lek in de storefront-API aangetroffen).

---

## Low

1. Horizontale category-rail op smalle schermen heeft geen zichtbare scrollbar (bewuste keuze; swipe moet ontdekt worden).
2. Paginatie `rel=prev/next` is ondersteunend.
3. Account-navigatie op mobiel is een `<select>` (bruikbaar, niet elegant).
4. Geen visuele regressietests op de gevraagde breakpoints (320–1920). Layout is herzien in CSS; niet in een device lab geklikt in deze sessie.

---

## Wat in deze audit is hersteld

- Open redirect via `?volgende=` / Better Auth `callbackURL`.
- Lege winkelwagen naar afrekenen; product voegt nu lokaal toe; headerbadge; afrekenen toont regels.
- Placeholder-doodlopers: over ons, klantenservice, FAQ, montage, projecten, offerte (formulier + canonical `/zakelijk/offerte`).
- Nieuwsbrief die deed alsof aanmelden werkte: vervangen door eerlijk contact.
- Engelse “Checkout”-copy.
- Dubbele H1 in account-layout.
- Cookie-banner en voorkeuren: dialog + focustrap; menu en filterdrawer idem; favorieten in mobiel menu; nested taxonomy.
- `/offerte` 301 naar `/zakelijk/offerte`; uit de sitemap gehaald.
- Buttons: `type="button"` default, `onClick` op links, consistente hoogte.

`npm run typecheck`, `npm run lint`, `npm run build`: geslaagd. **Tests: geen suite aanwezig.**

---

## Restpunten die externe configuratie of derden vereisen

Deze kan geen frontend sluiten:

| Onderdeel | Waarom |
| --- | --- |
| Mollie API-keys + `MOLLIE_MODE` / `MOLLIE_ALLOW_LIVE` | Betalen. Live blijft hard geblokkeerd tot bewust aangezet. |
| Resend (of andere mail) + from-adres | Wachtwoordreset, verificatie, contactbevestiging. |
| Turnstile sitekey + `TURNSTILE_SECRET` | Server-siteverify. Zonder secret in production: weigering (goed). In development bestaat een fallback. |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `SITE_URL` | Sessies, cookies, canonical host (www vs. apex). |
| Cloudflare D1 productie-database + echte `database_id` | Orders, users, producten. Huidige id is placeholder. |
| R2 (of andere media) | Live productbeelden op schaal. Nu lokale `/media`. |
| Domein + TLS + redirects apex/www | Canonical origin. |
| Juridische review | KvK, adres, privacy, voorwaarden, herroeping, cookies. |
| Echte producten + leverancierskoppeling | Import, voorraad, prijs, EAN, geen demo-indexatie. |
| Google Business Profile / Search Console | Geen code. |
| AllRoundKlussenbedrijf kruislinks | Zie `SEO-BACKLINK-PLAN.md`. |

**Oordeel:** geschikt als pre-productie-storefront en als basis voor import. **Niet** morgen open voor betaalde bestellingen.
