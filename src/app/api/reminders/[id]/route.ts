import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reminders } from "@/db/schema";
import { getAuthedUser } from "@/lib/session";
import { getOwnedReminder } from "@/lib/data";
import { reminderUpdateSchema } from "@/lib/validation";
import { auditEvent, AUDIT_EVENT_TYPES, getRequestId } from "@/lib/audit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(req);
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedReminder(user.id, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = reminderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(reminders)
    .set(parsed.data)
    .where(eq(reminders.id, id))
    .returning();

  const eventType = updated.completed && !existing.completed ? AUDIT_EVENT_TYPES.REMINDER_COMPLETE : AUDIT_EVENT_TYPES.REMINDER_UPDATE;
  await auditEvent({ eventType, userId: user.id, babyId: existing.babyId, entityType: "reminder", entityId: id, requestId, metadata: { reminderType: updated.type, completed: updated.completed } });
  return NextResponse.json({ reminder: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedReminder(user.id, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(reminders).where(eq(reminders.id, id));
  await auditEvent({ eventType: AUDIT_EVENT_TYPES.REMINDER_DELETE, userId: user.id, babyId: existing.babyId, entityType: "reminder", entityId: id, requestId, metadata: { reminderType: existing.type } });
  return NextResponse.json({ ok: true });
}
