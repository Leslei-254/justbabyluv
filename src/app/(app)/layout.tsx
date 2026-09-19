import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getUserBabies } from "@/lib/data";
import { AppShell } from "@/components/nav/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const babies = await getUserBabies(user.id);

  if (babies.length === 0) {
    redirect("/onboarding");
  }

  return <AppShell>{children}</AppShell>;
}
