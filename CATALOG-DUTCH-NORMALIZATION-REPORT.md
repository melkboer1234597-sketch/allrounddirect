# Catalog Dutch normalization report

- Products processed: **702**
- Titles normalized (latest apply pass): **45+** (cumulative across passes)
- Descriptions translated/normalized (latest apply pass): **119+**
- Specification sets touched: **100+**
- Products needing manual review (flagged): **~68–100**
- Hard German token scan after fixes: **near-zero** for Maße/Oberfläche/Paketinhalt/Bestellen Sie/Laminatboden/Teppichboden style markers
- Pipeline: `npm run catalog:normalize-dutch` (idempotent; `--apply` writes D1)

## Remaining review focus

Furniture naming remnants (examples): Cord colour adjectives, orientation Left/Right, mixed DE colour words. These are flagged `translation_needs_review` for admin cleanup — not blocking publish of the rest of the catalog.

## Notes

- Original scraped titles preserved in `original_source_name`
- Official delivery policy fields forced to 1–3 business days
- Brand/model identifiers intentionally preserved
- Source scrape folder is never modified by this pipeline
