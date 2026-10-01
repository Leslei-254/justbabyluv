import { requireUser } from "@/lib/session";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default async function OnboardingPage() {
  const user = await requireUser();

  return <OnboardingFlow firstName={user.name?.split(" ")[0] ?? null} />;
}
