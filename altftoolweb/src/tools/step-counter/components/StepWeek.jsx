"use client";

import { useMemo } from "react";
import { formatNumber } from "../utils/stepStore";
import { C } from "./stepTheme";

/* Real history only — these are the days this browser actually recorded. */

const CH = { w: 312, h: 96, padX: 12, top: 8, bottom: 88 };

// Catmull-Rom → cubic bezier spline: a smooth line that still passes through
// every data point, so no day is drawn as a value it does not have.
function splinePath(pts) {
  if (pts.length < 2) return "";
  const d = [`M${pts[0].x},${pts[0].y}`];
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(
      `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`,
    );
  }
  return d.join(" ");
}

export default function StepWeek({ last7, goal, hydrated }) {
  const series = useMemo(() => last7 || [], [last7]);

  const chart = useMemo(() => {
    const maxSteps = Math.max(0, ...series.map((d) => d.steps));
    const yMax = Math.max(goal, maxSteps) * 1.15 || 1;
    const stepX = (CH.w - CH.padX * 2) / Math.max(series.length - 1, 1);
    const yFor = (v) => CH.top + (1 - v / yMax) * (CH.bottom - CH.top);
    const pts = series.map((d, i) => ({ x: CH.padX + i * stepX, y: yFor(d.steps), day: d }));
    return { pts, goalY: yFor(goal), line: splinePath(pts) };
  }, [series, goal]);

  const areaPath = chart.line
    ? `${chart.line} L${(CH.w - CH.padX).toFixed(1)},${CH.h} L${CH.padX},${CH.h} Z`
    : "";

  const recorded = series.filter((d) => d.steps > 0).length;

  return (
    <section aria-labelledby="sc3-week-h">
      <div className="flex items-baseline justify-between gap-3 pb-3">
        <h2 id="sc3-week-h" className="text-[15px] font-bold" style={{ color: C.ink }}>
          Last 7 days
        </h2>
        <span className="text-[14px]" style={{ color: C.muted }}>
          {recorded > 0 ? `${recorded} of 7 days recorded` : "No days recorded yet"}
        </span>
      </div>

      <div className="flex items-center justify-between pb-1.5">
        {series.map((d) => (
          <span
            key={d.key}
            className="flex-1 text-center text-[14px] font-semibold"
            style={{ color: d.isToday ? C.accentText : C.muted }}
          >
            {d.label.slice(0, 3)}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${CH.w} ${CH.h}`} className="block h-auto w-full" aria-hidden="true">
        <defs>
          <linearGradient id="sc3-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.accent} stopOpacity="0.26" />
            <stop offset="100%" stopColor={C.accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        <g strokeWidth="1" style={{ stroke: "var(--sc3-grid)" }}>
          {chart.pts.map((p) => (
            <line key={p.day.key} x1={p.x} y1="2" x2={p.x} y2="91" />
          ))}
        </g>

        <line
          x1="6"
          y1={chart.goalY.toFixed(1)}
          x2={CH.w - 6}
          y2={chart.goalY.toFixed(1)}
          strokeWidth="1.5"
          strokeDasharray="1.6 5.5"
          strokeLinecap="round"
          style={{ stroke: "var(--sc3-goal-line)" }}
        />

        {hydrated && areaPath ? (
          <path className="sc3-chart-area" d={areaPath} fill="url(#sc3-area-grad)" />
        ) : null}
        {hydrated && chart.line ? (
          <path
            className="sc3-chart-line"
            d={chart.line}
            pathLength="1"
            fill="none"
            stroke={C.accent}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        ) : null}
        {hydrated
          ? chart.pts.map((p, i) => (
              <circle
                key={p.day.key}
                className="sc3-chart-dot"
                cx={p.x}
                cy={p.y}
                r={p.day.isToday ? 5.5 : 4}
                strokeWidth={p.day.isToday ? 2.5 : 1}
                style={{
                  fill: "var(--sc3-dot)",
                  stroke: p.day.isToday ? C.accent : "var(--sc3-dot-stroke)",
                  animationDelay: `${0.3 + i * 0.06}s`,
                }}
              />
            ))
          : null}
      </svg>

      {/* The chart is decorative for assistive tech; the numbers are not. */}
      <ul className="sr-only">
        {series.map((d) => (
          <li key={d.key}>
            {d.label}
            {d.isToday ? " (today)" : ""}: {formatNumber(d.steps)} steps
          </li>
        ))}
      </ul>
      <p className="pt-2 text-[14px]" style={{ color: C.muted }}>
        Dotted line is your {formatNumber(goal)}-step goal.
      </p>
    </section>
  );
}
