DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `constructors` ALTER COLUMN "created" TO "created" integer NOT NULL DEFAULT '"2025-03-15T00:32:43.579Z"';--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
ALTER TABLE `constructors` ALTER COLUMN "last_updated" TO "last_updated" integer NOT NULL DEFAULT '"2025-03-15T00:32:43.579Z"';--> statement-breakpoint
ALTER TABLE `drivers` ALTER COLUMN "created" TO "created" integer NOT NULL DEFAULT '"2025-03-15T00:32:43.579Z"';--> statement-breakpoint
ALTER TABLE `group_members` ALTER COLUMN "joined_at" TO "joined_at" integer NOT NULL DEFAULT '"2025-03-15T00:32:43.579Z"';--> statement-breakpoint
ALTER TABLE `groups` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT '"2025-03-15T00:32:43.579Z"';--> statement-breakpoint
ALTER TABLE `prediction_entries` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT '"2025-03-15T00:32:43.579Z"';--> statement-breakpoint
ALTER TABLE `predictions` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT '"2025-03-15T00:32:43.579Z"';--> statement-breakpoint
ALTER TABLE `races` ALTER COLUMN "created" TO "created" integer NOT NULL DEFAULT '"2025-03-15T00:32:43.579Z"';--> statement-breakpoint
ALTER TABLE `results` ALTER COLUMN "added_at" TO "added_at" integer NOT NULL DEFAULT '"2025-03-15T00:32:43.579Z"';--> statement-breakpoint
ALTER TABLE `results` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL DEFAULT '"2025-03-15T00:32:43.579Z"';--> statement-breakpoint
ALTER TABLE `results` ALTER COLUMN "position" TO "position" integer;--> statement-breakpoint
ALTER TABLE `results` DROP COLUMN `constructor_id`;