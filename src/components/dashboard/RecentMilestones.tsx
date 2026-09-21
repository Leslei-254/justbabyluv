import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, EmptyState } from "@/components/ui/primitives";
import { formatDayLabel } from "@/lib/utils";
import type { milestones } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Milestone = InferSelectModel<typeof milestones>;

export function RecentMilestones({ milestones }: { milestones: Milestone[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-lg text-ink">Baby Steps</h2>
        <Link href="/baby-steps" className="text-sm text-rose-strong font-medium">
          View all
        </Link>
      </div>
      {milestones.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={22} />}
          title="No Baby Steps yet"
          description="First smiles, first steps — record the little milestones as they happen."
        />
      ) : (
        <ul className="divide-y divide-border">
          {milestones.map((m) => (
            <li key={m.id} className="py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sand-soft flex items-center justify-center text-sand shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{m.title}</p>
                <p className="text-xs text-ink-soft">{formatDayLabel(m.date)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
