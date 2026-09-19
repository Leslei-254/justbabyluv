import { Milk, Droplet, Moon, Pipette, Pill, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuickActionKind = "FEED" | "DIAPER" | "SLEEP" | "PUMP" | "MEDICATION" | "STEP";

const actions: { kind: QuickActionKind; label: string; icon: typeof Milk }[] = [
  { kind: "FEED", label: "Feed", icon: Milk },
  { kind: "DIAPER", label: "Diaper", icon: Droplet },
  { kind: "SLEEP", label: "Sleep", icon: Moon },
  { kind: "PUMP", label: "Pump", icon: Pipette },
  { kind: "MEDICATION", label: "Medicine", icon: Pill },
  { kind: "STEP", label: "Baby Step", icon: Footprints },
];

export function QuickActions({
  onAction,
  sleepActive,
}: {
  onAction: (kind: QuickActionKind) => void;
  sleepActive?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-3" role="group" aria-label="Quick actions">
      {actions.map(({ kind, label, icon: Icon }) => (
        <button
          key={kind}
          onClick={() => onAction(kind)}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-5 text-sm font-medium text-ink transition-colors hover:bg-teal-soft active:bg-teal-soft min-h-[92px]",
            kind === "SLEEP" && sleepActive && "bg-teal-soft border-teal"
          )}
        >
          <Icon size={24} className="text-teal-strong" />
          {kind === "SLEEP" && sleepActive ? "Stop Sleep" : label}
        </button>
      ))}
    </div>
  );
}
