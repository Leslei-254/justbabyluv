import { redirect } from "next/navigation";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isAdminEmail(email: string | null | undefined) {
  const configured = process.env.ADMIN_EMAIL;
  if (!configured || !email) return false;
  return normalizeEmail(email) === normalizeEmail(configured);
}

export function requireAdminEmail(email: string | null | undefined) {
  if (!isAdminEmail(email)) redirect("/login");
}
