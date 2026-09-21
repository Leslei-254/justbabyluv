"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea, ErrorText } from "@/components/ui/primitives";
import type { ActivityType } from "@/db/schema";

function toLocalInputValue(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export function LogActivitySheet({
  open,
  onClose,
  babyId,
  type,
}: {
  open: boolean;
  onClose: () => void;
  babyId: string;
  type: Exclude<ActivityType, "SLEEP">;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const now = new Date();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const startTime = String(form.get("startTime") || "");
    const endTimeRaw = String(form.get("endTime") || "");

    const payload: Record<string, unknown> = {
      babyId,
      type,
      startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
      endTime: endTimeRaw ? new Date(endTimeRaw).toISOString() : null,
      notes: String(form.get("notes") || "") || null,
    };

    if (type === "FEED") {
      payload.subtype = String(form.get("subtype") || "bottle");
      payload.side = form.get("side") || null;
      const amount = form.get("amount");
      payload.amount = amount ? Number(amount) : null;
      payload.unit = form.get("unit") || "oz";
    } else if (type === "DIAPER") {
      payload.subtype = String(form.get("subtype") || "wet");
    } else if (type === "PUMP") {
      payload.side = form.get("side") || null;
      const amount = form.get("amount");
      payload.amount = amount ? Number(amount) : null;
      payload.unit = form.get("unit") || "oz";
    } else if (type === "MEDICATION") {
      payload.medicationName = String(form.get("medicationName") || "");
      payload.dose = String(form.get("dose") || "") || null;
    }

    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Couldn't save that. Please try again.");
      return;
    }

    toast.success("Logged");
    onClose();
    router.refresh();
  }

  const titles: Record<string, string> = {
    FEED: "Log a feed",
    DIAPER: "Log a diaper",
    PUMP: "Log pumping",
    MEDICATION: "Log medicine",
  };

  return (
    <Sheet open={open} onClose={onClose} title={titles[type]}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {type === "DIAPER" && (
          <div>
            <Field>Type</Field>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "wet", label: "Wet" },
                { value: "dirty", label: "Dirty" },
                { value: "both", label: "Both" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center justify-center rounded-xl border border-border bg-cream py-3 text-sm font-medium cursor-pointer has-[:checked]:bg-rose-soft has-[:checked]:border-rose"
                >
                  <input
                    type="radio"
                    name="subtype"
                    value={opt.value}
                    defaultChecked={opt.value === "wet"}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {type === "FEED" && (
          <>
            <div>
              <Field htmlFor="subtype">Feed type</Field>
              <Select id="subtype" name="subtype" defaultValue="bottle">
                <option value="breast">Breastfeeding</option>
                <option value="bottle">Bottle</option>
                <option value="formula">Formula</option>
                <option value="expressed">Expressed breast milk</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Field htmlFor="amount">Amount</Field>
                <Input id="amount" name="amount" type="number" step="0.1" min="0" />
              </div>
              <div>
                <Field htmlFor="unit">Unit</Field>
                <Select id="unit" name="unit" defaultValue="oz">
                  <option value="oz">oz</option>
                  <option value="ml">ml</option>
                </Select>
              </div>
            </div>
            <div>
              <Field htmlFor="side">Breast side (if applicable)</Field>
              <Select id="side" name="side" defaultValue="">
                <option value="">N/A</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="both">Both</option>
              </Select>
            </div>
          </>
        )}

        {type === "PUMP" && (
          <>
            <div>
              <Field htmlFor="side">Side</Field>
              <Select id="side" name="side" defaultValue="both">
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="both">Both</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Field htmlFor="amount">Amount</Field>
                <Input id="amount" name="amount" type="number" step="0.1" min="0" />
              </div>
              <div>
                <Field htmlFor="unit">Unit</Field>
                <Select id="unit" name="unit" defaultValue="oz">
                  <option value="oz">oz</option>
                  <option value="ml">ml</option>
                </Select>
              </div>
            </div>
          </>
        )}

        {type === "MEDICATION" && (
          <>
            <div>
              <Field htmlFor="medicationName">Medication name</Field>
              <Input id="medicationName" name="medicationName" required />
            </div>
            <div>
              <Field htmlFor="dose">Dose</Field>
              <Input id="dose" name="dose" placeholder="e.g. 2.5 mL" />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Field htmlFor="startTime">Start time</Field>
            <Input
              id="startTime"
              name="startTime"
              type="datetime-local"
              defaultValue={toLocalInputValue(now)}
              required
            />
          </div>
          <div>
            <Field htmlFor="endTime">End time (optional)</Field>
            <Input id="endTime" name="endTime" type="datetime-local" />
          </div>
        </div>

        <div>
          <Field htmlFor="notes">Notes (optional)</Field>
          <Textarea id="notes" name="notes" rows={2} />
        </div>

        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? "Saving…" : "Save"}
        </Button>
      </form>
    </Sheet>
  );
}
