"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Moon, Milk, Pipette } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { LiveElapsed } from "./LiveElapsed";
import type { ActivityType } from "@/db/schema";

const icons: Record<string, typeof Moon> = { SLEEP: Moon, FEED: Milk, PUMP: Pipette };
const labels: Record<string, string> = {
  SLEEP: "Sleeping now",
  FEED: "Feeding now",
  PUMP: "Pumping now",
};

export function ActiveTimerCard({
  id,
  type,
  startTime,
}: {
  id: string;
  type: ActivityType;
  startTime: Date;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const Icon = icons[type] ?? Moon;

  async function stop() {
    setLoading(true);
    const res = await fetch(`/api/activities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endTime: new Date().toISOString() }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Couldn't stop the timer. Try again.");
      return;
    }
    toast.success(`${labels[type].replace(" now", "")} logged`);
    router.refresh();
  }

  return (
    <Card className="bg-teal-soft border-teal/30 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-teal-strong shrink-0">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{labels[type] ?? "In progress"}</p>
          <p className="text-xs text-ink-soft tabular-nums">
            <LiveElapsed since={startTime} />
          </p>
        </div>
      </div>
      <Button variant="primary" size="sm" onClick={stop} disabled={loading}>
        Stop
      </Button>
    </Card>
  );
}
