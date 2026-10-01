"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ErrorText, Field, Input, Select } from "@/components/ui/primitives";
import { LogoMark } from "@/components/brand/LogoMark";

type Step = "welcome" | "baby" | "preferences" | "reminder";

const steps: Step[] = ["welcome", "baby", "preferences", "reminder"];

function formatStep(step: Step) {
  if (step === "welcome") return "Welcome";
  if (step === "baby") return "Baby profile";
  if (step === "preferences") return "Preferences";
  return "Optional reminder";
}

export function OnboardingFlow({ firstName }: { firstName?: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [babyId, setBabyId] = useState<string | null>(null);
  const [unit, setUnit] = useState<"oz" | "ml">("oz");
  const [emailReminders, setEmailReminders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = steps.indexOf(step);
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  const [defaultReminderDate] = useState(() => {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    date.setSeconds(0, 0);

    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60 * 1000);

    return local.toISOString().slice(0, 16);
  });

  async function saveBaby(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/babies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("babyName") || ""),
          dob: String(form.get("dob") || ""),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Couldn't save the baby profile.");
        return;
      }

      setBabyId(data.baby.id);
      setStep("preferences");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function savePreferences() {
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitPreference: unit,
          emailRemindersEnabled: emailReminders,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Couldn't save your preferences.");
        return;
      }

      setStep("reminder");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function createReminder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!babyId) {
      router.push("/dashboard");
      return;
    }

    setError(null);
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const localDateTime = String(form.get("datetime") || "");

    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          babyId,
          title: String(form.get("title") || ""),
          type: "CUSTOM",
          datetime: new Date(localDateTime).toISOString(),
          repeat: String(form.get("repeat") || "none"),
          emailEnabled: emailReminders,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Couldn't create that reminder.");
        return;
      }

      toast.success("You're all set");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  function skipToDashboard() {
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-4">
          <LogoMark size={32} />
          {step !== "welcome" && (
            <span className="text-xs text-ink-faint">
              {stepIndex} of {steps.length - 1}
            </span>
          )}
        </div>

        <div
          className="h-1.5 rounded-full bg-rose-soft overflow-hidden mb-8"
          aria-label={`Onboarding progress: ${progress}%`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-rose transition-[width] motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-rose-strong">
          {formatStep(step)}
        </p>

        {step === "welcome" && (
          <section className="mt-2" aria-labelledby="welcome-title">
            <h1 id="welcome-title" className="font-display text-3xl text-ink">
              Welcome{firstName ? `, ${firstName}` : ""}.
            </h1>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              Let&apos;s set up the basics so JustBaby Luv feels ready for you. It only takes a minute, and you can skip anything that isn&apos;t essential.
            </p>

            <div className="mt-6 space-y-3 text-sm text-ink-soft">
              <div className="rounded-2xl border border-border bg-surface p-4">
                <strong className="text-ink">1. Baby profile</strong>
                <p className="mt-1">Just the name and date of birth needed for your dashboard.</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <strong className="text-ink">2. Preferences</strong>
                <p className="mt-1">Choose how you want feeding amounts displayed.</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <strong className="text-ink">3. Optional reminder</strong>
                <p className="mt-1">Add one now or go straight to your dashboard.</p>
              </div>
            </div>

            <Button className="w-full mt-7" size="lg" onClick={() => setStep("baby")}>
              Let&apos;s get started
            </Button>
          </section>
        )}

        {step === "baby" && (
          <section className="mt-2" aria-labelledby="baby-title">
            <h1 id="baby-title" className="font-display text-2xl text-ink">
              Tell us about your baby
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              Only two details are needed to get your dashboard ready.
            </p>

            <form onSubmit={saveBaby} className="mt-6 space-y-4" noValidate>
              <div>
                <Field htmlFor="babyName">Baby&apos;s name</Field>
                <Input id="babyName" name="babyName" required autoComplete="off" autoFocus />
              </div>
              <div>
                <Field htmlFor="dob">Date of birth</Field>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  required
                  max={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <p className="text-xs text-ink-faint">
                You can add a photo, birth weight, and notes later in Settings.
              </p>
              <ErrorText>{error}</ErrorText>
              <Button type="submit" disabled={saving} className="w-full" size="lg">
                {saving ? "Saving…" : "Continue"}
              </Button>
            </form>
          </section>
        )}

        {step === "preferences" && (
          <section className="mt-2" aria-labelledby="preferences-title">
            <h1 id="preferences-title" className="font-display text-2xl text-ink">
              Choose your preferences
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              These settings can be changed any time.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <Field htmlFor="unitPreference">Feeding units</Field>
                <Select
                  id="unitPreference"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as "oz" | "ml")}
                  disabled={saving}
                >
                  <option value="oz">Ounces (oz)</option>
                  <option value="ml">Milliliters (ml)</option>
                </Select>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
                <input
                  type="checkbox"
                  checked={emailReminders}
                  onChange={(e) => setEmailReminders(e.target.checked)}
                  disabled={saving}
                  className="mt-0.5 h-5 w-5 rounded border-border"
                />
                <span>
                  <span className="block text-sm font-medium text-ink">Email reminder notifications</span>
                  <span className="block mt-1 text-xs leading-5 text-ink-soft">
                    You can turn these off later in Settings.
                  </span>
                </span>
              </label>

              <ErrorText>{error}</ErrorText>
              <Button className="w-full" size="lg" onClick={savePreferences} disabled={saving}>
                {saving ? "Saving…" : "Continue"}
              </Button>
            </div>
          </section>
        )}

        {step === "reminder" && (
          <section className="mt-2" aria-labelledby="reminder-title">
            <h1 id="reminder-title" className="font-display text-2xl text-ink">
              Add a reminder?
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              This is optional. You can add and manage reminders any time.
            </p>

            <form onSubmit={createReminder} className="mt-6 space-y-4" noValidate>
              <div>
                <Field htmlFor="title">Reminder</Field>
                <Input id="title" name="title" placeholder="e.g. Next feed" required autoFocus />
              </div>
              <div>
                <Field htmlFor="datetime">When</Field>
                <Input id="datetime" name="datetime" type="datetime-local" required defaultValue={defaultReminderDate} />
              </div>
              <div>
                <Field htmlFor="repeat">Repeat</Field>
                <Select id="repeat" name="repeat" defaultValue="none">
                  <option value="none">Doesn&apos;t repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </Select>
              </div>
              {emailReminders && (
                <p className="text-xs text-ink-faint">
                  Email notification is enabled for this reminder. Automatic scheduled delivery is not included unless a scheduler is configured.
                </p>
              )}
              <ErrorText>{error}</ErrorText>
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button type="button" variant="secondary" className="w-full" onClick={skipToDashboard}>
                  Skip for now
                </Button>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Saving…" : "Add reminder"}
                </Button>
              </div>
            </form>
          </section>
        )}

        {step !== "welcome" && step !== "baby" && (
          <p className="mt-6 text-center text-xs text-ink-faint">
            Step {stepIndex} of {steps.length - 1}
          </p>
        )}
      </div>
    </main>
  );
}
