import { db } from "@/db";
import { auditEvents } from "@/db/schema";
import { logServerError } from "@/lib/logger";

export const AUDIT_EVENT_TYPES = {
  ACCOUNT_SIGNUP: "account.signup",
  BABY_CREATE: "baby.create",
  ACTIVITY_CREATE: "activity.create",
  MILESTONE_CREATE: "milestone.create",
  MILESTONE_UPDATE: "milestone.update",
  MILESTONE_DELETE: "milestone.delete",
  ACTIVITY_UPDATE: "activity.update",
  ACTIVITY_DELETE: "activity.delete",
  REMINDER_CREATE: "reminder.create",
  DEMO_DATA_SEED: "demo_data.seed",
  DEMO_DATA_CLEAR: "demo_data.clear",
  SETTINGS_UPDATE: "settings.update",
  REMINDER_UPDATE: "reminder.update",
  REMINDER_DELETE: "reminder.delete",
  REMINDER_COMPLETE: "reminder.complete",
  REMINDER_SNOOZE: "reminder.snooze",
  EMAIL_ATTEMPTED: "email.reminder.attempted",
  EMAIL_SENT: "email.reminder.sent",
  EMAIL_FAILED: "email.reminder.failed",
  AUTH_SUCCESS: "auth.success",
  AUTH_FAILURE: "auth.failure",
  ERROR: "error",
} as const;

type AuditMetadata = Record<string, string | number | boolean | null>;

type AuditEventInput = {
  eventType: string;
  userId?: string | null;
  babyId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  requestId?: string | null;
  metadata?: AuditMetadata;
};

export function getRequestId(req: Request) {
  return req.headers.get("x-request-id")?.trim() || crypto.randomUUID();
}

export async function auditEvent(input: AuditEventInput) {
  try {
    await db.insert(auditEvents).values({
      eventType: input.eventType,
      userId: input.userId ?? null,
      babyId: input.babyId ?? null,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      requestId: input.requestId ?? null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    });
  } catch (error) {
    logServerError({
      event: "audit.persist_failed",
      requestId: input.requestId,
      userId: input.userId,
      metadata: { eventType: input.eventType },
      error,
    });
  }
}
