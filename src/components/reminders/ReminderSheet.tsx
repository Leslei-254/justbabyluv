"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea, ErrorText } from "@/components/ui/primitives";
import type { reminders } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Reminder = InferSelectModel<typeof reminders>;

function toLocalInputValue(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export function ReminderSheet({
  open,
  onClose,
  babyId,
  reminder,
}: {
  open: boolean;
  onClose: () => void;
  babyId: string;
  reminder?: Reminder | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const payload = {
      babyId,
      title: String(form.get("title") || ""),
      type: String(form.get("type") || "CUSTOM"),
      datetime: new Date(String(form.get("datetime") || "")).toISOString(),
      repeat: String(form.get("repeat") || "none"),
      emailEnabled: form.get("emailEnabled") === "on",
      notes: String(form.get("notes") || "") || null,
    };

    const url = reminder ? `/api/reminders/${reminder.id}` : "/api/reminders";
    const method = reminder ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Couldn't save that. Please try again.");
      return;
    }

    toast.success(reminder ? "Reminder updated" : "Reminder created");
    onClose();
    router.refresh();
  }

  return (
    <Sheet open={open} onClose={onClose} title={reminder ? "Edit reminder" : "New reminder"}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <Field htmlFor="title">Title</Field>
          <Input id="title" name="title" required defaultValue={reminder?.title} />
        </div>
        <div>
          <Field htmlFor="type">Category</Field>
          <Select id="type" name="type" defaultValue={reminder?.type ?? "CUSTOM"}>
            <option value="FEED">Feeding</option>
            <option value="DIAPER">Diaper</option>
            <option value="PUMP">Pumping</option>
            <option value="MEDICATION">Medicine</option>
            <option value="CUSTOM">Custom</option>
          </Select>
        </div>
        <div>
          <Field htmlFor="datetime">Date & time</Field>
          <Input
            id="datetime"
            name="datetime"
            type="datetime-local"
            required
            defaultValue={
              reminder ? toLocalInputValue(reminder.datetime) : toLocalInputValue(new Date())
            }
          />
        </div>
        <div>
          <Field htmlFor="repeat">Repeat</Field>
          <Select id="repeat" name="repeat" defaultValue={reminder?.repeat ?? "none"}>
            <option value="none">Doesn&apos;t repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="emailEnabled"
            defaultChecked={reminder?.emailEnabled}
            className="rounded border-border"
          />
          Send an email notification
        </label>
        <div>
          <Field htmlFor="notes">Notes (optional)</Field>
          <Textarea id="notes" name="notes" rows={2} defaultValue={reminder?.notes ?? ""} />
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? "Saving…" : reminder ? "Save changes" : "Create reminder"}
        </Button>
      </form>
    </Sheet>
  );
}
