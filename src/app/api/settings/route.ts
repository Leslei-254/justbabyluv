import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuthedUser } from "@/lib/session";

const settingsSchema = z.object({
  unitPreference: z.enum(["oz", "ml"]).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailRemindersEnabled: z.boolean().optional(),
  name: z.string().trim().min(1).max(100).optional(),
});

export async function PATCH(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(users)
    .set(parsed.data)
    .where(eq(users.id, user.id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      unitPreference: users.unitPreference,
      theme: users.theme,
      emailRemindersEnabled: users.emailRemindersEnabled,
    });

  return NextResponse.json({ user: updated });
}
