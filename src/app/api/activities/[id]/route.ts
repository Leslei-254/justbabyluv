import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { getAuthedUser } from "@/lib/session";
import { getOwnedActivity } from "@/lib/data";
import { activityUpdateSchema } from "@/lib/validation";
import { auditEvent, AUDIT_EVENT_TYPES, getRequestId } from "@/lib/audit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(req);
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedActivity(user.id, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = activityUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const nextStart = parsed.data.startTime ?? existing.startTime;
  const nextEnd =
    parsed.data.endTime === undefined ? existing.endTime : parsed.data.endTime;
  if (nextEnd && nextEnd.getTime() < nextStart.getTime()) {
    return NextResponse.json(
      { error: "End time must be after the start time" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(activities)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(activities.id, id))
    .returning();

  await auditEvent({ eventType: AUDIT_EVENT_TYPES.ACTIVITY_UPDATE, userId: user.id, babyId: existing.babyId, entityType: "activity", entityId: id, requestId, metadata: { activityType: updated.type } });
  return NextResponse.json({ activity: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(req);
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedActivity(user.id, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(activities).where(eq(activities.id, id));
  await auditEvent({ eventType: AUDIT_EVENT_TYPES.ACTIVITY_DELETE, userId: user.id, babyId: existing.babyId, entityType: "activity", entityId: id, requestId, metadata: { activityType: existing.type } });
  return NextResponse.json({ ok: true });
}
