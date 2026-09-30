import { eq } from "drizzle-orm";
import { db } from "@/db";
import { emailEvents } from "@/db/schema";
import { logServerError } from "@/lib/logger";

export type EmailEventType = "welcome" | "reminder";

export async function queueEmailEvent(input: {
  userId: string;
  email: string;
  type: EmailEventType;
  provider: string;
}) {
  try {
    const [event] = await db
      .insert(emailEvents)
      .values({
        userId: input.userId,
        email: input.email,
        type: input.type,
        provider: input.provider,
        status: "queued",
      })
      .returning({ id: emailEvents.id });

    return event?.id ?? null;
  } catch (error) {
    logServerError({
      event: "email_tracking.queue_failed",
      userId: input.userId,
      metadata: { type: input.type },
      error,
    });
    return null;
  }
}

export async function completeEmailEvent(input: {
  id: string | null;
  userId: string;
  ok: boolean;
  providerMessageId?: string | null;
}) {
  if (!input.id) return;

  try {
    await db
      .update(emailEvents)
      .set(
        input.ok
          ? {
              status: "sent",
              providerMessageId: input.providerMessageId ?? null,
              sentAt: new Date(),
              error: null,
            }
          : {
              status: "failed",
              error: "Email delivery failed",
            }
      )
      .where(eq(emailEvents.id, input.id));
  } catch (error) {
    logServerError({
      event: "email_tracking.update_failed",
      userId: input.userId,
      metadata: { emailEventId: input.id },
      error,
    });
  }
}
