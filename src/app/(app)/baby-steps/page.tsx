import { eq } from "drizzle-orm";
import { db } from "@/db";
import { milestones } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { getUserBabies } from "@/lib/data";
import { BabyStepsView } from "@/components/milestones/BabyStepsView";

export default async function BabyStepsPage() {
  const user = await requireUser();
  const babies = await getUserBabies(user.id);
  const baby = babies[0];

  const list = await db.query.milestones.findMany({
    where: eq(milestones.babyId, baby.id),
    orderBy: (m, { desc }) => [desc(m.date)],
  });

  return <BabyStepsView babyId={baby.id} milestones={list} />;
}
