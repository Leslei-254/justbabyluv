import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { milestones } from "@/db/schema";
import { getAuthedUser } from "@/lib/session";
import { getOwnedMilestone } from "@/lib/data";
import { milestoneSchema } from "@/lib/validation";
import { auditEvent, getRequestId } from "@/lib/audit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(req);
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedMilestone(user.id, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = milestoneSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(milestones)
    .set(parsed.data)
    .where(eq(milestones.id, id))
    .returning();

  await auditEvent({ eventType: "milestone.update", userId: user.id, babyId: existing.babyId, entityType: "milestone", entityId: id, requestId, metadata: {} });
  return NextResponse.json({ milestone: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(req);
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedMilestone(user.id, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(milestones).where(eq(milestones.id, id));
  await auditEvent({ eventType: "milestone.delete", userId: user.id, babyId: existing.babyId, entityType: "milestone", entityId: id, requestId, metadata: {} });
  return NextResponse.json({ ok: true });
}
