import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { emailEvents } from "@/db/schema";
import { logServerError } from "@/lib/logger";

export type EmailEventType = "welcome" | "reminder";

export async function queueEmailEvent(input: {
  userId: string;
  email: string;
  type: EmailEventType;
  provider: string;
  idempotencyKey?: string;
}) {
  try {
    if (input.idempotencyKey) {
      const existing = await db.query.emailEvents.findFirst({
        where: and(
          eq(emailEvents.userId, input.userId),
          eq(emailEvents.idempotencyKey, input.idempotencyKey)
        ),
      });

      if (existing) {
        if (existing.status === "sent") {
          return { id: existing.id, shouldSend: false };
        }

        await db
          .update(emailEvents)
          .set({
            status: "queued",
            provider: input.provider,
            error: null,
          })
          .where(eq(emailEvents.id, existing.id));

        return { id: existing.id, shouldSend: true };
      }
    }

    const [event] = await db
      .insert(emailEvents)
      .values({
        userId: input.userId,
        email: input.email,
        type: input.type,
        provider: input.provider,
        idempotencyKey: input.idempotencyKey,
        status: "queued",
      })
      .returning({ id: emailEvents.id });

    return { id: event?.id ?? null, shouldSend: true };
  } catch (error) {
    logServerError({
      event: "email_tracking.queue_failed",
      userId: input.userId,
      metadata: { type: input.type },
      error,
    });
    return { id: null, shouldSend: true };
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
