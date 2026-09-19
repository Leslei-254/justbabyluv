import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { milestones } from "@/db/schema";
import { getAuthedUser } from "@/lib/session";
import { getOwnedBaby } from "@/lib/data";
import { milestoneSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const babyId = searchParams.get("babyId");
  if (!babyId) return NextResponse.json({ error: "babyId is required" }, { status: 400 });

  const baby = await getOwnedBaby(user.id, babyId);
  if (!baby) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const list = await db.query.milestones.findMany({
    where: eq(milestones.babyId, babyId),
    orderBy: [desc(milestones.date)],
  });

  return NextResponse.json({ milestones: list });
}

export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const babyId = body?.babyId as string | undefined;
  if (!babyId) return NextResponse.json({ error: "babyId is required" }, { status: 400 });

  const baby = await getOwnedBaby(user.id, babyId);
  if (!baby) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = milestoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [milestone] = await db
    .insert(milestones)
    .values({ ...parsed.data, babyId })
    .returning();

  return NextResponse.json({ milestone }, { status: 201 });
}
