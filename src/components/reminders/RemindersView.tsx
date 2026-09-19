"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, Check, Clock, Pencil, Trash2, Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/primitives";
import { ReminderSheet } from "./ReminderSheet";
import { cn, formatClockTime, formatDayLabel } from "@/lib/utils";
import type { reminders } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Reminder = InferSelectModel<typeof reminders>;

export function RemindersView({
  babyId,
  babyName,
  reminders,
}: {
  babyId: string;
  babyName: string;
  reminders: Reminder[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);

  const pending = reminders.filter((r) => !r.completed);
  const completed = reminders.filter((r) => r.completed);

  async function complete(r: Reminder) {
    const res = await fetch(`/api/reminders/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    if (!res.ok) {
      toast.error("Couldn't update that. Try again.");
      return;
    }
    toast.success("Marked complete");
    router.refresh();
  }

  async function snooze(r: Reminder) {
    const snoozedUntil = new Date(Date.now() + 15 * 60 * 1000);
    const res = await fetch(`/api/reminders/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        datetime: snoozedUntil.toISOString(),
        snoozedUntil: snoozedUntil.toISOString(),
      }),
    });
    if (!res.ok) {
      toast.error("Couldn't snooze that. Try again.");
      return;
    }
    toast.success("Snoozed 15 minutes");
    router.refresh();
  }

  async function remove(r: Reminder) {
    if (!confirm("Delete this reminder?")) return;
    const res = await fetch(`/api/reminders/${r.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Couldn't delete that. Try again.");
      return;
    }
    toast.success("Deleted");
    router.refresh();
  }

  async function sendTest(r: Reminder) {
    const res = await fetch(`/api/reminders/${r.id}/notify`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      toast.error("Couldn't send that. Try again.");
      return;
    }
    if (data.result?.mode === "dev-fallback") {
      toast.info("No email provider configured — logged to server console instead.");
    } else {
      toast.success("Reminder email sent");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 sm:pt-8 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Reminders</h1>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus size={16} className="mr-1" /> New
        </Button>
      </div>

      {pending.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bell size={22} />}
            title="No reminders yet"
            description={`Create a reminder for ${babyName}'s next feed, pump, or medicine.`}
            action={<Button onClick={() => setOpen(true)}>New reminder</Button>}
          />
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {pending.map((r) => (
              <li key={r.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{r.title}</p>
                  <p className="text-xs text-ink-soft">
                    {formatDayLabel(r.datetime)} · {formatClockTime(r.datetime)}
                    {r.repeat !== "none" ? ` · repeats ${r.repeat}` : ""}
                    {r.emailEnabled ? " · email on" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {r.emailEnabled && (
                    <button
                      aria-label="Send test email"
                      onClick={() => sendTest(r)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream"
                      title="Send test email"
                    >
                      <Mail size={14} />
                    </button>
                  )}
                  <button
                    aria-label="Snooze 15 minutes"
                    onClick={() => snooze(r)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream"
                    title="Snooze 15 minutes"
                  >
                    <Clock size={14} />
                  </button>
                  <button
                    aria-label="Edit"
                    onClick={() => {
                      setEditing(r);
                      setOpen(true);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    aria-label="Mark complete"
                    onClick={() => complete(r)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-success hover:bg-success-soft"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    aria-label="Delete"
                    onClick={() => remove(r)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-danger hover:bg-danger-soft"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {completed.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-ink-soft mb-1">Completed</h2>
          <ul className="divide-y divide-border">
            {completed.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                <p className={cn("text-sm text-ink-soft line-through truncate")}>
                  {r.title}
                </p>
                <button
                  aria-label="Delete"
                  onClick={() => remove(r)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-danger hover:bg-danger-soft shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ReminderSheet
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        babyId={babyId}
        reminder={editing}
      />
    </div>
  );
}
