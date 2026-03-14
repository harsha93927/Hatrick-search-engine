import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const savedItemsTable = pgTable("saved_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  snippet: text("snippet").notNull(),
  source: text("source").notNull(),
  publishedAt: text("published_at"),
  imageUrl: text("image_url"),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

export const insertSavedItemSchema = createInsertSchema(savedItemsTable).omit({ id: true, savedAt: true });
export type InsertSavedItem = z.infer<typeof insertSavedItemSchema>;
export type SavedItem = typeof savedItemsTable.$inferSelect;
