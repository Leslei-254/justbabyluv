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
      <div className="w-16 h-16 rounded-2xl bg-rose-soft flex items-center justify-center overflow-hidden shrink-0">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-display text-2xl text-rose-strong">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-faint">{today}</p>
        <h1 className="font-display text-2xl text-ink truncate mt-0.5">{name}</h1>
        <span className="inline-flex items-center mt-1.5 text-xs font-medium text-rose-strong bg-rose-soft px-2.5 py-1 rounded-full">
          {formatBabyAge(dob)}
        </span>
      </div>
    </div>
  );
}
