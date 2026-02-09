import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  isOwner: integer("is_owner", { mode: "boolean" }).default(false),
});

const warnings = sqliteTable("warnings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  groupId: text("group_id").notNull(),
  phone: text("phone")
    .notNull()
    .references(() => users.phone),
  reason: text("reason"),
  count: integer("count").default(1),
});

const groupBans = sqliteTable("group_bans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  groupId: text("group_id").notNull(),
  phone: text("phone").notNull(),
});

const groupMutes = sqliteTable("group_mutes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  groupId: text("group_id").notNull(),
  phone: text("phone").notNull(),
});

const afkStatus = sqliteTable("afk_status", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  jid: text("jid").notNull().unique(),
  reason: text("reason").notNull(),
  time: integer("time", { mode: "timestamp" }).notNull(),
});

export { users, warnings, groupBans, groupMutes, afkStatus };
