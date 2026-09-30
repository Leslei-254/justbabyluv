import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/session";
import { getOwnedReminder, getOwnedBaby } from "@/lib/data";
import { sendEmail, buildReminderEmail } from "@/lib/email";
import { auditEvent, AUDIT_EVENT_TYPES, getRequestId } from "@/lib/audit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(req);
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

  await auditEvent({ eventType: AUDIT_EVENT_TYPES.EMAIL_ATTEMPTED, userId: user.id, babyId: reminder.babyId, entityType: "reminder", entityId: reminder.id, requestId, metadata: { channel: "email" } });

  const result = await sendEmail({ to: user.email, subject, text });

  if (!result.ok) {
    await auditEvent({ eventType: AUDIT_EVENT_TYPES.EMAIL_FAILED, userId: user.id, babyId: reminder.babyId, entityType: "reminder", entityId: reminder.id, requestId, metadata: { channel: "email" } });
    // The detailed provider/internal error is already logged server-side by
    // sendEmail() itself — never forward it to the client.
    return NextResponse.json(
      { error: "Unable to send the reminder email right now. Please try again." },
      { status: 502 }
    );
  }

  await auditEvent({ eventType: AUDIT_EVENT_TYPES.EMAIL_SENT, userId: user.id, babyId: reminder.babyId, entityType: "reminder", entityId: reminder.id, requestId, metadata: { channel: "email", mode: result.mode } });
  return NextResponse.json({ result: { ok: true, mode: result.mode } });
}
