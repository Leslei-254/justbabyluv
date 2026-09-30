CREATE TABLE `email_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`email` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`provider_message_id` text,
	`status` text NOT NULL,
	`error` text,
	`sent_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `email_events_user_created_idx` ON `email_events` (`user_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX `email_events_status_created_idx` ON `email_events` (`status`,`created_at`);
--> statement-breakpoint
CREATE INDEX `email_events_provider_message_idx` ON `email_events` (`provider_message_id`);
