import { and, eq, gte, isNull, desc } from "drizzle-orm";
import { db } from "@/db";
import { activities, reminders, milestones } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { getUserBabies } from "@/lib/data";
import { startOfDay } from "@/lib/utils";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
  const user = await requireUser();
  const babies = await getUserBabies(user.id);
  const baby = babies[0];

  const todayStart = startOfDay(new Date());

  const [activeTimers, todaysActivities, recentActivities, upcomingReminders, todaysMilestones] =
    await Promise.all([
      db.query.activities.findMany({
        where: and(eq(activities.babyId, baby.id), isNull(activities.endTime)),
        orderBy: [desc(activities.startTime)],
      }),
      db.query.activities.findMany({
        where: and(
          eq(activities.babyId, baby.id),
          gte(activities.startTime, todayStart)
        ),
      }),
      db.query.activities.findMany({
        where: eq(activities.babyId, baby.id),
        orderBy: [desc(activities.startTime)],
        limit: 6,
      }),
      db.query.reminders.findMany({
        where: and(eq(reminders.babyId, baby.id), eq(reminders.completed, false)),
        orderBy: (r, { asc }) => [asc(r.datetime)],
        limit: 3,
      }),
      db.query.milestones.findMany({
        where: and(eq(milestones.babyId, baby.id), gte(milestones.date, todayStart)),
      }),
    ]);

  const todayStats = {
    feeds: todaysActivities.filter((a) => a.type === "FEED").length,
    diapers: todaysActivities.filter((a) => a.type === "DIAPER").length,
    sleepMs: todaysActivities
      .filter((a) => a.type === "SLEEP" && a.endTime)
      .reduce((sum, a) => sum + (a.endTime!.getTime() - a.startTime.getTime()), 0),
    pumps: todaysActivities.filter((a) => a.type === "PUMP").length,
    medsCompleted: todaysActivities.filter((a) => a.type === "MEDICATION").length,
    milestones: todaysMilestones.length,
  };

  return (
    <DashboardView
      baby={baby}
      activeTimers={activeTimers}
      recentActivities={recentActivities}
      upcomingReminders={upcomingReminders}
      todayStats={todayStats}
    />
  );
}
