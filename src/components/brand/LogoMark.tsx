import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="JustBaby Luv"
    >
      <rect width="64" height="64" rx="18" className="fill-rose" />
      <path
        d="M32 46c-1 0-1.9-.35-2.7-1C22.9 39.7 17 34.2 17 27.4 17 21.9 21 18 25.8 18c2.6 0 5 1.2 6.2 3.2C33.2 19.2 35.6 18 38.2 18 43 18 47 21.9 47 27.4c0 6.8-5.9 12.3-12.3 17.6-.8.65-1.7 1-2.7 1Z"
        fill="white"
      />
    </svg>
  );
}
