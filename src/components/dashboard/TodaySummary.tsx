import { Card } from "@/components/ui/primitives";

export function TodaySummary({
  feeds,
  diapers,
  sleepMs,
  pumps,
  medsCompleted,
  milestones,
}: {
  feeds: number;
  diapers: number;
  sleepMs: number;
  pumps: number;
  medsCompleted: number;
  milestones: number;
}) {
  const sleepHours = Math.floor(sleepMs / (1000 * 60 * 60));
  const sleepMins = Math.round((sleepMs % (1000 * 60 * 60)) / (1000 * 60));
  const sleepLabel =
    sleepHours > 0 ? `${sleepHours}h ${sleepMins}m` : `${sleepMins}m`;

  const stats = [
    { label: "Feeds", value: feeds },
    { label: "Diapers", value: diapers },
    { label: "Sleep", value: sleepMs > 0 ? sleepLabel : "0m" },
    { label: "Pumping", value: pumps },
    { label: "Meds done", value: medsCompleted },
    { label: "Baby Steps", value: milestones },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="p-4 text-center rounded-2xl">
          <p className="font-display text-xl text-ink">{s.value}</p>
          <p className="text-xs text-ink-soft mt-0.5">{s.label}</p>
        </Card>
      ))}
    </div>
  );
}
