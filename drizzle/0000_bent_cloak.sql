CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`baby_id` text NOT NULL,
	`type` text NOT NULL,
	`subtype` text,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`amount` real,
	`unit` text,
	`side` text,
	`medication_name` text,
	`dose` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`baby_id`) REFERENCES `babies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `babies` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`dob` integer NOT NULL,
	`photo_url` text,
	`birth_weight_value` real,
	`birth_weight_unit` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`baby_id` text NOT NULL,
	`title` text NOT NULL,
	`date` integer NOT NULL,
	`note` text,
	`photo_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`baby_id`) REFERENCES `babies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`baby_id` text NOT NULL,
	`title` text NOT NULL,
	`type` text DEFAULT 'CUSTOM' NOT NULL,
	`datetime` integer NOT NULL,
	`repeat` text DEFAULT 'none' NOT NULL,
	`email_enabled` integer DEFAULT false NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`snoozed_until` integer,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`baby_id`) REFERENCES `babies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`email_reminders_enabled` integer DEFAULT true NOT NULL,
	`unit_preference` text DEFAULT 'oz' NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);