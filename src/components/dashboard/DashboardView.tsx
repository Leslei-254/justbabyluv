"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { BabyHeader } from "./BabyHeader";
import { QuickActions, type QuickActionKind } from "./QuickActions";
import { LogActivitySheet } from "./LogActivitySheet";
import { ActiveTimerCard } from "./ActiveTimerCard";
import { TodaySummary } from "./TodaySummary";
import { UpcomingReminders } from "./UpcomingReminders";
import { MilestoneSheet } from "@/components/milestones/MilestoneSheet";
import { ActivityRow } from "@/components/timeline/ActivityRow";
import { Card, EmptyState } from "@/components/ui/primitives";
import type { activities, babies, reminders } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Activity = InferSelectModel<typeof activities>;
type Baby = InferSelectModel<typeof babies>;
type Reminder = InferSelectModel<typeof reminders>;

export function DashboardView({
  baby,
  activeTimers,
  recentActivities,
  upcomingReminders,
  todayStats,
}: {
  baby: Baby;
  activeTimers: Activity[];
  recentActivities: Activity[];
  upcomingReminders: Reminder[];
  todayStats: {
    feeds: number;
    diapers: number;
    sleepMs: number;
    pumps: number;
    medsCompleted: number;
    milestones: number;
  };
}) {
  const router = useRouter();
  const [sheetType, setSheetType] = useState<
    Exclude<Activity["type"], "SLEEP"> | null
  >(null);
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [startingSleep, setStartingSleep] = useState(false);

  const activeSleep = activeTimers.find((a) => a.type === "SLEEP");

  async function handleAction(kind: QuickActionKind) {
    if (kind === "STEP") {
      setMilestoneOpen(true);
      return;
    }
    if (kind === "SLEEP") {
      if (activeSleep) {
        const res = await fetch(`/api/activities/${activeSleep.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endTime: new Date().toISOString() }),
        });
        if (!res.ok) {
          toast.error("Couldn't stop sleep. Try again.");
          return;
        }
        toast.success("Sleep logged");
        router.refresh();
        return;
      }
      setStartingSleep(true);
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          babyId: baby.id,
          type: "SLEEP",
          startTime: new Date().toISOString(),
        }),
      });
      setStartingSleep(false);
      if (!res.ok) {
        toast.error("Couldn't start sleep timer.");
        return;
      }
      toast.success("Sleep timer started");
      router.refresh();
      return;
    }
    setSheetType(kind);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 sm:pt-8 space-y-6">
      <BabyHeader name={baby.name} dob={baby.dob} photoUrl={baby.photoUrl} />

      {activeTimers.length > 0 && (
        <div className="space-y-2">
          {activeTimers.map((t) => (
            <ActiveTimerCard key={t.id} id={t.id} type={t.type} startTime={t.startTime} />
          ))}
        </div>
      )}

      <QuickActions
        onAction={handleAction}
        sleepActive={Boolean(activeSleep) || startingSleep}
      />

      <TodaySummary {...todayStats} />

      <UpcomingReminders reminders={upcomingReminders} />

      <Card>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg text-ink">Recent activity</h2>
          <Link href="/timeline" className="text-sm text-teal-strong font-medium">
            View timeline
          </Link>
        </div>
        {recentActivities.length === 0 ? (
          <EmptyState
            icon={<CalendarClock size={22} />}
            title="No activities yet"
            description="Start by logging your baby's first feed, diaper change, or sleep."
          />
        ) : (
          <div>
            {recentActivities.map((a) => (
              <ActivityRow key={a.id} activity={a} />
            ))}
          </div>
        )}
      </Card>

      {sheetType && (
        <LogActivitySheet
          open={Boolean(sheetType)}
          onClose={() => setSheetType(null)}
          babyId={baby.id}
          type={sheetType}
        />
      )}
      <MilestoneSheet
        open={milestoneOpen}
        onClose={() => setMilestoneOpen(false)}
        babyId={baby.id}
      />
    </div>
  );
}
