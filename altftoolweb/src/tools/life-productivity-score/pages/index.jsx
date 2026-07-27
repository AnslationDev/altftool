"use client";

import { useMemo, useState } from "react";
import { Activity, Check, Copy, RotateCcw } from "lucide-react";

import { calculateProductivityScore, COMPONENTS } from "../lib";

const DEFAULTS = {
  sleepHours: "7.5",
  focusHours: "4",
  activityMinutes: "30",
  tasksDone: "8",
  tasksPlanned: "10",
  screenHours: "2",
  learningMinutes: "20",
  socialMinutes: "30",
};

const FIELDS = [
  { id: "sleepHours", label: "Sleep last night (hours)", step: "0.5", min: "0", max: "24" },
  { id: "focusHours", label: "Focused, undistracted work (hours)", step: "0.5", min: "0", max: "24" },
  { id: "activityMinutes", label: "Physical activity (minutes)", step: "5", min: "0", max: "1440" },
  { id: "tasksDone", label: "Tasks completed", step: "1", min: "0", max: "999" },
  { id: "tasksPlanned", label: "Tasks planned", step: "1", min: "0", max: "999" },
  { id: "screenHours", label: "Non-work screen time (hours)", step: "0.5", min: "0", max: "24" },
  { id: "learningMinutes", label: "Reading or learning (minutes)", step: "5", min: "0", max: "1440" },
  { id: "socialMinutes", label: "Meaningful social contact (minutes)", step: "5", min: "0", max: "1440" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const fmt = (digits) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits });

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-semibold text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (id, value) => {
    setValues((previous) => ({ ...previous, [id]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      calculateProductivityScore({
        sleepHours: toNumber(values.sleepHours),
        focusHours: toNumber(values.focusHours),
        activityMinutes: toNumber(values.activityMinutes),
        tasksDone: toNumber(values.tasksDone),
        tasksPlanned: toNumber(values.tasksPlanned),
        screenHours: toNumber(values.screenHours),
        learningMinutes: toNumber(values.learningMinutes),
        socialMinutes: toNumber(values.socialMinutes),
      }),
    [values],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Life Productivity Score",
      `Score: ${result.score}/100 — ${result.band}`,
      ...result.breakdown.map(
        (entry) => `${entry.label}: ${fmt(1).format(entry.points)} of ${entry.weight} (target ${entry.target})`,
      ),
      `Biggest gap: ${result.biggestGap.label}, ${fmt(1).format(result.biggestGap.lost)} points available`,
      `Hours logged: ${fmt(1).format(result.loggedHours)} of 24`,
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
    setValues(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Daily self-check
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Life Productivity Score</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log one day and get a 100-point score built from seven weighted pillars — sleep, focused
          work, movement, task completion, screen time, learning and social contact. Every target is
          a published guideline, and the full breakdown is shown so you can see where the points
          went.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.id}>
            <label className={LABEL_CLASS} htmlFor={`lps-${field.id}`}>
              {field.label}
            </label>
            <input
              id={`lps-${field.id}`}
              className={`${INPUT_CLASS} mt-1`}
              value={values[field.id]}
              onChange={(event) => setField(field.id, event.target.value)}
              type="number"
              min={field.min}
              max={field.max}
              step={field.step}
              inputMode="decimal"
            />
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {hasError ? (
          <p role="alert" className="mb-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {result.error}
          </p>
        ) : null}

        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Today&rsquo;s score
        </p>
        <p className="mt-1 text-5xl leading-none font-bold">
          {hasError ? DASH : result.score}
          <span className="ml-1 text-2xl font-semibold text-[var(--muted-foreground)]">/100</span>
        </p>
        <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
          {hasError ? DASH : result.band}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError ? DASH : result.bandNote}
        </p>

        <dl className="mt-4">
          {result.breakdown
            ? result.breakdown.map((entry) => (
                <Row
                  key={entry.id}
                  label={`${entry.label} (target ${entry.target})`}
                  value={`${fmt(1).format(entry.points)} / ${entry.weight}`}
                />
              ))
            : COMPONENTS.map((component) => (
                <Row key={component.id} label={component.label} value={DASH} />
              ))}
          <Row
            label="Biggest single gain available"
            value={
              hasError
                ? DASH
                : `${result.biggestGap.label} — ${fmt(1).format(result.biggestGap.lost)} points`
            }
          />
          <Row
            label="Hours accounted for"
            value={hasError ? DASH : `${fmt(1).format(result.loggedHours)} of 24`}
          />
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyResult}
            aria-label="Copy the productivity score breakdown to the clipboard"
            disabled={hasError}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">How the 100 points are split</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-sm border-collapse text-sm">
            <thead>
              <tr className="text-left text-[var(--muted-foreground)]">
                <th scope="col" className="border-b border-[var(--border)] py-2 pr-3 font-medium">Pillar</th>
                <th scope="col" className="border-b border-[var(--border)] py-2 pr-3 font-medium">Weight</th>
                <th scope="col" className="border-b border-[var(--border)] py-2 font-medium">Full-marks target</th>
              </tr>
            </thead>
            <tbody>
              {COMPONENTS.map((component) => (
                <tr key={component.id}>
                  <td className="border-b border-[var(--border)] py-2 pr-3 font-semibold">{component.label}</td>
                  <td className="border-b border-[var(--border)] py-2 pr-3">{component.weight} pts</td>
                  <td className="border-b border-[var(--border)] py-2">{component.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
        Targets come from the National Sleep Foundation adult sleep range (7–9 hours) and the WHO
        2020 physical activity guideline (150 minutes of moderate activity a week). This is a
        self-tracking aid for spotting patterns across weeks — it is not a medical assessment.
      </p>
    </main>
  );
}
