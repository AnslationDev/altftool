"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, Radar, RotateCcw, Trash2 } from "lucide-react";

import {
  MAX_SUBJECTS,
  MIN_SUBJECTS,
  analyseSubjects,
  radarAxes,
  radarPoints,
} from "../lib";

const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_SUBJECTS = [
  { name: "Maths", obtained: "82", max: "100" },
  { name: "Science", obtained: "74", max: "100" },
  { name: "English", obtained: "68", max: "100" },
  { name: "Social Science", obtained: "77", max: "100" },
  { name: "Hindi", obtained: "61", max: "100" },
];

// Chart geometry (viewBox units, not pixels).
const CHART_SIZE = 320;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = 110;
const GRID_LEVELS = [25, 50, 75, 100];

export default function ToolHome() {
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyseSubjects({ subjects }), [subjects]);
  const hasError = Boolean(result.error);

  const chart = useMemo(() => {
    if (hasError) return null;
    const percents = result.rows.map((r) => r.percent);
    const points = radarPoints(percents, CHART_CENTER, CHART_CENTER, CHART_RADIUS);
    const axes = radarAxes(percents.length, CHART_CENTER, CHART_CENTER, CHART_RADIUS, 20);
    const grid = GRID_LEVELS.map((level) =>
      radarPoints(
        Array(percents.length).fill(level),
        CHART_CENTER,
        CHART_CENTER,
        CHART_RADIUS,
      )
        .map((p) => `${p.x},${p.y}`)
        .join(" "),
    );
    return {
      polygon: points.map((p) => `${p.x},${p.y}`).join(" "),
      points,
      axes,
      grid,
    };
  }, [hasError, result]);

  const updateSubject = (index, field, value) => {
    setSubjects((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const addSubject = () => {
    setSubjects((prev) =>
      prev.length >= MAX_SUBJECTS
        ? prev
        : [...prev, { name: `Subject ${prev.length + 1}`, obtained: "", max: "100" }],
    );
  };

  const removeSubject = (index) => {
    setSubjects((prev) =>
      prev.length <= MIN_SUBJECTS ? prev : prev.filter((_, i) => i !== index),
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Subject strength radar",
      ...result.rows.map((row) => `${row.name}: ${PCT.format(row.percent)}%`),
      `Average: ${PCT.format(result.averagePercent)}%`,
      `Strongest: ${result.strongestName} (${PCT.format(result.strongestPercent)}%)`,
      `Weakest: ${result.weakestName} (${PCT.format(result.weakestPercent)}%)`,
      `Balance: ${result.balanceLabel} (spread ${PCT.format(result.spreadPoints)} pts, σ ${PCT.format(result.standardDeviation)})`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSubjects(DEFAULT_SUBJECTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Radar className="h-4 w-4" aria-hidden="true" />
          Result analysis
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Subject Strength Radar
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter marks for each subject to plot them on a radar chart. Every score is
          normalised to a percentage, and the spread across subjects is scored so you can see
          how balanced your profile is.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-4">
          {subjects.map((row, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end sm:border-0 sm:p-0"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`ssr-name-${index}`}>
                  Subject {index + 1}
                </label>
                <input
                  id={`ssr-name-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={row.name}
                  onChange={(event) => updateSubject(index, "name", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`ssr-obtained-${index}`}>
                  Marks obtained
                </label>
                <input
                  id={`ssr-obtained-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={row.obtained}
                  onChange={(event) => updateSubject(index, "obtained", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`ssr-max-${index}`}>
                  Maximum marks
                </label>
                <input
                  id={`ssr-max-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  value={row.max}
                  onChange={(event) => updateSubject(index, "max", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSubject(index)}
                disabled={subjects.length <= MIN_SUBJECTS}
                aria-label={`Remove ${row.name || `subject ${index + 1}`}`}
                className={`${GHOST_BTN} disabled:opacity-40`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove</span>
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addSubject}
          disabled={subjects.length >= MAX_SUBJECTS}
          className={`mt-4 ${GHOST_BTN} disabled:opacity-40`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add subject
        </button>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Balance across subjects
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.balanceLabel}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the radar."
                : `Average ${PCT.format(result.averagePercent)}% with a ${PCT.format(result.spreadPoints)}-point gap between strongest and weakest.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the subject strength summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && chart ? (
          <div className="mt-4 flex justify-center">
            <svg
              viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
              className="h-auto w-full max-w-[360px]"
              role="img"
              aria-label={`Radar chart of subject percentages: ${result.rows
                .map((r) => `${r.name} ${PCT.format(r.percent)} percent`)
                .join(", ")}`}
            >
              {chart.grid.map((points, i) => (
                <polygon
                  key={GRID_LEVELS[i]}
                  points={points}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="1"
                />
              ))}
              {chart.axes.map((axis, i) => (
                <line
                  key={`axis-${i}`}
                  x1={CHART_CENTER}
                  y1={CHART_CENTER}
                  x2={axis.x}
                  y2={axis.y}
                  stroke="var(--border)"
                  strokeWidth="1"
                />
              ))}
              <polygon
                points={chart.polygon}
                fill="var(--primary)"
                fillOpacity="0.25"
                stroke="var(--primary)"
                strokeWidth="2"
              />
              {chart.points.map((point, i) => (
                <circle
                  key={`pt-${i}`}
                  cx={point.x}
                  cy={point.y}
                  r="3.5"
                  fill="var(--primary)"
                />
              ))}
              {chart.axes.map((axis, i) => (
                <text
                  key={`label-${i}`}
                  x={axis.labelX}
                  y={axis.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-[var(--muted-foreground)] text-[11px] font-medium"
                >
                  {result.rows[i].name.length > 12
                    ? `${result.rows[i].name.slice(0, 11)}…`
                    : result.rows[i].name}
                </text>
              ))}
            </svg>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Average score", hasError ? DASH : `${PCT.format(result.averagePercent)}%`],
            [
              "Strongest subject",
              hasError
                ? DASH
                : `${result.strongestName} — ${PCT.format(result.strongestPercent)}%`,
            ],
            [
              "Weakest subject",
              hasError
                ? DASH
                : `${result.weakestName} — ${PCT.format(result.weakestPercent)}%`,
            ],
            [
              "Spread (best minus worst)",
              hasError ? DASH : `${PCT.format(result.spreadPoints)} pts`,
            ],
            [
              "Standard deviation",
              hasError ? DASH : `${PCT.format(result.standardDeviation)} pts`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The radar plots each subject as a percentage of its own maximum, so subjects with
        different total marks share one scale. Balance bands are based on the standard
        deviation of your percentages.
      </p>
    </main>
  );
}
