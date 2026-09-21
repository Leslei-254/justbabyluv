import { Milk, Droplet, Moon, Pipette, Pill, Sparkles } from "lucide-react";
import type { ActivityType } from "@/db/schema";

export const activityMeta: Record<
  ActivityType,
  { label: string; icon: typeof Milk; emoji: string; colorVar: string }
> = {
  FEED: { label: "Feed", icon: Milk, emoji: "🍼", colorVar: "rose" },
  DIAPER: { label: "Diaper", icon: Droplet, emoji: "🧷", colorVar: "sand" },
  SLEEP: { label: "Sleep", icon: Moon, emoji: "😴", colorVar: "rose" },
  PUMP: { label: "Pump", icon: Pipette, emoji: "🤱", colorVar: "sand" },
  MEDICATION: { label: "Medicine", icon: Pill, emoji: "💊", colorVar: "rose" },
};

export const milestoneIcon = Sparkles;

export function activityHeadline(activity: {
  type: ActivityType;
  subtype?: string | null;
  amount?: number | null;
  unit?: string | null;
  side?: string | null;
  medicationName?: string | null;
  endTime?: Date | null;
}) {
  switch (activity.type) {
    case "FEED": {
      const kind = activity.subtype
        ? activity.subtype.charAt(0).toUpperCase() + activity.subtype.slice(1)
        : "Feed";
      if (activity.amount) return `${kind} · ${activity.amount}${activity.unit ?? ""}`;
      return kind;
    }
    case "DIAPER":
      return activity.subtype
        ? activity.subtype.charAt(0).toUpperCase() + activity.subtype.slice(1)
        : "Diaper";
    case "SLEEP":
      return activity.endTime ? "Sleep ended" : "Sleeping now";
    case "PUMP": {
      const side = activity.side ? ` · ${activity.side}` : "";
      return activity.amount ? `${activity.amount}${activity.unit ?? ""}${side}` : `Pumping${side}`;
    }
    case "MEDICATION":
      return activity.medicationName || "Medicine";
    default:
      return "Activity";
  }
}
