"use client";

import { useMemo, useState } from "react";
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
import { RecentMilestones } from "./RecentMilestones";
import { MilestoneSheet } from "@/components/milestones/MilestoneSheet";
import { ActivityRow } from "@/components/timeline/ActivityRow";
import { Card, EmptyState } from "@/components/ui/primitives";
import { startOfDay, endOfDay } from "@/lib/utils";
import type { activities, babies, reminders, milestones } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Activity = InferSelectModel<typeof activities>;
type Baby = InferSelectModel<typeof babies>;
type Reminder = InferSelectModel<typeof reminders>;
type Milestone = InferSelectModel<typeof milestones>;

const NETWORK_ERROR_MESSAGE = "Couldn't reach the server. Check your connection and try again.";

export function DashboardView({
  baby,
  activeTimers,
  bufferActivities,
  recentActivities,
  overdueReminders,
  upcomingReminders,
  bufferMilestones,
  recentMilestones,
}: {
  baby: Baby;
  activeTimers: Activity[];
  bufferActivities: Activity[];
  recentActivities: Activity[];
  overdueReminders: Reminder[];
  upcomingReminders: Reminder[];
  bufferMilestones: Milestone[];
  recentMilestones: Milestone[];
}) {
  const router = useRouter();
  const [sheetType, setSheetType] = useState<
    Exclude<Activity["type"], "SLEEP"> | null
  >(null);
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [startingSleep, setStartingSleep] = useState(false);
  const [stoppingSleep, setStoppingSleep] = useState(false);

  const activeSleep = activeTimers.find((a) => a.type === "SLEEP");

  // Computed here (client-side) rather than on the server, so "today" always
  // reflects the parent's own local calendar day — see dashboard/page.tsx for
  // why the buffer arrives pre-widened.
  const todayStats = useMemo(() => {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const isToday = (d: Date) => d >= todayStart && d <= todayEnd;

    const todaysActivities = bufferActivities.filter((a) => isToday(a.startTime));
    const todaysMilestones = bufferMilestones.filter((m) => isToday(m.date));

    return {
      feeds: todaysActivities.filter((a) => a.type === "FEED").length,
      diapers: todaysActivities.filter((a) => a.type === "DIAPER").length,
      sleepMs: todaysActivities
        .filter((a) => a.type === "SLEEP" && a.endTime)
        .reduce((sum, a) => sum + (a.endTime!.getTime() - a.startTime.getTime()), 0),
      pumps: todaysActivities.filter((a) => a.type === "PUMP").length,
      medsLogged: todaysActivities.filter((a) => a.type === "MEDICATION").length,
      milestones: todaysMilestones.length,
    };
  }, [bufferActivities, bufferMilestones]);

  async function handleAction(kind: QuickActionKind) {
    if (kind === "STEP") {
      setMilestoneOpen(true);
      return;
    }
    if (kind === "SLEEP") {
      if (activeSleep) {
        setStoppingSleep(true);
        try {
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
        } catch {
          toast.error(NETWORK_ERROR_MESSAGE);
        } finally {
          setStoppingSleep(false);
        }
        return;
      }
      setStartingSleep(true);
      try {
        const res = await fetch("/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            babyId: baby.id,
            type: "SLEEP",
            startTime: new Date().toISOString(),
          }),
        });
        if (!res.ok) {
          toast.error("Couldn't start sleep timer.");
          return;
        }
        toast.success("Sleep timer started");
        router.refresh();
      } catch {
        toast.error(NETWORK_ERROR_MESSAGE);
      } finally {
        setStartingSleep(false);
      }
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
        sleepBusy={startingSleep || stoppingSleep}
      />

      <TodaySummary {...todayStats} />

      <UpcomingReminders overdue={overdueReminders} upcoming={upcomingReminders} />

      <Card>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg text-ink">Recent activity</h2>
          <Link href="/timeline" className="text-sm text-rose-strong font-medium">
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

      <RecentMilestones milestones={recentMilestones} />

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
