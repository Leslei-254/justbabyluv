import { Skeleton } from "@/components/ui/primitives";

export default function AppLoading() {
  return (
    <div
      className="max-w-2xl mx-auto px-4 pt-6 sm:pt-8 space-y-5"
      role="status"
      aria-label="Loading JustBaby Luv"
    >
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="min-h-[92px] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-28 rounded-3xl" />
      <Skeleton className="h-40 rounded-3xl" />
    </div>
  );
}
