import Link from "next/link";
import { Card, EmptyState } from "@/components/ui/primitives";
import { Bell } from "lucide-react";
import { formatClockTime, formatDayLabel } from "@/lib/utils";
import type { reminders } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Reminder = InferSelectModel<typeof reminders>;

export function UpcomingReminders({ reminders }: { reminders: Reminder[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-lg text-ink">Upcoming reminders</h2>
        <Link href="/reminders" className="text-sm text-teal-strong font-medium">
          View all
        </Link>
      </div>
      {reminders.length === 0 ? (
        <EmptyState
          icon={<Bell size={22} />}
          title="No reminders yet"
          description="Set a reminder for feeding, pumping, or medicine so you never lose track."
        />
      ) : (
        <ul className="divide-y divide-border">
          {reminders.map((r) => (
            <li key={r.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{r.title}</p>
                <p className="text-xs text-ink-soft">
                  {formatDayLabel(r.datetime)} · {formatClockTime(r.datetime)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
