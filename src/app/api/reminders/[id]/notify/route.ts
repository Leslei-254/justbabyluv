import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/session";
import { getOwnedReminder, getOwnedBaby } from "@/lib/data";
import { sendEmail, buildReminderEmail } from "@/lib/email";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthedUser();
  if (!user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const reminder = await getOwnedReminder(user.id, id);
  if (!reminder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const baby = await getOwnedBaby(user.id, reminder.babyId);
  if (!baby) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { subject, text } = buildReminderEmail({
    babyName: baby.name,
    title: reminder.title,
    when: reminder.datetime,
  });

  const result = await sendEmail({ to: user.email, subject, text });

  return NextResponse.json({ result });
}
