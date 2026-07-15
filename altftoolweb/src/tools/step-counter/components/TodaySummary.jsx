"use client";

import { ClipboardList } from "lucide-react";
import {
  caloriesBurned,
  distanceKm,
  formatActiveTime,
  formatNumber,
} from "../utils/stepStore";
import { toneColor, toneStyle } from "../utils/tones";
import { CARD, CardHeading } from "./ui.jsx";

function Row({ label, value, valueStyle }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-sm text-(--muted-foreground)">{label}</dt>
      <dd className="text-sm font-bold tabular-nums text-(--foreground)" style={valueStyle}>
        {value}
      </dd>
    </div>
  );
}

export default function TodaySummary({ steps, goal, activeMs }) {
  const achievedPct = goal > 0 ? Math.round((steps / goal) * 100) : 0;
  const goalMet = achievedPct >= 100;
  const barPct = Math.min(achievedPct, 100);

  return (
    <section aria-label="Today's summary" className={`${CARD} p-4 sm:p-5`}>
      <CardHeading
        icon={
          <span
            className="flex h-8 w-8 items-center justify-center rounded-[8px]"
            style={toneStyle("primary")}
          >
            <ClipboardList size={16} aria-hidden="true" />
          </span>
        }
        title="Today's Summary"
      />

      {/* goal progress strip */}
      <div className="mb-2 mt-1">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
          <span className="text-(--muted-foreground)">Goal progress</span>
          <span
            className="tabular-nums"
            style={{ color: toneColor(goalMet ? "success" : "primary") }}
          >
            {achievedPct}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={barPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Daily goal progress"
          className="h-2 overflow-hidden rounded-full bg-(--muted)"
        >
          <div
            className="h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500"
            style={{
              width: `${barPct}%`,
              background: goalMet
                ? "var(--anslation-ds-success)"
                : "var(--anslation-ds-cta-gradient)",
            }}
          />
        </div>
      </div>

      <dl className="divide-y divide-(--border)">
        <Row label="Steps" value={formatNumber(steps)} />
        <Row label="Goal" value={formatNumber(goal)} />
        <Row label="Calories" value={`${formatNumber(caloriesBurned(steps))} kcal`} />
        <Row label="Distance" value={`${distanceKm(steps)} km`} />
        <Row label="Active Time" value={formatActiveTime(activeMs)} />
      </dl>
    </section>
  );
}
