CREATE TABLE `dev_mollie_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `email_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`template` text NOT NULL,
	`recipient` text NOT NULL,
	`related_entity_type` text,
	`related_entity_id` text,
	`status` text NOT NULL,
	`provider_message_id` text,
	`error_code` text,
	`sent_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `email_logs_created_idx` ON `email_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `order_event_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`channel` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_event_deliveries_uidx` ON `order_event_deliveries` (`event_type`,`entity_type`,`entity_id`,`channel`);--> statement-breakpoint
CREATE TABLE `order_number_counters` (
	`year` integer PRIMARY KEY NOT NULL,
	`last_value` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`from_status` text,
	`to_status` text NOT NULL,
	`source` text NOT NULL,
	`actor_user_id` text,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `order_status_history_order_idx` ON `order_status_history` (`order_id`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`provider` text DEFAULT 'mollie' NOT NULL,
	`provider_payment_id` text NOT NULL,
	`status` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`checkout_url` text,
	`method` text,
	`mode` text DEFAULT 'test' NOT NULL,
	`metadata_json` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`paid_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_provider_payment_id_unique` ON `payments` (`provider_payment_id`);--> statement-breakpoint
CREATE INDEX `payments_order_idx` ON `payments` (`order_id`);--> statement-breakpoint
CREATE TABLE `processed_webhooks` (
	`external_key` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `order_items` ADD `product_id` text;--> statement-breakpoint
ALTER TABLE `order_items` ADD `variant_name` text;--> statement-breakpoint
ALTER TABLE `order_items` ADD `variant_options_json` text;--> statement-breakpoint
ALTER TABLE `order_items` ADD `image_ref` text;--> statement-breakpoint
ALTER TABLE `order_items` ADD `vat_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` ADD `line_total_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` ADD `snapshot_json` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `customer_type` text DEFAULT 'consumer' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `confirmation_token` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `inventory_adjusted_at` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `paid_at` integer;--> statement-breakpoint
ALTER TABLE `refunds` ADD `payment_id` text;--> statement-breakpoint
ALTER TABLE `refunds` ADD `provider_refund_id` text;