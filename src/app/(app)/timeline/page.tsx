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

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const [activityList, milestoneList] = await Promise.all([
    db.query.activities.findMany({
      where: and(eq(activities.babyId, baby.id), gte(activities.startTime, cutoff)),
      orderBy: (a, { desc }) => [desc(a.startTime)],
    }),
    db.query.milestones.findMany({
      where: and(eq(milestones.babyId, baby.id), gte(milestones.date, cutoff)),
      orderBy: (m, { desc }) => [desc(m.date)],
    }),
  ]);

  return <TimelineView activities={activityList} milestones={milestoneList} />;
}
