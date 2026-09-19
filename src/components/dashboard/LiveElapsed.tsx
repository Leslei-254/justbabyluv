"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/utils";

export function LiveElapsed({ since }: { since: Date }) {
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  useEffect(() => {
    function update() {
      setElapsedMs(Date.now() - since.getTime());
    }
    update();
    const id = setInterval(update, 1000 * 15);
    return () => clearInterval(id);
  }, [since]);

  // Avoid a server/client mismatch: render nothing until the first client tick.
  if (elapsedMs === null) return null;

  return <>{formatDuration(elapsedMs)}</>;
}
