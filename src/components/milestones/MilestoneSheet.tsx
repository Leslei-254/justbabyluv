"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea, ErrorText } from "@/components/ui/primitives";

const presets = [
  "First smile",
  "First laugh",
  "First bath",
  "First tummy time",
  "First roll",
  "First tooth",
  "First word",
  "Custom milestone",
];

export function MilestoneSheet({
  open,
  onClose,
  babyId,
}: {
  open: boolean;
  onClose: () => void;
  babyId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState(presets[0]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const title =
      preset === "Custom milestone"
        ? String(form.get("customTitle") || "").trim()
        : preset;

    if (!title) {
      setLoading(false);
      setError("Give this milestone a title.");
      return;
    }

    const payload = {
      babyId,
      title,
      date: new Date(String(form.get("date") || new Date().toISOString())).toISOString(),
      note: String(form.get("note") || "") || null,
      photoUrl: String(form.get("photoUrl") || "") || null,
    };

    try {
      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Couldn't save that. Please try again.");
        return;
      }

      toast.success("Baby Step saved");
      onClose();
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add a Baby Step">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <Field htmlFor="preset">Milestone</Field>
          <Select
            id="preset"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
          >
            {presets.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
        {preset === "Custom milestone" && (
          <div>
            <Field htmlFor="customTitle">Title</Field>
            <Input id="customTitle" name="customTitle" required maxLength={150} />
          </div>
        )}
        <div>
          <Field htmlFor="date">Date</Field>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
        <div>
          <Field htmlFor="photoUrl">Photo URL (optional)</Field>
          <Input id="photoUrl" name="photoUrl" type="url" placeholder="https://…" />
        </div>
        <div>
          <Field htmlFor="note">Note (optional)</Field>
          <Textarea id="note" name="note" rows={2} />
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? "Saving…" : "Save"}
        </Button>
      </form>
    </Sheet>
  );
}
