import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { auditEvent, AUDIT_EVENT_TYPES, getRequestId } from "@/lib/audit";
import { buildWelcomeEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { logServerEvent, logServerError } from "@/lib/logger";
import { queueEmailEvent, completeEmailEvent } from "@/lib/email-events";
import { signupSchema } from "@/lib/auth-validation";

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, password } = parsed.data;
  const normalizedEmail = parsed.data.email;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });

  if (existing) {
    return NextResponse.json(
      { error: "Unable to create the account with these details." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    const [user] = await db
      .insert(users)
      .values({ name, email: normalizedEmail, passwordHash })
      .returning({ id: users.id, name: users.name, email: users.email });

    if (!user) {
      throw new Error("User creation returned no user");
    }

    await auditEvent({
      eventType: AUDIT_EVENT_TYPES.ACCOUNT_SIGNUP,
      userId: user.id,
      requestId,
      metadata: { method: "credentials" },
    });

    const welcome = buildWelcomeEmail(user.name);
    const emailEvent = await queueEmailEvent({
      userId: user.id,
      email: user.email,
      type: "welcome",
      provider: process.env.RESEND_API_KEY ? "resend" : "dev-fallback",
      idempotencyKey: `welcome:${user.id}`,
    });

    const emailResult = emailEvent.shouldSend
      ? await sendEmail({
          to: user.email,
          subject: welcome.subject,
          text: welcome.text,
          html: welcome.html,
        })
      : {
          ok: true as const,
          mode: "already-sent" as const,
          providerMessageId: null,
        };

    await completeEmailEvent({
      id: emailEvent.id,
      userId: user.id,
      ok: emailResult.ok,
      providerMessageId: emailResult.ok ? emailResult.providerMessageId : null,
    });

    if (!emailResult.ok) {
      logServerError({
        event: "email.welcome_failed",
        route: "/api/signup",
        requestId,
        userId: user.id,
        metadata: { provider: "resend" },
        error: new Error("Welcome email delivery failed"),
      });
    } else {
      logServerEvent({
        severity: "info",
        event: "email.welcome_sent",
        route: "/api/signup",
        requestId,
        userId: user.id,
        metadata: { mode: emailResult.mode },
      });
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    const sqliteCode =
      (err as { code?: string })?.code ??
      (err as { cause?: { code?: string } })?.cause?.code;
    const isDuplicateEmail =
      sqliteCode === "SQLITE_CONSTRAINT" || sqliteCode === "SQLITE_CONSTRAINT_UNIQUE";

    if (isDuplicateEmail) {
      return NextResponse.json(
        { error: "Unable to create the account with these details." },
        { status: 409 }
      );
    }

    logServerError({
      event: "signup.create_user_failed",
      route: "/api/signup",
      requestId,
      metadata: { operation: "create_user" },
      error: err,
    });

    await auditEvent({
      eventType: AUDIT_EVENT_TYPES.ERROR,
      requestId,
      metadata: { route: "/api/signup", operation: "create_user" },
    });

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
