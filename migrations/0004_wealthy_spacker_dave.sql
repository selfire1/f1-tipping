CREATE INDEX `predictions_user_id_idx` ON `predictions` (`user_id`);--> statement-breakpoint
CREATE INDEX `predictions_group_id_idx` ON `predictions` (`group_id`);--> statement-breakpoint
CREATE INDEX `predictions_is_for_championship_idx` ON `predictions` (`is_for_championship`);--> statement-breakpoint
CREATE INDEX `predictions_race_id_idx` ON `predictions` (`race_id`);