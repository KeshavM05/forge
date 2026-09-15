CREATE TABLE `assembly_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`job_description` text NOT NULL,
	`extracted_keywords` text DEFAULT '[]' NOT NULL,
	`selected_experience_ids` text DEFAULT '[]' NOT NULL,
	`selected_project_id` text,
	`coverage` text DEFAULT '{}' NOT NULL,
	`edits` text,
	`output_tex` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bank_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`date_range` text,
	`location` text,
	`bullets` text DEFAULT '[]' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
