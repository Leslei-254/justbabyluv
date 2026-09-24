"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Sparkles } from "lucide-react";
import { Card, EmptyState } from "@/components/ui/primitives";
import { ActivityRow } from "./ActivityRow";
import { LogActivitySheet } from "@/components/dashboard/LogActivitySheet";
import { formatClockTime, formatDayLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { activities, milestones, ActivityType } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Activity = InferSelectModel<typeof activities>;
type Milestone = InferSelectModel<typeof milestones>;

const filters: { value: "ALL" | ActivityType | "MILESTONE"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "FEED", label: "Feeding" },
  { value: "DIAPER", label: "Diapers" },
  { value: "SLEEP", label: "Sleep" },
  { value: "PUMP", label: "Pumping" },
  { value: "MEDICATION", label: "Medicine" },
  { value: "MILESTONE", label: "Baby Steps" },
];

export function TimelineView({
  activities,
  milestones,
}: {
  activities: Activity[];
  milestones: Milestone[];
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("ALL");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const grouped = useMemo(() => {
    type Entry =
      | { kind: "activity"; date: Date; data: Activity }
      | { kind: "milestone"; date: Date; data: Milestone };

    const entries: Entry[] = [
      ...(filter === "ALL" || filter !== "MILESTONE"
        ? activities
            .filter((a) => filter === "ALL" || a.type === filter)
            .map((a): Entry => ({ kind: "activity", date: a.startTime, data: a }))
        : []),
      ...(filter === "ALL" || filter === "MILESTONE"
        ? milestones.map((m): Entry => ({ kind: "milestone", date: m.date, data: m }))
        : []),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    const byDay = new Map<string, Entry[]>();
    for (const entry of entries) {
      const key = entry.date.toDateString();
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(entry);
    }
    return Array.from(byDay.entries());
  }, [activities, milestones, filter]);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 sm:pt-8 space-y-5">
      <h1 className="font-display text-2xl text-ink">Timeline</h1>

      <div
        className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4"
        role="tablist"
        aria-label="Filter timeline"
      >
        {filters.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium border transition-colors",
              filter === f.value
                ? "bg-rose text-white border-rose"
                : "bg-surface text-ink-soft border-border hover:bg-cream"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarClock size={22} />}
            title={filter === "ALL" ? "No activities yet" : "Nothing logged here yet"}
            description={
              filter === "ALL"
                ? "Logged activities and Baby Steps will show up here."
                : `No ${filters.find((f) => f.value === filter)?.label.toLowerCase()} logged in the last 30 days.`
            }
          />
        </Card>
      ) : (
        grouped.map(([dayKey, entries]) => (
          <Card key={dayKey}>
            <h2 className="text-sm font-semibold text-ink-soft mb-1">
              {formatDayLabel(entries[0].date)}
            </h2>
            <div>
              {entries.map((entry) =>
                entry.kind === "activity" ? (
                  <ActivityRow
                    key={entry.data.id}
                    activity={entry.data}
                    onEdit={setEditingActivity}
                  />
                ) : (
                  <MilestoneRow key={entry.data.id} milestone={entry.data} />
                )
              )}
            </div>
          </Card>
        ))
      )}

      {editingActivity && (
        <LogActivitySheet
          open={Boolean(editingActivity)}
          onClose={() => setEditingActivity(null)}
          type={editingActivity.type}
          activity={editingActivity}
        />
      )}
    </div>
  );
}

function MilestoneRow({ milestone }: { milestone: Milestone }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-full bg-sand-soft flex items-center justify-center text-sand shrink-0">
        <Sparkles size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink truncate">{milestone.title}</p>
        <p className="text-xs text-ink-soft">
          {formatClockTime(milestone.date)}
          {milestone.note ? ` · ${milestone.note}` : ""}
        </p>
      </div>
    </div>
  );
}
