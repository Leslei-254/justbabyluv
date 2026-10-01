import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { babies, emailEvents, users } from "@/db/schema";
import { getAuthedUser } from "@/lib/session";
import { getRequestId } from "@/lib/audit";
import { logServerError } from "@/lib/logger";

export async function DELETE(req: Request) {
  const requestId = getRequestId(req);
  const user = await getAuthedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  if (
    !body ||
    typeof body !== "object" ||
    body.confirmation !== "DELETE"
  ) {
    return NextResponse.json(
      { error: 'Type "DELETE" to confirm account deletion.' },
      { status: 400 }
    );
  }

  try {
    const deleted = await db.transaction(async (tx) => {
      // Email events contain the user's email address directly, so
      // remove those records rather than retaining them after deletion.
      await tx
        .delete(emailEvents)
        .where(eq(emailEvents.userId, user.id));

      // Deleting babies cascades to activities, milestones and reminders.
      await tx
        .delete(babies)
        .where(eq(babies.userId, user.id));

      // Audit events intentionally remain. Their existing foreign key
      // changes userId to NULL when the user is deleted.
      return tx
        .delete(users)
        .where(eq(users.id, user.id))
        .returning({ id: users.id });
    });

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Account could not be deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logServerError({
      event: "account.delete_failed",
      requestId,
      userId: user.id,
      metadata: {
        operation: "account_deletion",
      },
      error,
    });

    return NextResponse.json(
      { error: "We couldn't delete your account. Please try again." },
      { status: 500 }
    );
  }
}
