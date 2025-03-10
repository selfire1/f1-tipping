CREATE TABLE `constructors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`nationality` text NOT NULL,
	`created` integer DEFAULT '"2025-03-10T09:29:20.611Z"' NOT NULL,
	`last_updated` integer DEFAULT '"2025-03-10T09:29:20.611Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` text PRIMARY KEY NOT NULL,
	`permanent_number` text NOT NULL,
	`full_name` text NOT NULL,
	`given_name` text NOT NULL,
	`family_name` text NOT NULL,
	`nationality` text NOT NULL,
	`constructor_id` text NOT NULL,
	`last_updated` integer NOT NULL,
	`created` integer DEFAULT '"2025-03-10T09:29:20.611Z"' NOT NULL,
	FOREIGN KEY (`constructor_id`) REFERENCES `constructors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	`joined_at` integer DEFAULT '"2025-03-10T09:29:20.611Z"' NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prediction_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`prediction_id` text NOT NULL,
	`position` text NOT NULL,
	`driver_id` text,
	`constructor_id` text,
	`created_at` integer DEFAULT '"2025-03-10T09:29:20.611Z"' NOT NULL,
	FOREIGN KEY (`prediction_id`) REFERENCES `predictions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`constructor_id`) REFERENCES `constructors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`group_id` text NOT NULL,
	`is_for_championship` integer DEFAULT false NOT NULL,
	`race_id` text,
	`created_at` integer DEFAULT '"2025-03-10T09:29:20.611Z"' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`race_id`) REFERENCES `races`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `races` (
	`id` text PRIMARY KEY NOT NULL,
	`country` text NOT NULL,
	`round` integer NOT NULL,
	`circuit_name` text NOT NULL,
	`race_name` text NOT NULL,
	`grand_prix_date` integer NOT NULL,
	`qualifying_date` integer NOT NULL,
	`locality` text NOT NULL,
	`last_updated` integer NOT NULL,
	`created` integer DEFAULT '"2025-03-10T09:29:20.611Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` text PRIMARY KEY NOT NULL,
	`race_id` text NOT NULL,
	`added_at` integer DEFAULT '"2025-03-10T09:29:20.611Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-03-10T09:29:20.611Z"' NOT NULL,
	`driver_id` text,
	`constructor_id` text,
	`grid` integer,
	`position` integer NOT NULL,
	`points` integer NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`race_id`) REFERENCES `races`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`constructor_id`) REFERENCES `constructors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_by_user` text NOT NULL,
	`created_at` integer DEFAULT '"2025-03-10T09:29:20.611Z"' NOT NULL,
	`cutoff_in_minutes` integer DEFAULT 180 NOT NULL,
	FOREIGN KEY (`created_by_user`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_groups`("id", "name", "created_by_user", "created_at", "cutoff_in_minutes") SELECT "id", "name", "created_by_user", "created_at", "cutoff_in_minutes" FROM `groups`;--> statement-breakpoint
DROP TABLE `groups`;--> statement-breakpoint
ALTER TABLE `__new_groups` RENAME TO `groups`;--> statement-breakpoint
PRAGMA foreign_keys=ON;