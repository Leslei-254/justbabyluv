import { sql } from "drizzle-orm";
import { db } from "@/db";
import { getRequestId } from "@/lib/audit";
import { logServerError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getRequestId(req);
  const timestamp = new Date().toISOString();

  try {
    await db.run(sql`SELECT 1`);

    return Response.json(
      {
        status: "ok",
        timestamp,
        requestId,
      },
      { status: 200 },
    );
  } catch (error) {
    logServerError({
      event: "health.database_unavailable",
      route: "/api/health",
      requestId,
      error,
    });

    return Response.json(
      {
        status: "error",
        timestamp,
        requestId,
      },
      { status: 503 },
    );
  }
}
