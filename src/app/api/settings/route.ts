import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuthedUser } from "@/lib/session";
import { auditEvent, AUDIT_EVENT_TYPES, getRequestId } from "@/lib/audit";
import { isValidTimeZone } from "@/lib/utils";

const settingsSchema = z.object({
  unitPreference: z.enum(["oz", "ml"]).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailRemindersEnabled: z.boolean().optional(),
  name: z.string().trim().min(1).max(100).optional(),
  timezone: z.string().trim().min(1).max(100).refine(isValidTimeZone, "A valid IANA timezone is required").optional(),
});

export async function PATCH(req: Request) {
  const requestId = getRequestId(req);
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
      timezone: users.timezone,
      emailRemindersEnabled: users.emailRemindersEnabled,
    });

  await auditEvent({
    eventType: AUDIT_EVENT_TYPES.SETTINGS_UPDATE,
    userId: user.id,
    entityType: "user",
    entityId: user.id,
    requestId,
    metadata: { fields: Object.keys(parsed.data).join(",") },
  });

  return NextResponse.json({ user: updated });
}
