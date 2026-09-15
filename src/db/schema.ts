import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const bankItems = sqliteTable("bank_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  kind: text("kind", {
    enum: ["experience", "project", "education", "skill", "certification"],
  }).notNull(),
  roleOrCompany: text("role_or_company"),
  text: text("text").notNull(),
  tags: text("tags").notNull().default("[]"),
  atsKeywords: text("ats_keywords").notNull().default("[]"),
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
  selectedItemIds: text("selected_item_ids").notNull().default("[]"),
  coverage: text("coverage").notNull().default("{}"),
  suggestions: text("suggestions"),
  outputTex: text("output_tex"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
