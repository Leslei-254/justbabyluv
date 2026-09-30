"use client";

import { useEffect } from "react";
import { RouteError } from "@/components/errors/RouteError";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(JSON.stringify({
      severity: "error",
      event: "client.error_boundary",
      area: "settings",
      ...(error.digest ? { digest: error.digest } : {}),
    }));
  }, [error.digest]);

  return <RouteError error={error} reset={reset} area="settings" />;
}
