import { and, eq, gte, isNull, desc, lt } from "drizzle-orm";
import { db } from "@/db";
import { activities, reminders, milestones } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { getUserBabies } from "@/lib/data";
import { DashboardView } from "@/components/dashboard/DashboardView";

// Widest realistic gap between any two timezones is ~26 hours (UTC-12 to
// UTC+14). A 48-hour server-side buffer comfortably covers a client's local
// "today" no matter their offset from this server's clock, without ever
// needing to know the client's timezone at query time. The *real* start/end
// of "today" is computed client-side (see DashboardView), where `new Date()`
// correctly reflects the parent's own local calendar day.
const TIMEZONE_SAFE_BUFFER_MS = 48 * 60 * 60 * 1000;

export default async function DashboardPage() {
  const user = await requireUser();
  const babies = await getUserBabies(user.id);
  const baby = babies[0];

  const now = new Date();
  const bufferStart = new Date(now.getTime() - TIMEZONE_SAFE_BUFFER_MS);

  const [
    activeTimers,
    bufferActivities,
    recentActivities,
    overdueReminders,
    upcomingReminders,
    bufferMilestones,
    recentMilestones,
  ] = await Promise.all([
    db.query.activities.findMany({
      where: and(eq(activities.babyId, baby.id), isNull(activities.endTime)),
      orderBy: [desc(activities.startTime)],
    }),
    db.query.activities.findMany({
      where: and(eq(activities.babyId, baby.id), gte(activities.startTime, bufferStart)),
    }),
    db.query.activities.findMany({
      where: eq(activities.babyId, baby.id),
      orderBy: [desc(activities.startTime)],
      limit: 6,
    }),
    // Overdue: incomplete and already past. Absolute time comparison — this
    // one is timezone-safe as-is, since "has this instant already passed" is
    // the same answer everywhere, unlike calendar-day boundaries.
    db.query.reminders.findMany({
      where: and(
        eq(reminders.babyId, baby.id),
        eq(reminders.completed, false),
        lt(reminders.datetime, now)
      ),
      orderBy: (r, { asc }) => [asc(r.datetime)],
      limit: 3,
    }),
    // Upcoming: incomplete and still in the future.
    db.query.reminders.findMany({
      where: and(
        eq(reminders.babyId, baby.id),
        eq(reminders.completed, false),
        gte(reminders.datetime, now)
      ),
      orderBy: (r, { asc }) => [asc(r.datetime)],
      limit: 3,
    }),
    db.query.milestones.findMany({
      where: and(eq(milestones.babyId, baby.id), gte(milestones.date, bufferStart)),
    }),
    db.query.milestones.findMany({
      where: eq(milestones.babyId, baby.id),
      orderBy: (m, { desc }) => [desc(m.date)],
      limit: 3,
    }),
  ]);

  return (
    <DashboardView
      baby={baby}
      activeTimers={activeTimers}
      bufferActivities={bufferActivities}
      recentActivities={recentActivities}
      overdueReminders={overdueReminders}
      upcomingReminders={upcomingReminders}
      bufferMilestones={bufferMilestones}
      recentMilestones={recentMilestones}
    />
  );
}
