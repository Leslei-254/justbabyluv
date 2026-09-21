import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/brand/Logo";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex">
          <Logo size="md" />
        </Link>
        <h1 className="font-display text-2xl text-ink mt-8 mb-1">Welcome back</h1>
        <p className="text-sm text-ink-soft mb-6">Sign in to your account.</p>
        <LoginForm />
        <p className="text-sm text-ink-soft mt-6 text-center">
          New here?{" "}
          <Link href="/signup" className="text-rose-strong font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
