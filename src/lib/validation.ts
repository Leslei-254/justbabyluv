import { z } from "zod";

export const babySchema = z.object({
  name: z.string().trim().min(1, "Baby's name is required").max(100),
  dob: z.coerce.date({ error: "A valid date of birth is required" }),
  photoUrl: z.string().trim().max(500).optional().or(z.literal("")),
  birthWeightValue: z.coerce.number().positive().max(50).optional().nullable(),
  birthWeightUnit: z.enum(["lb", "kg"]).optional().nullable(),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
}).refine(
  (data) => data.dob.getTime() <= Date.now() + 1000 * 60 * 60,
  { message: "Date of birth cannot be in the future", path: ["dob"] }
);

const activityBaseSchema = z.object({
  type: z.enum(["FEED", "DIAPER", "SLEEP", "PUMP", "MEDICATION"]),
  subtype: z.string().trim().max(50).optional().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional().nullable(),
  amount: z.coerce.number().nonnegative().max(10000).optional().nullable(),
  unit: z.enum(["oz", "ml"]).optional().nullable(),
  side: z.enum(["left", "right", "both"]).optional().nullable(),
  medicationName: z.string().trim().max(200).optional().nullable(),
  dose: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const activitySchema = activityBaseSchema.refine(
  (data) => !data.endTime || data.endTime.getTime() >= data.startTime.getTime(),
  { message: "End time must be after the start time", path: ["endTime"] }
);

export const activityUpdateSchema = activityBaseSchema.partial();

export const milestoneSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150),
  date: z.coerce.date(),
  note: z.string().trim().max(2000).optional().nullable(),
  photoUrl: z.string().trim().max(500).optional().nullable(),
});

const reminderBaseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150),
  type: z.enum(["FEED", "DIAPER", "PUMP", "MEDICATION", "CUSTOM"]),
  datetime: z.coerce.date(),
  repeat: z.enum(["none", "daily", "weekly"]),
  emailEnabled: z.boolean(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const reminderSchema = reminderBaseSchema.extend({
  repeat: z.enum(["none", "daily", "weekly"]).default("none"),
  emailEnabled: z.boolean().default(false),
});

// Uses the base (no-default) schema so omitted fields stay untouched on PATCH,
// instead of Zod re-applying "repeat: none" / "emailEnabled: false" defaults.
export const reminderUpdateSchema = reminderBaseSchema.partial().extend({
  completed: z.boolean().optional(),
  snoozedUntil: z.coerce.date().nullable().optional(),
});
