import Link from "next/link";
import { redirect } from "next/navigation";
import { Baby, Droplets, Moon, Pill } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Logo size="md" />
        <Link
          href="/login"
          className="text-sm font-medium text-ink-soft hover:text-ink px-2 py-1.5 rounded-lg"
        >
          Sign in
        </Link>
      </header>

      <section className="flex-1 flex items-center">
        <div className="max-w-5xl mx-auto w-full px-6 py-12 grid sm:grid-cols-2 gap-10 sm:gap-14 items-center">
          <div>
            <p className="text-sm font-medium text-rose-strong mb-3">
              A calmer way to track baby care
            </p>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.12] text-ink">
              Less to remember. More time with your baby.
            </h1>
            <p className="mt-5 text-ink-soft text-lg max-w-md">
              Keep feeds, diapers, sleep, pumping, medicines and little
              milestones in one simple place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-ink-faint max-w-sm">
              Your logs are personal records. This app does not provide
              medical advice.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FeatureTile icon={<Baby size={20} />} label="Feeding & sleep timers" />
            <FeatureTile icon={<Droplets size={20} />} label="Quick diaper logging" />
            <FeatureTile icon={<Moon size={20} />} label="Sleep tracking" />
            <FeatureTile icon={<Pill size={20} />} label="Medicine reminders" />
          </div>
        </div>
      </section>

      <footer className="px-6 py-6 text-center text-xs text-ink-faint">
        Made for the little moments that matter. ·{" "}
        <a
          href="https://justbabyluv.com/"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-ink-soft"
        >
          justbabyluv.com
        </a>
      </footer>
    </div>
  );
}

function FeatureTile({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-xl bg-rose-soft text-rose-strong flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm text-ink font-medium">{label}</p>
    </div>
  );
}
