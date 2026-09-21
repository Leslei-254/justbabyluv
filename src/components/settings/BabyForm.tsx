"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea, ErrorText } from "@/components/ui/primitives";

type BabyFormValues = {
  id?: string;
  name: string;
  dob: string;
  photoUrl?: string | null;
  birthWeightValue?: number | null;
  birthWeightUnit?: "lb" | "kg" | null;
  notes?: string | null;
};

export function BabyForm({
  initial,
  redirectTo = "/dashboard",
  onSaved,
}: {
  initial?: BabyFormValues;
  redirectTo?: string;
  onSaved?: () => void;
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
      name: String(form.get("name") || ""),
      dob: String(form.get("dob") || ""),
      photoUrl: String(form.get("photoUrl") || ""),
      birthWeightValue: form.get("birthWeightValue")
        ? Number(form.get("birthWeightValue"))
        : null,
      birthWeightUnit: form.get("birthWeightUnit") || null,
      notes: String(form.get("notes") || ""),
    };

    const url = initial?.id ? `/api/babies/${initial.id}` : "/api/babies";
    const method = initial?.id ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      toast.success(initial?.id ? "Baby profile updated" : "Baby profile created");
      if (onSaved) {
        onSaved();
      } else {
        router.push(redirectTo);
      }
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <Field htmlFor="name">Baby&apos;s name</Field>
        <Input id="name" name="name" required defaultValue={initial?.name} />
      </div>
      <div>
        <Field htmlFor="dob">Date of birth</Field>
        <Input
          id="dob"
          name="dob"
          type="date"
          required
          max={new Date().toISOString().slice(0, 10)}
          defaultValue={initial?.dob}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Field htmlFor="birthWeightValue">Birth weight (optional)</Field>
          <Input
            id="birthWeightValue"
            name="birthWeightValue"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial?.birthWeightValue ?? ""}
          />
        </div>
        <div>
          <Field htmlFor="birthWeightUnit">Unit</Field>
          <Select
            id="birthWeightUnit"
            name="birthWeightUnit"
            defaultValue={initial?.birthWeightUnit ?? "lb"}
          >
            <option value="lb">lb</option>
            <option value="kg">kg</option>
          </Select>
        </div>
      </div>
      <div>
        <Field htmlFor="photoUrl">Photo URL (optional)</Field>
        <Input
          id="photoUrl"
          name="photoUrl"
          type="url"
          placeholder="https://…"
          defaultValue={initial?.photoUrl ?? ""}
        />
      </div>
      <div>
        <Field htmlFor="notes">Notes (optional)</Field>
        <Textarea id="notes" name="notes" rows={3} defaultValue={initial?.notes ?? ""} />
      </div>
      <ErrorText>{error}</ErrorText>
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Saving…" : initial?.id ? "Save changes" : "Create profile"}
      </Button>
    </form>
  );
}
