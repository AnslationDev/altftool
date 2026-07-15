import { Clock, Timer, CalendarClock, Hourglass } from "lucide-react";

export default function TimeLived({ totalTime }) {
  const stats = [
    { label: "Hours", value: totalTime.totalHours, icon: Clock },
    { label: "Minutes", value: totalTime.totalMinutes, icon: Timer },
    { label: "Seconds", value: totalTime.totalSeconds, icon: Hourglass },
    { label: "Months", value: totalTime.totalMonths, icon: CalendarClock },
  ];

  return (
    <div className="bg-(--card) border border-(--border) rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <h3 className="text-lg font-semibold text-(--foreground) mb-4">Total Time Lived</h3>
      <div className="tool-compact-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-3 bg-(--background) rounded-lg border border-(--border)"
          >
            <div className="w-9 h-9 rounded-lg bg-(--muted) flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-(--primary)" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-(--foreground) truncate">
                {value.toLocaleString()}
              </div>
              <div className="text-xs text-(--muted-foreground)">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
