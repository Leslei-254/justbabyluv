import { desc } from "drizzle-orm";
import { db } from "@/db";
import { auditEvents } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { requireAdminEmail } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireUser();
  requireAdminEmail(user.email);

  const recentEvents = await db.query.auditEvents.findMany({
    columns: {
      id: true,
      eventType: true,
      requestId: true,
      createdAt: true,
    },
    orderBy: [desc(auditEvents.createdAt)],
    limit: 20,
  });

  const healthUrl = "/api/health";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <header>
          <p className="text-sm font-medium text-muted-foreground">Operations</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Admin health checks</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A private operational view for database health and recent application events.
          </p>
        </header>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Database health</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The public readiness endpoint checks whether the application can reach the database.
              </p>
            </div>
            <a
              href={healthUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              Open health endpoint
            </a>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold">Recent operational events</h2>
            <p className="mt-1 text-sm text-muted-foreground">Latest 20 audit events. Sensitive event metadata is not displayed here.</p>
          </div>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No operational events recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 font-medium">Event</th>
                    <th className="px-3 py-3 font-medium">Request ID</th>
                    <th className="px-3 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-3 py-3 font-medium">{event.eventType}</td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{event.requestId ?? "—"}</td>
                      <td className="px-3 py-3 text-muted-foreground">{event.createdAt.toISOString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
