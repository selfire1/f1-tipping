// import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { user } from "./auth-schema";
import { PREDICTION_FIELDS } from "../../shared/utils/consts";
import { relations } from "drizzle-orm";

export const groupsTable = sqliteTable("groups", {
  id: text().primaryKey().$defaultFn(createId),
  name: text().notNull(),
  createdByUser: text("created_by_user")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(new Date())
    .notNull(),
  cutoffInMinutes: integer("cutoff_in_minutes", { mode: "number" })
    .default(3 * 60)
    .notNull(),
});

export const groupRelations = relations(groupsTable, ({ many, one }) => ({
  createdByUser: one(user, {
    fields: [groupsTable.createdByUser],
    references: [user.id],
  }),
}));

export const groupMembersTable = sqliteTable("group_members", {
  id: text("id").primaryKey().$defaultFn(createId),
  groupId: text("group_id")
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // role: text("role").notNull(), TODO: admin, member
  joinedAt: integer({ mode: "timestamp" }).default(new Date()).notNull(),
});

export const groupMembersRelations = relations(
  groupMembersTable,
  ({ one, many }) => ({
    group: one(groupsTable, {
      fields: [groupMembersTable.groupId],
      references: [groupsTable.id],
    }),
    user: one(user, {
      fields: [groupMembersTable.userId],
      references: [user.id],
    }),
  }),
);

export const racesTable = sqliteTable("races", {
  id: text("id").primaryKey().notNull(),
  country: text("country").notNull(),
  round: integer("round").notNull(),
  circuitName: text("circuit_name").notNull(),
  raceName: text("race_name").notNull(),
  grandPrixDate: integer("full_date", { mode: "timestamp" }).notNull(),
  qualifyingDate: integer("full_date", { mode: "timestamp" }).notNull(),
  locality: text("locality").notNull(),
});

export const driversTable = sqliteTable("drivers", {
  id: text("id").primaryKey().notNull(),
  permanentNumber: text("permanent_number").notNull(),
  fullName: text("full_name").notNull(),
  givenName: text("given_name").notNull(),
  familyName: text("family_name").notNull(),
  nationality: text("nationality").notNull(),
  constructorId: text("constructor_id")
    .notNull()
    .references(() => constructorsTable.id, { onDelete: "cascade" }),
});

export const constructorsTable = sqliteTable("constructors", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  nationality: text("nationality").notNull(),
});

export const predictionsTable = sqliteTable("predictions", {
  id: text("id").primaryKey().$defaultFn(createId),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  groupId: text("group_id")
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
  raceId: text("race_id")
    .notNull()
    .references(() => racesTable.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const predictionEntriesTable = sqliteTable("prediction_entries", {
  id: text("id").primaryKey().$defaultFn(createId),
  predictionId: text("prediction_id")
    .notNull()
    .references(() => predictionsTable.id, { onDelete: "cascade" }),
  position: text({ enum: PREDICTION_FIELDS }).notNull(),
  driverId: text("driver_id").references(() => driversTable.id, {
    onDelete: "cascade",
  }),
  constructorId: text("constructor_id").references(() => constructorsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
