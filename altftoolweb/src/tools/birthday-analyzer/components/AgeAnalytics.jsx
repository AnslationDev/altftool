import { Activity, Wind, Moon, Zap } from "lucide-react";

export default function AgeAnalytics({ lifeStats }) {
  if (!lifeStats) return null;

  const stats = [
    {
      label: "Heartbeats",
      value: lifeStats.heartbeats.toLocaleString(),
      description: "Estimated heartbeats since birth",
      icon: Activity,
      color: "text-red-500",
    },
    {
      label: "Breaths Taken",
      value: lifeStats.breaths.toLocaleString(),
      description: "Estimated breaths since birth",
      icon: Wind,
      color: "text-sky-500",
    },
    {
      label: "Sleep Time",
      value: `${lifeStats.sleepDays.toLocaleString()} days`,
      description: `~${lifeStats.sleepHours.toLocaleString()} hours of sleep`,
      icon: Moon,
      color: "text-indigo-500",
    },
    {
      label: "Life Energy",
      value: "Active",
      description: "Every moment counts",
      icon: Zap,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="bg-(--card) border border-(--border) rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-(--primary)" />
        <h3 className="text-lg font-semibold text-(--foreground)">Life Analytics</h3>
      </div>

      <div className="tool-card-grid">
        {stats.map(({ label, value, description, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-(--background) border border-(--border) rounded-xl p-4 text-center"
          >
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 rounded-lg bg-(--muted) flex items-center justify-center">
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
            <div className="text-lg font-bold text-(--foreground)">{value}</div>
            <div className="text-xs font-semibold text-(--primary) mt-1">{label}</div>
            <div className="text-xs text-(--muted-foreground) mt-0.5">{description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
