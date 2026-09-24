import { NextResponse } from "next/server";
import { and, eq, gte, lte, isNull, desc } from "drizzle-orm";
import { db } from "@/db";
import { activities, ACTIVITY_TYPES } from "@/db/schema";
import { getAuthedUser } from "@/lib/session";
import { getOwnedBaby } from "@/lib/data";
import { activitySchema } from "@/lib/validation";

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
  const babyId = searchParams.get("babyId");
  if (!babyId) return NextResponse.json({ error: "babyId is required" }, { status: 400 });

  const baby = await getOwnedBaby(user.id, babyId);
  if (!baby) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const activeOnly = searchParams.get("active") === "true";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(500, Math.max(1, Number(limitParam))) : 200;

  const conditions = [eq(activities.babyId, babyId)];
  if (type && (ACTIVITY_TYPES as readonly string[]).includes(type)) {
    conditions.push(eq(activities.type, type as (typeof ACTIVITY_TYPES)[number]));
  }
  if (from) conditions.push(gte(activities.startTime, new Date(from)));
  if (to) conditions.push(lte(activities.startTime, new Date(to)));
  if (activeOnly) conditions.push(isNull(activities.endTime));

  const list = await db.query.activities.findMany({
    where: and(...conditions),
    orderBy: [desc(activities.startTime)],
    limit,
  });

  return NextResponse.json({ activities: list });
}

export async function POST(req: Request) {
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

  // Server-side guard: a double tap, a second tab, or a direct API call
  // must not be able to start a second concurrent open-ended session for
  // the same baby. The client-side "is a timer already active?" check is
  // a UX nicety, not a source of truth.
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

  return NextResponse.json({ activity }, { status: 201 });
}
