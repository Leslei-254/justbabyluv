import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    const [user] = await db
      .insert(users)
      .values({ name, email: normalizedEmail, passwordHash })
      .returning({ id: users.id, name: users.name, email: users.email });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    // The pre-check above handles the common case, but the database's unique
    // constraint on users.email is the final authority (e.g. two concurrent
    // signups for the same email racing past the pre-check). Drizzle wraps
    // the underlying libsql error in a DrizzleQueryError, so the SQLite error
    // code lives on `err.cause`, not on `err` itself — check both defensively.
    const sqliteCode =
      (err as { code?: string })?.code ??
      (err as { cause?: { code?: string } })?.cause?.code;
    const isDuplicateEmail = sqliteCode === "SQLITE_CONSTRAINT";

    if (isDuplicateEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    console.error("[signup] Unexpected error creating user:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
