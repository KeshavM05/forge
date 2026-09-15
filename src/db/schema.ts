import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const bankItems = sqliteTable("bank_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  kind: text("kind", {
    enum: ["experience", "project", "education", "skill"],
  }).notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  dateRange: text("date_range"),
  location: text("location"),
  bullets: text("bullets").notNull().default("[]"),
  tags: text("tags").notNull().default("[]"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const assemblySessions = sqliteTable("assembly_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  jobDescription: text("job_description").notNull(),
  extractedKeywords: text("extracted_keywords").notNull().default("[]"),
  selectedExperienceIds: text("selected_experience_ids")
    .notNull()
    .default("[]"),
  selectedProjectId: text("selected_project_id"),
  coverage: text("coverage").notNull().default("{}"),
  edits: text("edits"),
  outputTex: text("output_tex"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
