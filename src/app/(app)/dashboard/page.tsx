import { and, eq, gte, isNull, desc, lt } from "drizzle-orm";
import { db } from "@/db";
import { activities, reminders, milestones } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { getUserBabies } from "@/lib/data";
import { DashboardView } from "@/components/dashboard/DashboardView";

const TIMEZONE_SAFE_BUFFER_MS = 48 * 60 * 60 * 1000;

export default async function DashboardPage() {
  const user = await requireUser();
  const babies = await getUserBabies(user.id);
  const baby = babies[0];

  const now = new Date();
  const bufferStart = new Date(now.getTime() - TIMEZONE_SAFE_BUFFER_MS);

  const [activeTimers, bufferActivities, recentActivities, overdueReminders, upcomingReminders, bufferMilestones, recentMilestones] = await Promise.all([
    db.query.activities.findMany({ where: and(eq(activities.babyId, baby.id), isNull(activities.endTime)), columns: { id: true, type: true, startTime: true }, orderBy: [desc(activities.startTime)] }),
    db.query.activities.findMany({ where: and(eq(activities.babyId, baby.id), gte(activities.startTime, bufferStart)), columns: { id: true, type: true, startTime: true, endTime: true } }),
    db.query.activities.findMany({ where: eq(activities.babyId, baby.id), columns: { id: true, type: true, subtype: true, startTime: true, endTime: true, amount: true, unit: true, side: true, medicationName: true, dose: true, notes: true }, orderBy: [desc(activities.startTime)], limit: 6 }),
    db.query.reminders.findMany({ columns: { id: true, title: true, datetime: true }, where: and(eq(reminders.babyId, baby.id), eq(reminders.completed, false), lt(reminders.datetime, now)), orderBy: (r, { asc }) => [asc(r.datetime)], limit: 3 }),
    db.query.reminders.findMany({ columns: { id: true, title: true, datetime: true }, where: and(eq(reminders.babyId, baby.id), eq(reminders.completed, false), gte(reminders.datetime, now)), orderBy: (r, { asc }) => [asc(r.datetime)], limit: 3 }),
    db.query.milestones.findMany({ where: and(eq(milestones.babyId, baby.id), gte(milestones.date, bufferStart)), columns: { id: true, date: true } }),
    db.query.milestones.findMany({ where: eq(milestones.babyId, baby.id), columns: { id: true, title: true, date: true }, orderBy: (m, { desc }) => [desc(m.date)], limit: 3 }),
  ]);

  return <DashboardView baby={baby} activeTimers={activeTimers} bufferActivities={bufferActivities} recentActivities={recentActivities} overdueReminders={overdueReminders} upcomingReminders={upcomingReminders} bufferMilestones={bufferMilestones} recentMilestones={recentMilestones} timezone={user.timezone} />;
}
