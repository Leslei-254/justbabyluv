import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { reminders } from "@/db/schema";
import { getAuthedUser } from "@/lib/session";
import { getOwnedBaby } from "@/lib/data";
import { reminderSchema } from "@/lib/validation";
import { auditEvent, AUDIT_EVENT_TYPES, getRequestId } from "@/lib/audit";
import { zonedDateTimeToUtc } from "@/lib/utils";

export async function GET(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const babyId = searchParams.get("babyId");
  if (!babyId) return NextResponse.json({ error: "babyId is required" }, { status: 400 });

  const baby = await getOwnedBaby(user.id, babyId);
  if (!baby) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const list = await db.query.reminders.findMany({
    where: eq(reminders.babyId, babyId),
    orderBy: [asc(reminders.datetime)],
    limit: 200,
  });

  return NextResponse.json({ reminders: list });
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

  const parsed = reminderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  let datetime: Date;
  try {
    datetime = zonedDateTimeToUtc(String(body?.datetime ?? ""), user.timezone);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid reminder date/time" }, { status: 400 });
  }

  const [reminder] = await db
    .insert(reminders)
    .values({ ...parsed.data, datetime, babyId })
    .returning();

  await auditEvent({ eventType: AUDIT_EVENT_TYPES.REMINDER_CREATE, userId: user.id, babyId, entityType: "reminder", entityId: reminder.id, requestId, metadata: { reminderType: reminder.type, emailEnabled: reminder.emailEnabled } });
  return NextResponse.json({ reminder }, { status: 201 });
}
