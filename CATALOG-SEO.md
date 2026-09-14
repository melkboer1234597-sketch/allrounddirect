# Catalogus- en facet-SEO

## Indexeerbaar

- Taxonomie zonder query: `/meubels`, `/meubels/banken`, `/meubels/banken/hoekbanken`.
- Paginatie: `/meubels?page=2` (alleen `page`, geen andere querykeys). Canonical is diezelfde URL, niet pagina 1.
- Producten: `/product/[slug]` zodra live en `index`.

## Standaard noindex,follow

Alle andere querycombinaties (sort, prijs, attributen, `q` op categorie):

- Meta `noindex,follow` zodat producten via links bereikbaar blijven.
- Canonical naar het schone categoriepad (zonder filterquery).

Interne zoekresultaten `/zoeken` zijn `noindex,nofollow` en staan niet in de sitemap.

## Niet doen

- `?type=bank&shape=hoek` als primaire SEO-route.
- Automatisch duizenden facet-URL’s indexeren.
- Fake review-schema of Offer zonder zichtbare prijs.

Gecureerde landings horen in de taxonomy (`/vloeren/pvc/klik-pvc`), niet als querystring.
