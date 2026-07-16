"use client";

import { CheckCircle2, Circle, Milestone } from "lucide-react";
import { SectionCard } from "./ui";
import { Trophy3D } from "./illustrations";
import { formatShortDate } from "../utils/dateUtils";

function remainingLabel(days) {
  if (days <= 0) return "";
  const years = Math.floor(days / 365.2425);
  const months = Math.floor((days % 365.2425) / 30.4375);
  if (years > 0) return `In ${years} year${years > 1 ? "s" : ""}${months ? `, ${months} month${months > 1 ? "s" : ""}` : ""}`;
  if (months > 0) return `In ${months} month${months > 1 ? "s" : ""}`;
  return `In ${days} day${days > 1 ? "s" : ""}`;
}

export default function DayMilestones({ milestones }) {
  return (
    <SectionCard title="Your Day Milestones" icon={Milestone}>
      <div className="flex items-center gap-4">
        <ul className="min-w-0 flex-1 space-y-2.5">
          {milestones.map((m) => (
            <li key={m.label} className="flex items-center gap-3">
              {m.reached ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-(--primary)" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-(--muted-foreground)" />
              )}
              <span className="w-24 shrink-0 text-sm font-bold text-(--foreground)">{m.label}</span>
              <span className="text-xs font-medium text-(--muted-foreground)">
                {m.reached ? `Reached on ${formatShortDate(m.date)}` : remainingLabel(m.remainingDays)}
              </span>
            </li>
          ))}
        </ul>
        <div
          className="hidden shrink-0 rounded-2xl p-3 @lg:block"
          style={{
            background:
              "linear-gradient(150deg, color-mix(in srgb, var(--secondary) 14%, var(--card)), color-mix(in srgb, var(--primary) 10%, var(--card)))",
          }}
          aria-hidden="true"
        >
          <Trophy3D size={92} />
        </div>
      </div>
    </SectionCard>
  );
}
