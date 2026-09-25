"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, Check, Clock, Pencil, Trash2, Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null);
  const [deleting, setDeleting] = useState(false);

  const pending = reminders.filter((r) => !r.completed);
  const completed = reminders.filter((r) => r.completed);

  async function complete(r: Reminder) {
    setBusyId(r.id);
    try {
      const res = await fetch(`/api/reminders/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      if (!res.ok) {
        toast.error("Couldn't update that. Please try again.");
        return;
      }
      toast.success("Marked complete");
      router.refresh();
    } catch {
      toast.error("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function snooze(r: Reminder) {
    setBusyId(r.id);
    try {
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
        toast.error("Couldn't snooze that. Please try again.");
        return;
      }
      toast.success("Snoozed 15 minutes");
      router.refresh();
    } catch {
      toast.error("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/reminders/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Couldn't delete that. Please try again.");
        return;
      }
      toast.success("Deleted");
      setDeleteTarget(null);
      router.refresh();
    } catch {
      toast.error("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setDeleting(false);
    }
  }

  async function sendTest(r: Reminder) {
    setBusyId(r.id);
    try {
      const res = await fetch(`/api/reminders/${r.id}/notify`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error || "Couldn't send that. Please try again.");
        return;
      }
      if (data?.result?.mode === "dev-fallback") {
        toast.info("No email provider configured — logged to server console instead.");
      } else {
        toast.success("Reminder email sent");
      }
    } catch {
      toast.error("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusyId(null);
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
            {pending.map((r) => {
              const busy = busyId === r.id;
              return (
                <li
                  key={r.id}
                  className="py-3 flex flex-wrap items-start justify-between gap-x-3 gap-y-2"
                >
                  <div className="min-w-0 flex-1 basis-40">
                    <p className="text-sm font-medium text-ink truncate">{r.title}</p>
                    <p className="text-xs text-ink-soft">
                      {formatDayLabel(r.datetime)} · {formatClockTime(r.datetime)}
                      {r.repeat !== "none" ? ` · repeats ${r.repeat}` : ""}
                      {r.emailEnabled ? " · email on" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-1 shrink-0">
                    {r.emailEnabled && (
                      <button
                        aria-label="Send test email"
                        onClick={() => sendTest(r)}
                        disabled={busy}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream disabled:opacity-50"
                        title="Send test email"
                      >
                        <Mail size={14} />
                      </button>
                    )}
                    <button
                      aria-label="Snooze 15 minutes"
                      onClick={() => snooze(r)}
                      disabled={busy}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream disabled:opacity-50"
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
                      disabled={busy}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream disabled:opacity-50"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      aria-label="Mark complete"
                      onClick={() => complete(r)}
                      disabled={busy}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-success hover:bg-success-soft disabled:opacity-50"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      aria-label="Delete"
                      onClick={() => setDeleteTarget(r)}
                      disabled={busy}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-danger hover:bg-danger-soft disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {completed.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-ink-soft mb-1">Completed</h2>
          <ul className="divide-y divide-border">
            {completed.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                <p className={cn("text-sm text-ink-soft line-through truncate min-w-0 flex-1")}>
                  {r.title}
                </p>
                <button
                  aria-label="Delete"
                  onClick={() => setDeleteTarget(r)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-danger hover:bg-danger-soft shrink-0"
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        title="Delete reminder?"
        description={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.title}". This can't be undone.`
            : ""
        }
        loading={deleting}
      />
    </div>
  );
}
