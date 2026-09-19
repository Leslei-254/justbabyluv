import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignupForm } from "@/components/auth/SignupForm";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg text-ink">
          JustBaby Luv
        </Link>
        <h1 className="font-display text-2xl text-ink mt-6 mb-1">Create your account</h1>
        <p className="text-sm text-ink-soft mb-6">
          Set up your account to start tracking.
        </p>
        <SignupForm />
        <p className="text-sm text-ink-soft mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-strong font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
