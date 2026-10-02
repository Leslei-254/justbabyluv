import { Milk, Droplet, Moon, Pipette, Pill, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
export type QuickActionKind = "FEED" | "DIAPER" | "SLEEP" | "PUMP" | "MEDICATION" | "STEP";
const actions: { kind: QuickActionKind; label: string; icon: typeof Milk }[] = [
  { kind: "FEED", label: "Feed", icon: Milk }, { kind: "DIAPER", label: "Diaper", icon: Droplet }, { kind: "SLEEP", label: "Sleep", icon: Moon },
  { kind: "PUMP", label: "Pump", icon: Pipette }, { kind: "MEDICATION", label: "Medicine", icon: Pill }, { kind: "STEP", label: "Baby Step", icon: Footprints },
];
export function QuickActions({ onAction, sleepActive, sleepBusy }: { onAction: (kind: QuickActionKind) => void; sleepActive?: boolean; sleepBusy?: boolean; }) {
  return <div className="grid grid-cols-3 gap-3" role="group" aria-label="Quick actions">
    {actions.map(({ kind, label, icon: Icon }) => {
      const isActiveSleep = kind === "SLEEP" && sleepActive;
      const isDisabled = kind === "SLEEP" && sleepBusy;
      return <button key={kind} onClick={() => onAction(kind)} disabled={isDisabled} aria-pressed={kind === "SLEEP" ? Boolean(sleepActive) : undefined}
        className={cn("flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-5 text-sm font-medium text-ink transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out hover:bg-rose-soft hover:border-rose/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] active:bg-rose-soft min-h-[92px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100", isActiveSleep && "bg-rose-soft border-rose")}>
        <span className={cn("w-9 h-9 rounded-full flex items-center justify-center", isActiveSleep ? "bg-rose text-white" : "bg-rose-soft text-rose-strong")}><Icon size={18} /></span>
        {isActiveSleep ? "Stop Sleep" : label}
      </button>;
    })}
  </div>;
}
