import { Timer, CalendarDays } from "lucide-react";
import { formatDate } from "../utils/birthdayUtils";

export default function CountdownTimer({ nextBirthday, previousBirthday, weekday }) {
  if (!nextBirthday) return null;

  const units = [
    { label: "Days", value: nextBirthday.days },
    { label: "Hours", value: nextBirthday.hours },
    { label: "Minutes", value: nextBirthday.minutes },
    { label: "Seconds", value: nextBirthday.seconds },
  ];

  return (
    <div className="bg-(--card) border border-(--border) rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="h-5 w-5 text-(--primary)" />
        <h3 className="text-lg font-semibold text-(--foreground)">Next Birthday Countdown</h3>
      </div>

      <div className="text-center mb-4">
        <div className="text-sm text-(--muted-foreground)">
          Your next birthday is on <span className="font-semibold text-(--foreground)">{formatDate(nextBirthday.date)}</span>
        </div>
      </div>

      <div className="tool-compact-grid mb-4">
        {units.map(({ label, value }) => (
          <div
            key={label}
            className="bg-(--background) border border-(--border) rounded-xl p-4 text-center"
          >
            <div className="text-2xl font-bold text-(--primary)">{value}</div>
            <div className="text-xs text-(--muted-foreground) mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {previousBirthday && (
          <div className="bg-(--background) border border-(--border) rounded-lg p-3">
            <div className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide mb-1">
              Previous Birthday
            </div>
            <div className="text-sm text-(--foreground)">
              {formatDate(previousBirthday.date)} ({previousBirthday.days} days ago)
            </div>
          </div>
        )}
        {weekday && (
          <div className="bg-(--background) border border-(--border) rounded-lg p-3">
            <div className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide mb-1 flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              Birthday Weekday
            </div>
            <div className="text-sm text-(--foreground)">
              You were born on a <span className="font-semibold">{weekday}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
