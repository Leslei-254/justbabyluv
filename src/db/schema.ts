import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";

// ---------- Users ----------
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailRemindersEnabled: integer("email_reminders_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  unitPreference: text("unit_preference", { enum: ["oz", "ml"] })
    .notNull()
    .default("oz"),
  theme: text("theme", { enum: ["light", "dark", "system"] })
    .notNull()
    .default("system"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------- Babies ----------
export const babies = sqliteTable("babies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dob: integer("dob", { mode: "timestamp" }).notNull(),
  photoUrl: text("photo_url"),
  birthWeightValue: real("birth_weight_value"),
  birthWeightUnit: text("birth_weight_unit", { enum: ["lb", "kg"] }),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------- Activities (feed / diaper / sleep / pump / medication) ----------
export const ACTIVITY_TYPES = [
  "FEED",
  "DIAPER",
  "SLEEP",
  "PUMP",
  "MEDICATION",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const activities = sqliteTable("activities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  babyId: text("baby_id")
    .notNull()
    .references(() => babies.id, { onDelete: "cascade" }),
  type: text("type", { enum: ACTIVITY_TYPES }).notNull(),
  // FEED: 'breast' | 'bottle' | 'formula' | 'expressed'
  // DIAPER: 'wet' | 'dirty' | 'both' | 'dry'
  subtype: text("subtype"),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }),
  amount: real("amount"),
  unit: text("unit", { enum: ["oz", "ml"] }),
  side: text("side", { enum: ["left", "right", "both"] }),
  medicationName: text("medication_name"),
  dose: text("dose"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------- Milestones ("Baby Steps") ----------
export const milestones = sqliteTable("milestones", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  babyId: text("baby_id")
    .notNull()
    .references(() => babies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  note: text("note"),
  photoUrl: text("photo_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------- Reminders ----------
export const REMINDER_TYPES = [
  "FEED",
  "DIAPER",
  "PUMP",
  "MEDICATION",
  "CUSTOM",
] as const;
export type ReminderType = (typeof REMINDER_TYPES)[number];

export const reminders = sqliteTable("reminders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  babyId: text("baby_id")
    .notNull()
    .references(() => babies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type", { enum: REMINDER_TYPES }).notNull().default("CUSTOM"),
  datetime: integer("datetime", { mode: "timestamp" }).notNull(),
  repeat: text("repeat", { enum: ["none", "daily", "weekly"] })
    .notNull()
    .default("none"),
  emailEnabled: integer("email_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  completed: integer("completed", { mode: "boolean" })
    .notNull()
    .default(false),
  snoozedUntil: integer("snoozed_until", { mode: "timestamp" }),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
