CREATE TABLE `audit_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`action` text NOT NULL,
	`status` text NOT NULL,
	`actor` text NOT NULL,
	`details` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reply_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`keywords` text NOT NULL,
	`reply_text` text NOT NULL,
	`channels` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`auto_send` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_type` text NOT NULL,
	`external_id` text NOT NULL,
	`channel` integer,
	`channel_name` text,
	`chat_user_id` text,
	`session_id` text,
	`sender_type` integer,
	`message_type` text,
	`message_text` text,
	`payload` text NOT NULL,
	`received_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `webhook_events_external_id_unique` ON `webhook_events` (`external_id`);