import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reminders } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { getUserBabies } from "@/lib/data";
import { RemindersView } from "@/components/reminders/RemindersView";

const REMINDER_LIST_LIMIT = 200;

export default async function RemindersPage() {
  const user = await requireUser();
  const babies = await getUserBabies(user.id);
  const baby = babies[0];

  const list = await db.query.reminders.findMany({
    where: eq(reminders.babyId, baby.id),
    orderBy: (r, { asc }) => [asc(r.datetime)],
    limit: REMINDER_LIST_LIMIT,
  });

  return <RemindersView babyId={baby.id} babyName={baby.name} reminders={list} timezone={user.timezone} />;
}
