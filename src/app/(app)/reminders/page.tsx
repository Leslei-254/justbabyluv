import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reminders } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { getUserBabies } from "@/lib/data";
import { RemindersView } from "@/components/reminders/RemindersView";

export default async function RemindersPage() {
  const user = await requireUser();
  const babies = await getUserBabies(user.id);
  const baby = babies[0];

  const list = await db.query.reminders.findMany({
    where: eq(reminders.babyId, baby.id),
    orderBy: (r, { asc }) => [asc(r.datetime)],
  });

  return <RemindersView babyId={baby.id} babyName={baby.name} reminders={list} />;
}
