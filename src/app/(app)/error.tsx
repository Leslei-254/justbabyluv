"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard area error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm text-center flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-danger-soft text-danger flex items-center justify-center">
          <AlertTriangle size={22} />
        </div>
        <h1 className="font-display text-xl text-ink">Something went wrong</h1>
        <p className="text-sm text-ink-soft">
          We couldn&apos;t load this page. Your data is safe — check your
          connection and try again.
        </p>
        <Button onClick={reset} className="mt-2">
          Try again
        </Button>
      </div>
    </div>
  );
}
