"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Field, Input, ErrorText } from "@/components/ui/primitives";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Account created, but sign-in failed. Please sign in.");
      router.push("/login");
      return;
    }
    toast.success("Account created!");
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <Field htmlFor="name">Your name</Field>
        <Input id="name" name="name" type="text" required autoComplete="name" />
      </div>
      <div>
        <Field htmlFor="email">Email</Field>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Field htmlFor="password">Password</Field>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="mt-1.5 text-xs text-ink-faint">At least 8 characters.</p>
      </div>
      <ErrorText>{error}</ErrorText>
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Creating account…" : "Get Started"}
      </Button>
    </form>
  );
}
