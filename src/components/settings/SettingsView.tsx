"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Card, Field, Select } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { BabyForm } from "./BabyForm";
import type { babies, users } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type User = InferSelectModel<typeof users>;
type Baby = InferSelectModel<typeof babies>;

export function SettingsView({ user, baby }: { user: User; baby: Baby }) {
  const router = useRouter();
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function updatePref(key: string, value: string | boolean) {
    setSavingPrefs(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    setSavingPrefs(false);
    if (!res.ok) {
      toast.error("Couldn't save that preference.");
      return;
    }
    if (key === "theme") {
      const root = document.documentElement;
      if (value === "system") {
        root.removeAttribute("data-theme");
        localStorage.removeItem("jbl-theme");
      } else {
        root.setAttribute("data-theme", String(value));
        localStorage.setItem("jbl-theme", String(value));
      }
    }
    toast.success("Saved");
    router.refresh();
  }

  async function resetDemoData() {
    if (!confirm("Replace current activity data with fresh demo data?")) return;
    setResetting(true);
    const res = await fetch("/api/demo-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ babyId: baby.id }),
    });
    setResetting(false);
    if (!res.ok) {
      toast.error("Couldn't reset demo data.");
      return;
    }
    toast.success("Demo data reset");
    router.refresh();
  }

  async function clearAllData() {
    if (!confirm("Delete all activities, milestones and reminders? This cannot be undone.")) return;
    setResetting(true);
    const res = await fetch("/api/demo-data", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ babyId: baby.id }),
    });
    setResetting(false);
    if (!res.ok) {
      toast.error("Couldn't clear data.");
      return;
    }
    toast.success("All activity data cleared");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 sm:pt-8 pb-4 space-y-5">
      <h1 className="font-display text-2xl text-ink">Settings</h1>

      <Card>
        <h2 className="font-display text-lg text-ink mb-3">Baby profile</h2>
        <BabyForm
          initial={{
            id: baby.id,
            name: baby.name,
            dob: baby.dob.toISOString().slice(0, 10),
            photoUrl: baby.photoUrl,
            birthWeightValue: baby.birthWeightValue,
            birthWeightUnit: baby.birthWeightUnit,
            notes: baby.notes,
          }}
          onSaved={() => router.refresh()}
        />
      </Card>

      <Card>
        <h2 className="font-display text-lg text-ink mb-3">Preferences</h2>
        <div className="space-y-4">
          <div>
            <Field htmlFor="unitPreference">Units</Field>
            <Select
              id="unitPreference"
              defaultValue={user.unitPreference}
              disabled={savingPrefs}
              onChange={(e) => updatePref("unitPreference", e.target.value)}
            >
              <option value="oz">Ounces (oz)</option>
              <option value="ml">Milliliters (ml)</option>
            </Select>
          </div>
          <div>
            <Field htmlFor="theme">Theme</Field>
            <Select
              id="theme"
              defaultValue={user.theme}
              disabled={savingPrefs}
              onChange={(e) => updatePref("theme", e.target.value)}
            >
              <option value="system">Match system</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              defaultChecked={user.emailRemindersEnabled}
              disabled={savingPrefs}
              onChange={(e) => updatePref("emailRemindersEnabled", e.target.checked)}
              className="rounded border-border"
            />
            Email reminder notifications
          </label>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg text-ink mb-3">Account</h2>
        <p className="text-sm text-ink-soft mb-1">{user.name}</p>
        <p className="text-sm text-ink-faint mb-4">{user.email}</p>
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          Log out
        </Button>
      </Card>

      <Card>
        <h2 className="font-display text-lg text-ink mb-1">Demo data</h2>
        <p className="text-sm text-ink-soft mb-3">
          Reset to a fresh set of example activities, or clear everything.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={resetDemoData} disabled={resetting}>
            Reset demo data
          </Button>
          <Button variant="danger" onClick={clearAllData} disabled={resetting}>
            Clear all data
          </Button>
        </div>
      </Card>

      <p className="text-xs text-ink-faint text-center px-4">
        Your logs are personal records. This app does not provide medical advice.
        <br />
        Made for the little moments that matter. ·{" "}
        <a
          href="https://justbabyluv.com/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          justbabyluv.com
        </a>
      </p>
    </div>
  );
}
