import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getUserBabies } from "@/lib/data";
import { BabyForm } from "@/components/settings/BabyForm";

export default async function OnboardingPage() {
  const user = await requireUser();
  const babies = await getUserBabies(user.id);
  if (babies.length > 0) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <p className="text-sm font-medium text-teal-strong">Almost there</p>
        <h1 className="font-display text-2xl text-ink mt-1 mb-1">
          Tell us about your baby
        </h1>
        <p className="text-sm text-ink-soft mb-6">
          This sets up your dashboard and baby age display.
        </p>
        <BabyForm redirectTo="/dashboard" />
      </div>
    </div>
  );
}
