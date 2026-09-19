import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { babies, activities, milestones, reminders } from "@/db/schema";

/** Returns the baby only if it belongs to the given user — enforces authorization server-side. */
export async function getOwnedBaby(userId: string, babyId: string) {
  return db.query.babies.findFirst({
    where: and(eq(babies.id, babyId), eq(babies.userId, userId)),
  });
}

export async function getUserBabies(userId: string) {
  return db.query.babies.findMany({
    where: eq(babies.userId, userId),
    orderBy: (b, { desc }) => [desc(b.createdAt)],
  });
}

/** Authorization check: is this activity's baby owned by the given user? */
export async function getOwnedActivity(userId: string, activityId: string) {
  const activity = await db.query.activities.findFirst({
    where: eq(activities.id, activityId),
  });
  if (!activity) return null;
  const baby = await getOwnedBaby(userId, activity.babyId);
  if (!baby) return null;
  return activity;
}

export async function getOwnedMilestone(userId: string, milestoneId: string) {
  const milestone = await db.query.milestones.findFirst({
    where: eq(milestones.id, milestoneId),
  });
  if (!milestone) return null;
  const baby = await getOwnedBaby(userId, milestone.babyId);
  if (!baby) return null;
  return milestone;
}

export async function getOwnedReminder(userId: string, reminderId: string) {
  const reminder = await db.query.reminders.findFirst({
    where: eq(reminders.id, reminderId),
  });
  if (!reminder) return null;
  const baby = await getOwnedBaby(userId, reminder.babyId);
  if (!baby) return null;
  return reminder;
}
