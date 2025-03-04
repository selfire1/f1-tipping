import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const groupsTable = sqliteTable("groups", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});
