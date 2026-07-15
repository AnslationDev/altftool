"use client";

import { formatNumber } from "../utils/stepStore";
import { CARD, SectionHeading } from "./ui.jsx";

const CHART_HEIGHT = 216; // px

function niceCeil(value) {
  const step = 5000;
  return Math.max(step * 3, Math.ceil(value / step) * step);
}

function tickLabel(value) {
  return value === 0 ? "0" : `${value / 1000}K`;
}

export default function WeeklyChart({ week, goal }) {
  const max = niceCeil(Math.max(goal || 0, ...week.map((day) => day.steps)));
  const ticks = [];
  const tickStep = max > 30000 ? 10000 : 5000;
  for (let v = 0; v <= max; v += tickStep) ticks.push(v);
  const showGoalLine = goal > 0 && goal <= max;

  return (
    <section aria-label="Steps this week" className={`${CARD} p-4 sm:p-5`}>
      <SectionHeading
        eyebrow="This week"
        title="Your Progress"
        aside={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--background) px-2.5 py-1 text-[11px] font-semibold text-(--muted-foreground)">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-(--primary)" />
            Steps
          </span>
        }
      />

      <div className="flex gap-3">
        {/* y-axis labels */}
        <div
          aria-hidden="true"
          className="relative w-7 shrink-0 text-right"
          style={{ height: CHART_HEIGHT }}
        >
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 text-[10px] font-medium tabular-nums text-(--muted-foreground)"
              style={{ bottom: `${(tick / max) * 100}%`, transform: "translateY(50%)" }}
            >
              {tickLabel(tick)}
            </span>
          ))}
        </div>

        {/* plot area */}
        <div className="relative flex-1" style={{ height: CHART_HEIGHT }}>
          {/* gridlines */}
          {ticks.map((tick) => (
            <span
              key={tick}
              aria-hidden="true"
              className="absolute inset-x-0"
              style={{
                bottom: `${(tick / max) * 100}%`,
                borderTop:
                  tick === 0
                    ? "1px solid var(--anslation-ds-border-strong)"
                    : "1px dashed color-mix(in srgb, var(--border) 70%, transparent)",
              }}
            />
          ))}

          {/* goal line */}
          {showGoalLine && (
            <div
              aria-hidden="true"
              className="absolute inset-x-0 z-10"
              style={{
                bottom: `${(goal / max) * 100}%`,
                borderTop:
                  "2px dashed color-mix(in srgb, var(--anslation-ds-warning) 65%, transparent)",
              }}
            >
              <span
                className="absolute right-0 top-0 -translate-y-1/2 rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{
                  backgroundColor: "var(--anslation-ds-warning-soft)",
                  color: "color-mix(in srgb, var(--anslation-ds-warning) 72%, var(--foreground))",
                }}
              >
                Goal {formatNumber(goal)}
              </span>
            </div>
          )}

          {/* bars */}
          <div className="absolute inset-0 flex items-end justify-around gap-2">
            {week.map((day) => {
              const heightPct = Math.min(100, (day.steps / max) * 100);
              return (
                <div
                  key={day.key}
                  className="group relative flex h-full w-full max-w-12 flex-col items-center justify-end"
                >
                  {/* hover target spans the full column height */}
                  <div className="absolute inset-0" aria-hidden="true" />
                  {/* today's direct label */}
                  {day.isToday && day.steps > 0 && (
                    <span className="mb-1 text-[10px] font-bold tabular-nums text-(--primary-hover) dark:text-(--primary)">
                      {formatNumber(day.steps)}
                    </span>
                  )}
                  <div
                    role="img"
                    aria-label={`${day.label}: ${formatNumber(day.steps)} steps`}
                    className="w-full rounded-t-[4px] motion-safe:transition-all motion-safe:duration-300"
                    style={{
                      height: day.steps > 0 ? `max(${heightPct}%, 3px)` : "0px",
                      background: day.isToday
                        ? "linear-gradient(180deg, var(--anslation-ds-secondary), var(--anslation-ds-primary))"
                        : "color-mix(in srgb, var(--primary) 40%, var(--card))",
                    }}
                  />
                  {/* tooltip */}
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full z-20 mb-1.5 hidden whitespace-nowrap rounded-[6px] px-2 py-1 text-[11px] font-semibold shadow-[var(--anslation-ds-shadow-md)] group-hover:block"
                    style={{ backgroundColor: "var(--foreground)", color: "var(--background)" }}
                  >
                    {day.label} · {formatNumber(day.steps)} steps
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* x-axis labels */}
      <div className="mt-2 flex justify-around gap-2 pl-10">
        {week.map((day) => (
          <span
            key={day.key}
            className={`w-full max-w-12 text-center text-[11px] font-semibold ${
              day.isToday
                ? "text-(--primary-hover) dark:text-(--primary)"
                : "text-(--muted-foreground)"
            }`}
          >
            {day.label}
          </span>
        ))}
      </div>

      {/* accessible data table */}
      <table className="sr-only">
        <caption>Steps walked each day this week</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Steps</th>
          </tr>
        </thead>
        <tbody>
          {week.map((day) => (
            <tr key={day.key}>
              <th scope="row">{day.label}</th>
              <td>{formatNumber(day.steps)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
