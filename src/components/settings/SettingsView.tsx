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
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [profileName, setProfileName] = useState(user.name);

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

  async function deleteAccount() {
    if (deleteConfirmation !== "DELETE") return;

    setDeletingAccount(true);

    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "We couldn't delete your account.");
        setDeletingAccount(false);
        return;
      }

      await signOut({ callbackUrl: "/login" });
    } catch {
      setDeletingAccount(false);
      toast.error("We couldn't delete your account. Please try again.");
    }
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
            <Field htmlFor="timezone">Timezone</Field>
            <Select
              id="timezone"
              defaultValue={user.timezone}
              disabled={savingPrefs}
              onChange={(e) => updatePref("timezone", e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="Africa/Nairobi">Africa/Nairobi — East Africa Time (Nairobi)</option>
              <option value="Africa/Lagos">Africa/Lagos — West Africa Time (Lagos)</option>
              <option value="Africa/Johannesburg">Africa/Johannesburg — South Africa Time (Johannesburg)</option>
              <option value="Europe/London">Europe/London — UK Time (London)</option>
              <option value="Europe/Berlin">Europe/Berlin — Central European Time (Berlin)</option>
              <option value="America/New_York">America/New_York — Eastern Time (New York)</option>
              <option value="America/Chicago">America/Chicago — Central Time (Chicago)</option>
              <option value="America/Denver">America/Denver — Mountain Time (Denver)</option>
              <option value="America/Los_Angeles">America/Los_Angeles — Pacific Time (Los Angeles)</option>
              <option value="Asia/Dubai">Asia/Dubai — Gulf Time (Dubai)</option>
              <option value="Asia/Kolkata">Asia/Kolkata — India Time (Kolkata)</option>
              <option value="Asia/Singapore">Asia/Singapore — Singapore Time</option>
              <option value="Asia/Tokyo">Asia/Tokyo — Japan Time (Tokyo)</option>
              <option value="Australia/Sydney">Australia/Sydney — Australian Eastern Time (Sydney)</option>
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
        <Field htmlFor="account-name">Name</Field>
        <input
          id="account-name"
          value={profileName}
          disabled={savingPrefs}
          onChange={(e) => setProfileName(e.target.value)}
          onBlur={() => {
            const value = profileName.trim();
            if (value && value !== user.name) updatePref("name", value);
          }}
          className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          autoComplete="name"
        />
        <p className="mt-3 text-sm text-ink-faint mb-4">{user.email}</p>
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

      <Card>
        <h2 className="font-display text-lg text-ink mb-2">Privacy</h2>
        <p className="text-sm text-ink-soft">
          JustBaby Luv stores your account details and baby-care records so you can
          use the app and receive optional reminders. Baby-care activity is not used
          for advertising, and your records are not intentionally exposed to other users.
        </p>
        <button
          type="button"
          className="mt-3 min-h-11 text-sm font-medium text-ink underline underline-offset-4"
          aria-expanded={privacyOpen}
          onClick={() => setPrivacyOpen((open) => !open)}
        >
          {privacyOpen ? "Hide privacy details" : "View privacy details"}
        </button>
        {privacyOpen && (
          <div className="mt-3 rounded-xl border border-border bg-surface-soft p-4 text-sm text-ink-soft space-y-2">
            <p>
              We collect only the information needed to provide your account,
              baby profile, activity tracking, reminders and related app features.
            </p>
            <p>
              Optional email reminders use your account email address for delivery.
              Delivery records are removed when you delete your account.
            </p>
            <p>
              Demo data belongs only to the baby profile in your account and can be
              cleared from this page.
            </p>
            <p>
              You can permanently delete your account and its baby-care records below.
            </p>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-lg text-ink mb-1">Delete account</h2>
        <p className="text-sm text-ink-soft">
          Permanently delete your account, baby profile, activities, milestones,
          reminders and email delivery records. This cannot be undone.
        </p>

        <div className="mt-4 rounded-xl border border-border p-4 space-y-3">
          <label htmlFor="delete-account-confirmation" className="block text-sm font-medium text-ink">
            Type <span className="font-mono">DELETE</span> to confirm
          </label>
          <input
            id="delete-account-confirmation"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            disabled={deletingAccount}
            autoComplete="off"
            spellCheck={false}
            className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-describedby="delete-account-warning"
          />
          <p id="delete-account-warning" className="text-xs text-ink-faint">
            This permanently removes your account and personal baby-care records.
          </p>
          <Button
            variant="danger"
            onClick={deleteAccount}
            disabled={deletingAccount || deleteConfirmation !== "DELETE"}
          >
            {deletingAccount ? "Deleting account…" : "Delete my account"}
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
