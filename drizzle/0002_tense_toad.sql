CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contact_messages_created_idx` ON `contact_messages` (`created_at`);--> statement-breakpoint
CREATE TABLE `withdrawal_items` (
	`id` text PRIMARY KEY NOT NULL,
	`withdrawal_id` text NOT NULL,
	`order_item_id` text,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`withdrawal_id`) REFERENCES `withdrawal_requests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `withdrawal_items_withdrawal_idx` ON `withdrawal_items` (`withdrawal_id`);--> statement-breakpoint
CREATE TABLE `withdrawal_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`order_number` text NOT NULL,
	`email` text NOT NULL,
	`scope` text NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`customer_note` text,
	`confirmation_code` text NOT NULL,
	`recorded_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `withdrawal_requests_confirmation_code_unique` ON `withdrawal_requests` (`confirmation_code`);--> statement-breakpoint
CREATE INDEX `withdrawal_order_idx` ON `withdrawal_requests` (`order_id`);--> statement-breakpoint
CREATE INDEX `withdrawal_email_idx` ON `withdrawal_requests` (`email`);