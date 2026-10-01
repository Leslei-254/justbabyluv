import { NextResponse } from "next/server";
import { db } from "@/db";
import { babies } from "@/db/schema";
import { getAuthedUser } from "@/lib/session";
import { getUserBabies } from "@/lib/data";
import { auditEvent, AUDIT_EVENT_TYPES, getRequestId } from "@/lib/audit";
import { babySchema } from "@/lib/validation";

export async function GET() {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await getUserBabies(user.id);
  return NextResponse.json({ babies: list });
}

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existingBabies = await getUserBabies(user.id);
  if (existingBabies.length > 0) {
    return NextResponse.json(
      { error: "A baby profile already exists for this account." },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = babySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, dob, photoUrl, birthWeightValue, birthWeightUnit, notes } =
    parsed.data;

  const [baby] = await db
    .insert(babies)
    .values({
      userId: user.id,
      name,
      dob,
      photoUrl: photoUrl || null,
      birthWeightValue: birthWeightValue ?? null,
      birthWeightUnit: birthWeightUnit ?? null,
      notes: notes || null,
    })
    .returning();

  await auditEvent({
    eventType: AUDIT_EVENT_TYPES.BABY_CREATE,
    userId: user.id,
    babyId: baby.id,
    entityType: "baby",
    entityId: baby.id,
    requestId,
    metadata: {},
  });

  return NextResponse.json({ baby }, { status: 201 });
}
