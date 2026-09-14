-- Normalize product lead-time fields to the official storefront policy (1–3 business days).
-- Source scrape metadata elsewhere is preserved; these columns drive admin/audit defaults only.
-- Storefront copy already resolves from shared commerceConfig and ignores stale scraped values.
UPDATE products
SET
  lead_time_min_days = 1,
  lead_time_max_days = 3;
