import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/session";
import { getOwnedBaby } from "@/lib/data";
import { auditEvent, AUDIT_EVENT_TYPES, getRequestId } from "@/lib/audit";
import { clearBabyData, seedDemoDataForBaby } from "@/lib/demo";

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const babyId = body?.babyId as string | undefined;
  if (!babyId) return NextResponse.json({ error: "babyId is required" }, { status: 400 });

  const baby = await getOwnedBaby(user.id, babyId);
  if (!baby) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await clearBabyData(babyId);
  await seedDemoDataForBaby(babyId);

  await auditEvent({
    eventType: AUDIT_EVENT_TYPES.DEMO_DATA_SEED,
    userId: user.id,
    babyId,
    entityType: "baby",
    entityId: babyId,
    requestId,
    metadata: {},
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const requestId = getRequestId(req);
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const babyId = body?.babyId as string | undefined;
  if (!babyId) return NextResponse.json({ error: "babyId is required" }, { status: 400 });

  const baby = await getOwnedBaby(user.id, babyId);
  if (!baby) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await clearBabyData(babyId);

  await auditEvent({
    eventType: AUDIT_EVENT_TYPES.DEMO_DATA_CLEAR,
    userId: user.id,
    babyId,
    entityType: "baby",
    entityId: babyId,
    requestId,
    metadata: {},
  });

  return NextResponse.json({ ok: true });
}
