CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`baby_id` text,
	`event_type` text NOT NULL,
	`entity_type` text,
	`entity_id` text,
	`metadata` text,
	`request_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`baby_id`) REFERENCES `babies`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_events_user_created_idx` ON `audit_events` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_events_type_created_idx` ON `audit_events` (`event_type`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_events_request_idx` ON `audit_events` (`request_id`);--> statement-breakpoint
CREATE INDEX `activities_baby_start_time_idx` ON `activities` (`baby_id`,`start_time`);--> statement-breakpoint
CREATE INDEX `babies_user_id_idx` ON `babies` (`user_id`);--> statement-breakpoint
CREATE INDEX `milestones_baby_date_idx` ON `milestones` (`baby_id`,`date`);--> statement-breakpoint
CREATE INDEX `reminders_baby_datetime_idx` ON `reminders` (`baby_id`,`datetime`);