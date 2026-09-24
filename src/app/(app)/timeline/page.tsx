import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { activities, milestones } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { getUserBabies } from "@/lib/data";
import { TimelineView } from "@/components/timeline/TimelineView";

export default async function TimelinePage() {
  const user = await requireUser();
  const babies = await getUserBabies(user.id);
  const baby = babies[0];

  // 30 days of history, plus a 24-hour pad so a client in a timezone ahead
  // of or behind the server's UTC clock never has an activity right at the
  // edge unfairly excluded. This only widens the fetch window slightly —
  // it does not affect "Today"/"Yesterday" grouping, which is already
  // computed correctly client-side (see TimelineView).
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  cutoff.setHours(cutoff.getHours() - 24);

  const TIMELINE_ITEM_LIMIT = 200;

  const [activityList, milestoneList] = await Promise.all([
    db.query.activities.findMany({
      where: and(eq(activities.babyId, baby.id), gte(activities.startTime, cutoff)),
      orderBy: (a, { desc }) => [desc(a.startTime)],
      limit: TIMELINE_ITEM_LIMIT,
    }),
    db.query.milestones.findMany({
      where: and(eq(milestones.babyId, baby.id), gte(milestones.date, cutoff)),
      orderBy: (m, { desc }) => [desc(m.date)],
      limit: TIMELINE_ITEM_LIMIT,
    }),
  ]);

  return <TimelineView activities={activityList} milestones={milestoneList} />;
}
