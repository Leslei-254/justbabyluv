"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { activityMeta, activityHeadline } from "@/lib/activity-meta";
import { formatClockTime, formatDuration } from "@/lib/utils";
import type { activities } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Activity = InferSelectModel<typeof activities>;

export function ActivityRow({
  activity,
  onEdit,
}: {
  activity: Activity;
  onEdit?: (activity: Activity) => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const meta = activityMeta[activity.type];
  const Icon = meta.icon;

  async function onDelete() {
    if (!confirm("Delete this activity? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/activities/${activity.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      toast.error("Couldn't delete that. Try again.");
      return;
    }
    toast.success("Deleted");
    router.refresh();
  }

  const duration =
    activity.endTime && activity.startTime
      ? formatDuration(activity.endTime.getTime() - activity.startTime.getTime())
      : null;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0 group">
      <div className="w-9 h-9 rounded-full bg-rose-soft flex items-center justify-center text-rose-strong shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink truncate">
          {activityHeadline(activity)}
        </p>
        <p className="text-xs text-ink-soft">
          {formatClockTime(activity.startTime)}
          {duration ? ` · ${duration}` : ""}
          {activity.notes ? ` · ${activity.notes}` : ""}
        </p>
      </div>
      <div className="flex sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 items-center gap-1 shrink-0">
        {onEdit && (
          <button
            aria-label="Edit"
            onClick={() => onEdit(activity)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream"
          >
            <Pencil size={14} />
          </button>
        )}
        <button
          aria-label="Delete"
          onClick={onDelete}
          disabled={deleting}
          className="w-10 h-10 rounded-full flex items-center justify-center text-danger hover:bg-danger-soft"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
