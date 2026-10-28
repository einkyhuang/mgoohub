CREATE TABLE `agent_jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_id` text NOT NULL,
	`chat_user_id` text,
	`session_id` text,
	`skill` text NOT NULL,
	`status` text NOT NULL,
	`mode` text NOT NULL,
	`input` text NOT NULL,
	`output` text NOT NULL,
	`draft_reply` text,
	`customer_stage` text,
	`requires_human` integer DEFAULT true NOT NULL,
	`sent_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agent_jobs_external_id_unique` ON `agent_jobs` (`external_id`);