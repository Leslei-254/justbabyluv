import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignupForm } from "@/components/auth/SignupForm";
import { Logo } from "@/components/brand/Logo";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex">
          <Logo size="md" />
        </Link>
        <h1 className="font-display text-2xl text-ink mt-8 mb-1">Create your account</h1>
        <p className="text-sm text-ink-soft mb-6">
          A calm place to keep track of the little things.
        </p>
        <SignupForm />
        <p className="text-sm text-ink-soft mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-rose-strong font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
