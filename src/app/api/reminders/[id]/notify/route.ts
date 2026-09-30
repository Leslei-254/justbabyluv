import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/session";
import { queueEmailEvent, completeEmailEvent } from "@/lib/email-events";
import { getOwnedReminder, getOwnedBaby } from "@/lib/data";
import { sendEmail, buildReminderEmail } from "@/lib/email";
import { auditEvent, AUDIT_EVENT_TYPES, getRequestId } from "@/lib/audit";
import { consumeRateLimit, getClientAddress } from "@/lib/rate-limit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(req);
  const user = await getAuthedUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const address = getClientAddress(req);
  const rate = consumeRateLimit(
    `email-reminder:user:${user.id}:ip:${address}`,
    10,
    15 * 60 * 1000
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many email requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfterSeconds),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const { id } = await params;
  const reminder = await getOwnedReminder(user.id, id);
  if (!reminder) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const baby = await getOwnedBaby(user.id, reminder.babyId);
  if (!baby) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { subject, text } = buildReminderEmail({
    babyName: baby.name,
    title: reminder.title,
    when: reminder.datetime,
  });

  await auditEvent({
    eventType: AUDIT_EVENT_TYPES.EMAIL_ATTEMPTED,
    userId: user.id,
    babyId: reminder.babyId,
    entityType: "reminder",
    entityId: reminder.id,
    requestId,
    metadata: { channel: "email" },
  });

  const emailEvent = await queueEmailEvent({
    userId: user.id,
    email: user.email,
    type: "reminder",
    provider: process.env.RESEND_API_KEY ? "resend" : "dev-fallback",
  });

  const result = await sendEmail({ to: user.email, subject, text });

  await completeEmailEvent({
    id: emailEvent.id,
    userId: user.id,
    ok: result.ok,
    providerMessageId: result.ok ? result.providerMessageId : null,
  });

  if (!result.ok) {
    await auditEvent({
      eventType: AUDIT_EVENT_TYPES.EMAIL_FAILED,
      userId: user.id,
      babyId: reminder.babyId,
      entityType: "reminder",
      entityId: reminder.id,
      requestId,
      metadata: { channel: "email" },
    });
    return NextResponse.json(
      { error: "Unable to send the reminder email right now. Please try again." },
      { status: 502 }
    );
  }

  await auditEvent({
    eventType: AUDIT_EVENT_TYPES.EMAIL_SENT,
    userId: user.id,
    babyId: reminder.babyId,
    entityType: "reminder",
    entityId: reminder.id,
    requestId,
    metadata: { channel: "email", mode: result.mode },
  });

  return NextResponse.json({ result: { ok: true, mode: result.mode } });
}
