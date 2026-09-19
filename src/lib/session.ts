import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** For server components/pages: redirects to /login if not authenticated. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
}

/** For route handlers: returns null instead of redirecting. */
export async function getAuthedUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}
