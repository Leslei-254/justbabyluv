import Link from "next/link";
import { Bell, AlertCircle } from "lucide-react";
import { Card, EmptyState } from "@/components/ui/primitives";
import { formatClockTime, formatDayLabel } from "@/lib/utils";
import type { reminders } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Reminder = InferSelectModel<typeof reminders>;

export function UpcomingReminders({
  overdue,
  upcoming,
}: {
  overdue: Reminder[];
  upcoming: Reminder[];
}) {
  const isEmpty = overdue.length === 0 && upcoming.length === 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-lg text-ink">Reminders</h2>
        <Link href="/reminders" className="text-sm text-rose-strong font-medium">
          View all
        </Link>
      </div>
      {isEmpty ? (
        <EmptyState
          icon={<Bell size={22} />}
          title="No reminders yet"
          description="Set a reminder for feeding, pumping, or medicine so you never lose track."
        />
      ) : (
        <div className="space-y-3">
          {overdue.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium text-danger mb-1">
                <AlertCircle size={13} /> Overdue
              </p>
              <ul className="divide-y divide-border">
                {overdue.map((r) => (
                  <ReminderRow key={r.id} reminder={r} overdue />
                ))}
              </ul>
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              {overdue.length > 0 && (
                <p className="text-xs font-medium text-ink-faint mb-1">Upcoming</p>
              )}
              <ul className="divide-y divide-border">
                {upcoming.map((r) => (
                  <ReminderRow key={r.id} reminder={r} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function ReminderRow({ reminder, overdue }: { reminder: Reminder; overdue?: boolean }) {
  return (
    <li className="py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink truncate">{reminder.title}</p>
        <p className={`text-xs ${overdue ? "text-danger" : "text-ink-soft"}`}>
          {formatDayLabel(reminder.datetime)} · {formatClockTime(reminder.datetime)}
        </p>
      </div>
    </li>
  );
}
