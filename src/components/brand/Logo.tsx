import { cn } from "@/lib/utils";
import { LogoMark } from "./LogoMark";
import { Wordmark } from "./Wordmark";

const sizes = {
  sm: { mark: 22, text: "text-base" },
  md: { mark: 28, text: "text-lg" },
  lg: { mark: 36, text: "text-2xl" },
} as const;

export function Logo({
  size = "md",
  showWordmark = true,
  className,
}: {
  size?: keyof typeof sizes;
  showWordmark?: boolean;
  className?: string;
}) {
  const { mark, text } = sizes[size];
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={mark} />
      {showWordmark && <Wordmark className={text} />}
    </span>
  );
}
