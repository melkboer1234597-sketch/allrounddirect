-- Safe refund management fields + idempotency
ALTER TABLE `refunds` ADD `requested_by_admin` text;
--> statement-breakpoint
ALTER TABLE `refunds` ADD `completed_at` integer;
--> statement-breakpoint
ALTER TABLE `refunds` ADD `idempotency_key` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `refunds_idempotency_key_uidx` ON `refunds` (`idempotency_key`);
--> statement-breakpoint
CREATE UNIQUE INDEX `refunds_provider_refund_id_uidx` ON `refunds` (`provider_refund_id`);
