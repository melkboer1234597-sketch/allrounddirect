CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `account_deletion_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`note` text,
	`requested_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `deletion_requests_userId_idx` ON `account_deletion_requests` (`user_id`);--> statement-breakpoint
CREATE TABLE `addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`label` text,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`company_name` text,
	`street` text NOT NULL,
	`house_number` text NOT NULL,
	`addition` text,
	`postal_code` text NOT NULL,
	`city` text NOT NULL,
	`country` text DEFAULT 'NL' NOT NULL,
	`phone` text,
	`is_default_shipping` integer DEFAULT false NOT NULL,
	`is_default_billing` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `addresses_userId_idx` ON `addresses` (`user_id`);--> statement-breakpoint
CREATE TABLE `auth_kv` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customer_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone` text,
	`company_name` text,
	`kvk` text,
	`vat_number` text,
	`marketing_opt_in` integer DEFAULT false NOT NULL,
	`terms_accepted_at` integer NOT NULL,
	`account_status` text DEFAULT 'active' NOT NULL,
	`deletion_requested_at` integer,
	`two_factor_pending` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_profiles_userId_uidx` ON `customer_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `dev_email_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`to_email` text NOT NULL,
	`subject` text NOT NULL,
	`type` text NOT NULL,
	`action_url` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`name` text NOT NULL,
	`sku` text,
	`product_slug` text,
	`quantity` integer NOT NULL,
	`unit_price_cents` integer NOT NULL,
	`vat_rate` integer DEFAULT 21 NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `order_items_orderId_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`user_id` text,
	`guest_email` text NOT NULL,
	`status` text NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`vat_cents` integer NOT NULL,
	`shipping_cents` integer NOT NULL,
	`total_cents` integer NOT NULL,
	`payment_method` text,
	`billing_snapshot` text NOT NULL,
	`shipping_snapshot` text NOT NULL,
	`placed_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE INDEX `orders_userId_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `orders_guestEmail_idx` ON `orders` (`guest_email`);--> statement-breakpoint
CREATE TABLE `rate_limit_hits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bucket` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limit_bucket_created_idx` ON `rate_limit_hits` (`bucket`,`created_at`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `shipment_items` (
	`id` text PRIMARY KEY NOT NULL,
	`shipment_id` text NOT NULL,
	`order_item_id` text NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`public_label` text NOT NULL,
	`supplier_code` text,
	`supplier_public_name` text,
	`show_supplier_to_customer` integer DEFAULT false NOT NULL,
	`status` text NOT NULL,
	`carrier` text,
	`tracking_code` text,
	`tracking_url` text,
	`shipped_at` integer,
	`delivered_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `shipments_orderId_idx` ON `shipments` (`order_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`first_name` text DEFAULT '' NOT NULL,
	`last_name` text DEFAULT '' NOT NULL,
	`marketing_opt_in` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TABLE `wishlist_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`product_slug` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishlist_user_product_uidx` ON `wishlist_items` (`user_id`,`product_slug`);--> statement-breakpoint
CREATE INDEX `wishlist_userId_idx` ON `wishlist_items` (`user_id`);