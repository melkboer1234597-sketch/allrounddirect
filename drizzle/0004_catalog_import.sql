ALTER TABLE catalog_categories ADD COLUMN description TEXT;

ALTER TABLE products ADD COLUMN source_name TEXT;
ALTER TABLE products ADD COLUMN source_url TEXT;
ALTER TABLE products ADD COLUMN source_product_id TEXT;
ALTER TABLE products ADD COLUMN source_rights_status TEXT DEFAULT 'needs_review';
ALTER TABLE products ADD COLUMN currency TEXT DEFAULT 'EUR';

CREATE UNIQUE INDEX IF NOT EXISTS products_source_url_uidx ON products (source_url);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category_id);
CREATE INDEX IF NOT EXISTS products_brand_idx ON products (brand_id);

ALTER TABLE product_images ADD COLUMN r2_key TEXT;
ALTER TABLE product_images ADD COLUMN original_filename TEXT;
ALTER TABLE product_images ADD COLUMN is_primary INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE product_images ADD COLUMN width INTEGER;
ALTER TABLE product_images ADD COLUMN height INTEGER;
ALTER TABLE product_images ADD COLUMN mime_type TEXT;
ALTER TABLE product_images ADD COLUMN file_size INTEGER;
ALTER TABLE product_images ADD COLUMN content_hash TEXT;
ALTER TABLE product_images ADD COLUMN created_at INTEGER;

CREATE INDEX IF NOT EXISTS product_images_hash_idx ON product_images (content_hash);

CREATE TABLE IF NOT EXISTS product_specifications (
  id TEXT PRIMARY KEY NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  group_name TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS product_specs_product_idx ON product_specifications (product_id);

CREATE TABLE IF NOT EXISTS import_runs (
  id TEXT PRIMARY KEY NOT NULL,
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  status TEXT NOT NULL,
  products_scanned INTEGER DEFAULT 0 NOT NULL,
  products_valid INTEGER DEFAULT 0 NOT NULL,
  products_imported INTEGER DEFAULT 0 NOT NULL,
  products_skipped INTEGER DEFAULT 0 NOT NULL,
  images_scanned INTEGER DEFAULT 0 NOT NULL,
  images_uploaded INTEGER DEFAULT 0 NOT NULL,
  images_duplicate INTEGER DEFAULT 0 NOT NULL,
  errors INTEGER DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS import_errors (
  id TEXT PRIMARY KEY NOT NULL,
  import_run_id TEXT NOT NULL REFERENCES import_runs(id) ON DELETE CASCADE,
  source_path TEXT,
  product_source_id TEXT,
  severity TEXT NOT NULL,
  code TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS import_errors_run_idx ON import_errors (import_run_id);
