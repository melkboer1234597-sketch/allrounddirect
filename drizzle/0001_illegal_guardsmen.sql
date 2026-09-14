CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text NOT NULL,
	`actor_email` text NOT NULL,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text,
	`summary` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_logs_created_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_slug_unique` ON `brands` (`slug`);--> statement-breakpoint
CREATE TABLE `catalog_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`parent_id` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`robots` text DEFAULT 'index,follow' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_categories_slug_unique` ON `catalog_categories` (`slug`);--> statement-breakpoint
CREATE INDEX `catalog_categories_parent_idx` ON `catalog_categories` (`parent_id`);--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`type` text NOT NULL,
	`value_cents` integer,
	`percent` integer,
	`active` integer DEFAULT true NOT NULL,
	`starts_at` integer,
	`ends_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_unique` ON `coupons` (`code`);--> statement-breakpoint
CREATE TABLE `import_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`status` text DEFAULT 'uploaded' NOT NULL,
	`mapping_json` text,
	`headers_json` text,
	`preview_json` text,
	`report_json` text,
	`row_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`filename` text,
	`alt` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`author_user_id` text,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`url` text NOT NULL,
	`alt` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_images_product_idx` ON `product_images` (`product_id`);--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`options_json` text DEFAULT '{}' NOT NULL,
	`sku` text,
	`price_incl_cents` integer,
	`stock_status` text DEFAULT 'unknown',
	`stock_quantity` integer,
	`image_url` text,
	`supplier_sku` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_variants_product_idx` ON `product_variants` (`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`short_description` text,
	`sku` text,
	`ean` text,
	`brand_id` text,
	`category_id` text,
	`subcategory_id` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`price_incl_cents` integer,
	`vat_percent` integer DEFAULT 21 NOT NULL,
	`compare_at_incl_cents` integer,
	`cost_price_cents` integer,
	`supplier_id` text,
	`supplier_sku` text,
	`stock_status` text DEFAULT 'unknown' NOT NULL,
	`stock_quantity` integer,
	`lead_time_min_days` integer,
	`lead_time_max_days` integer,
	`delivery_type` text,
	`is_outlet` integer DEFAULT false NOT NULL,
	`is_business_only` integer DEFAULT false NOT NULL,
	`specifications_json` text,
	`seo_title` text,
	`seo_description` text,
	`canonical_override` text,
	`robots` text DEFAULT 'index,follow' NOT NULL,
	`og_image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`category_id`) REFERENCES `catalog_categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`subcategory_id`) REFERENCES `catalog_categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `products_sku_idx` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `quote_items` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_id` text NOT NULL,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`notes` text,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'lead' NOT NULL,
	`company_name` text NOT NULL,
	`contact_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `refunds` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`reason` text,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `return_items` (
	`id` text PRIMARY KEY NOT NULL,
	`return_id` text NOT NULL,
	`order_item_id` text,
	`quantity` integer NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`return_id`) REFERENCES `returns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `returns` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`reason` text,
	`customer_notes` text,
	`admin_notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `returns_order_idx` ON `returns` (`order_id`);--> statement-breakpoint
CREATE TABLE `seo_overrides` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`canonical_override` text,
	`robots` text,
	`og_image` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `seo_overrides_entity_uidx` ON `seo_overrides` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `site_content` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`internal_code` text NOT NULL,
	`contact_name` text,
	`email` text,
	`phone` text,
	`website` text,
	`order_email` text,
	`notes` text,
	`default_lead_time` text,
	`feed_type` text DEFAULT 'manual' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `suppliers_internal_code_unique` ON `suppliers` (`internal_code`);--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `mollie_payment_id` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `internal_notes` text;--> statement-breakpoint
ALTER TABLE `user` ADD `role` text DEFAULT 'customer' NOT NULL;