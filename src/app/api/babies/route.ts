import { NextResponse } from "next/server";
import { db } from "@/db";
import { babies } from "@/db/schema";
import { getAuthedUser } from "@/lib/session";
import { getUserBabies } from "@/lib/data";
import { babySchema } from "@/lib/validation";

export async function GET() {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await getUserBabies(user.id);
  return NextResponse.json({ babies: list });
}

export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  return NextResponse.json({ baby }, { status: 201 });
}
