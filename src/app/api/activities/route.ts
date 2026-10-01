import { NextResponse } from "next/server";
import { and, eq, gte, lte, isNull, desc } from "drizzle-orm";
import { db } from "@/db";
import { activities, ACTIVITY_TYPES } from "@/db/schema";
import { getAuthedUser } from "@/lib/session";
import { getOwnedBaby } from "@/lib/data";
import { activitySchema, activityQuerySchema } from "@/lib/validation";
import { auditEvent, AUDIT_EVENT_TYPES, getRequestId } from "@/lib/audit";

// Activity types that represent a timed session (start now, stop later).
// Only one of each can be "open" (no endTime) per baby at a time.
const OPEN_ENDED_LABELS: Partial<Record<(typeof ACTIVITY_TYPES)[number], string>> = {
  SLEEP: "sleep session",
  FEED: "feeding",
  PUMP: "pumping session",
};

export async function GET(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const parsedQuery = activityQuerySchema.safeParse({
    babyId: searchParams.get("babyId") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    active: searchParams.get("active") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: parsedQuery.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 }
    );
  }

  const { babyId, type, from, to, active, limit } = parsedQuery.data;
  const baby = await getOwnedBaby(user.id, babyId);
  if (!baby) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const conditions = [eq(activities.babyId, babyId)];
  if (type) conditions.push(eq(activities.type, type));
  if (from) conditions.push(gte(activities.startTime, from));
  if (to) conditions.push(lte(activities.startTime, to));
  if (active === "true") conditions.push(isNull(activities.endTime));

  const list = await db.query.activities.findMany({
    where: and(...conditions),
    orderBy: [desc(activities.startTime)],
    limit,
  });

  return NextResponse.json({ activities: list });
}

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const babyId = body?.babyId as string | undefined;
  if (!babyId) return NextResponse.json({ error: "babyId is required" }, { status: 400 });

  const baby = await getOwnedBaby(user.id, babyId);
  if (!baby) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = activitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const openEndedLabel = OPEN_ENDED_LABELS[parsed.data.type];
  if (!parsed.data.endTime && openEndedLabel) {
    const existingOpen = await db.query.activities.findFirst({
      where: and(
        eq(activities.babyId, babyId),
        eq(activities.type, parsed.data.type),
        isNull(activities.endTime)
      ),
    });
    if (existingOpen) {
      return NextResponse.json(
        { error: `A ${openEndedLabel} is already in progress for this baby.` },
        { status: 409 }
      );
    }
  }

  const [activity] = await db
    .insert(activities)
    .values({ ...parsed.data, babyId })
    .returning();

  await auditEvent({
    eventType: AUDIT_EVENT_TYPES.ACTIVITY_CREATE,
    userId: user.id,
    babyId,
    entityType: "activity",
    entityId: activity.id,
    requestId,
    metadata: { activityType: activity.type },
  });

  return NextResponse.json({ activity }, { status: 201 });
}
