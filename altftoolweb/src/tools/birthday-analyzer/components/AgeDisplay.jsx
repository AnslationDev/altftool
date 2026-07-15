import { Clock, Calendar, Timer, Hash } from "lucide-react";

export default function AgeDisplay({ age, totalTime }) {
  const cards = [
    { label: "Years", value: age.years, icon: Calendar },
    { label: "Months", value: age.months, icon: Clock },
    { label: "Weeks", value: totalTime.totalWeeks, icon: Timer },
    { label: "Days", value: totalTime.totalDays, icon: Hash },
  ];

  return (
    <div className="tool-card-grid">
      {cards.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="bg-(--card) border border-(--border) rounded-xl p-5 text-center shadow-[var(--anslation-ds-shadow-sm)] hover:shadow-md transition"
        >
          <div className="flex items-center justify-center mb-2">
            <div className="w-10 h-10 rounded-lg bg-(--muted) flex items-center justify-center">
              <Icon className="h-5 w-5 text-(--primary)" />
            </div>
          </div>
          <div className="text-2xl font-bold text-(--foreground)">{value.toLocaleString()}</div>
          <div className="text-sm text-(--muted-foreground) mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
