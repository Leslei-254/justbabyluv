"use client";

import { useEffect } from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(JSON.stringify({
      severity: "error",
      event: "client.error_boundary",
      area: "global",
    }));
  }, []);

  return (
    <html lang="en">
      <body>
        <main className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-sm text-center">
            <h1 className="font-display text-xl">Something went wrong</h1>
            <p className="mt-2 text-sm">
              We couldn&apos;t load JustBaby Luv. Please try again.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-5 min-h-11 rounded-xl px-4 py-2 text-sm font-medium border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
