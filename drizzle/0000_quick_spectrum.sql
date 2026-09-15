CREATE TABLE `assembly_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`job_description` text NOT NULL,
	`extracted_keywords` text DEFAULT '[]' NOT NULL,
	`selected_item_ids` text DEFAULT '[]' NOT NULL,
	`coverage` text DEFAULT '{}' NOT NULL,
	`suggestions` text,
	`output_tex` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bank_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`role_or_company` text,
	`text` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`ats_keywords` text DEFAULT '[]' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
