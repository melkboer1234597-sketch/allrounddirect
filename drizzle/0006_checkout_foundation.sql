-- Checkout foundation: guest phone, country, discount, idempotency
ALTER TABLE orders ADD COLUMN guest_phone TEXT;
ALTER TABLE orders ADD COLUMN shipping_country TEXT NOT NULL DEFAULT 'NL';
ALTER TABLE orders ADD COLUMN discount_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_uidx ON orders (idempotency_key) WHERE idempotency_key IS NOT NULL;
