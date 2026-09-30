ALTER TABLE `email_events` ADD `idempotency_key` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `email_events_idempotency_key_idx` ON `email_events` (`idempotency_key`);
