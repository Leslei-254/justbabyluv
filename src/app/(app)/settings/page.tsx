import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { getUserBabies } from "@/lib/data";
import { SettingsView } from "@/components/settings/SettingsView";

export default async function SettingsPage() {
  const authUser = await requireUser();
  const babies = await getUserBabies(authUser.id);
  const baby = babies[0];

  const user = await db.query.users.findFirst({ where: eq(users.id, authUser.id) });
  if (!user) throw new Error("User not found");

  return <SettingsView user={user} baby={baby} />;
}
