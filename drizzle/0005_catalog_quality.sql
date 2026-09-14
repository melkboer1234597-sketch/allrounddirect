ALTER TABLE products ADD COLUMN original_source_name TEXT;
ALTER TABLE products ADD COLUMN price_on_request INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE products ADD COLUMN review_status TEXT DEFAULT 'ok' NOT NULL;
ALTER TABLE products ADD COLUMN quality_flags TEXT DEFAULT '[]' NOT NULL;
ALTER TABLE products ADD COLUMN is_featured INTEGER DEFAULT 0 NOT NULL;

CREATE INDEX IF NOT EXISTS products_review_status_idx ON products (review_status);
CREATE INDEX IF NOT EXISTS products_featured_idx ON products (is_featured);

ALTER TABLE product_images ADD COLUMN image_status TEXT DEFAULT 'ok' NOT NULL;

CREATE INDEX IF NOT EXISTS product_images_status_idx ON product_images (image_status);
