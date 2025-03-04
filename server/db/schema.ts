// import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const groupsTable = sqliteTable("groups", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name").notNull(),
});
