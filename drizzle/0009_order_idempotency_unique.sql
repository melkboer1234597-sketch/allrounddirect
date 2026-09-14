-- Harden place-order idempotency against duplicate submits
DROP INDEX IF EXISTS `orders_idempotency_key_idx`;
--> statement-breakpoint
DROP INDEX IF EXISTS `orders_idempotency_key_uidx`;
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_idempotency_key_uidx` ON `orders` (`idempotency_key`);
