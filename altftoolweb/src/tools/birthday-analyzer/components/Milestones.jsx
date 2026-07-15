import { CheckCircle2, Circle, PartyPopper } from "lucide-react";
import { milestones } from "../constants/data";

export default function Milestones({ currentAge }) {
  if (currentAge === null || currentAge === undefined) return null;

  const achieved = milestones.filter((m) => currentAge >= m.age);
  const upcoming = milestones.filter((m) => currentAge < m.age);

  return (
    <div className="bg-(--card) border border-(--border) rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center gap-2 mb-4">
        <PartyPopper className="h-5 w-5 text-(--primary)" />
        <h3 className="text-lg font-semibold text-(--foreground)">Milestones</h3>
      </div>

      {achieved.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-(--muted-foreground) uppercase tracking-wide mb-3">
            Achieved ({achieved.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {achieved.map((m) => (
              <div
                key={m.age}
                className="flex items-center gap-3 p-3 bg-(--background) border border-(--border) rounded-lg"
              >
                <CheckCircle2 className="h-4 w-4 text-(--primary) shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-(--foreground)">{m.label}</div>
                  <div className="text-xs text-(--muted-foreground) truncate">{m.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-(--muted-foreground) uppercase tracking-wide mb-3">
            Upcoming
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {upcoming.slice(0, 3).map((m) => (
              <div
                key={m.age}
                className="flex items-center gap-3 p-3 bg-(--background) border border-(--border) rounded-lg opacity-70"
              >
                <Circle className="h-4 w-4 text-(--muted-foreground) shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-(--foreground)">{m.label}</div>
                  <div className="text-xs text-(--muted-foreground)">
                    {m.age - currentAge} {m.age - currentAge === 1 ? "year" : "years"} away
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
