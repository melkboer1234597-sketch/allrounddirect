# Catalog data quality audit

- Products audited: **702**
- Payload products: **702**
- Deterministically mapped: **702**
- Products already clean after automated rules: **316**
- Products automatically repaired: **386**
- Products requiring manual review: **386**
- Image mismatches vs payload hashes: **0**
- Exact duplicate images within a product: **0**
- Suspicious / promotional images marked: **342**
- Products still containing German tokens after normalization: **220**
- Ambiguous categories: **14**
- Possible duplicate product groups: **75**
- Missing pricing: **9**
- Missing images: **0**
- Perceptual near-duplicate pairs: **0**

## Source of truth

Bronmap ontbreekt op deze machine. SHA-256-hashes en bestandsnamen uit catalog-import/payload.json zijn de bron van waarheid voor image-ownership.

Local expected path: `C:\Users\Tins\Desktop\scraper\Allround\scraped_producten`

## Deterministic repairs applied or prepared

- Cross-product reused graphics and banner-like aspect ratios are marked `image_status = suspicious` and hidden from public galleries.
- Exact same-hash duplicates within one product keep the first row.
- Primary image is the highest-scoring remaining product photo, not blindly `image_01`.
- German ecommerce phrasing is normalized to Dutch where the meaning is explicit; original name is stored in `original_source_name`.
- Technical facts found in source text are copied into `specifications_json` only when present.
- `price_on_request` is set only when no selling price exists.
- Wicanders cork floors move to `parket`; wasmachine-ombouwkasten move to `kasten`.

## Manual review

Open **Beheer → Cataloguskwaliteit**. Filters cover suspicious images, German text, missing price, duplicates and ambiguous categories.

Do not merge title-similar products automatically.
