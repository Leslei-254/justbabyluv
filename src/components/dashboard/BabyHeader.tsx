import { formatBabyAge } from "@/lib/utils";

export function BabyHeader({
  name,
  dob,
  photoUrl,
}: {
  name: string;
  dob: Date;
  photoUrl?: string | null;
}) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-teal-soft flex items-center justify-center overflow-hidden shrink-0">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-display text-2xl text-teal-strong">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-faint">{today}</p>
        <h1 className="font-display text-2xl text-ink truncate">{name}</h1>
        <p className="text-sm text-ink-soft">{formatBabyAge(dob)}</p>
      </div>
    </div>
  );
}
