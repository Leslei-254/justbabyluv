import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "rose" | "white";
}) {
  const toneClass =
    tone === "rose" ? "text-rose" : tone === "white" ? "text-white" : "text-ink";

  return (
    <span className={cn("font-display leading-none", toneClass, className)}>
      JustBaby <span className="italic">Luv</span>
    </span>
  );
}
