"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Smartphone } from "lucide-react";

import { AGE_BANDS, formatMinutes, planScreenTime } from "../lib";

const DEFAULTS = {
  ageYears: "9",
  plannedScreenMinutes: "90",
  schoolHours: "6.5",
  sleepHours: "10",
  routineHours: "2",
  homeworkHours: "1",
  outdoorMinutes: "120",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const toNumber = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return NaN;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planScreenTime({
        ageYears: toNumber(values.ageYears),
        plannedScreenMinutes: toNumber(values.plannedScreenMinutes),
        schoolHours: toNumber(values.schoolHours),
        sleepHours: toNumber(values.sleepHours),
        routineHours: toNumber(values.routineHours),
        homeworkHours: toNumber(values.homeworkHours),
        outdoorMinutes: toNumber(values.outdoorMinutes),
      }),
    [values],
  );

  const hasError = Boolean(plan.error);

  const update = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    setValues(DEFAULTS);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Child Screen Time Planner",
      `Age band: ${plan.band.label}`,
      `Recommended recreational screen time: ${formatMinutes(plan.recommendedMinutes)}`,
      `Planned recreational screen time: ${formatMinutes(plan.plannedMinutes)}`,
      `Free time left in 24-hour budget: ${formatMinutes(plan.freeMinutes)}`,
      `Sleep target: ${plan.sleepTarget}`,
      `Activity target: ${plan.activityLabel}`,
      `Outdoor target gap: ${formatMinutes(plan.outdoorGapMinutes)}`,
      `Eye breaks: ${plan.eyeBreaks} x 20-second distance breaks`,
      plan.withinLimit
        ? "Status: within the calculated limit"
        : `Status: ${formatMinutes(plan.overMinutes)} over the calculated limit`,
    ].join("\n");
  }, [hasError, plan]);

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

  const rows = hasError
    ? [
        ["Age band", DASH],
        ["Recommended screen time", DASH],
        ["Free day-budget time", DASH],
        ["Sleep range", DASH],
        ["Activity target", DASH],
        ["Outdoor shortfall", DASH],
        ["Eye breaks", DASH],
      ]
    : [
        ["Age band", plan.band.label],
        ["Recommended screen time", formatMinutes(plan.recommendedMinutes)],
        ["Free day-budget time", formatMinutes(plan.freeMinutes)],
        ["Sleep range", plan.sleepTarget],
        ["Activity target", formatMinutes(plan.activityTargetMinutes)],
        ["Outdoor shortfall", formatMinutes(plan.outdoorGapMinutes)],
        ["Eye breaks", `${plan.eyeBreaks} x 20 sec`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Smartphone className="h-4 w-4" aria-hidden="true" />
          Child wellbeing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Child Screen Time Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn WHO/AAP screen guidance into a whole-day plan that protects sleep,
          movement, daylight and homework time.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="screen-age">
              Child age (years)
            </label>
            <select
              id="screen-age"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.ageYears}
              onChange={(event) => update("ageYears", event.target.value)}
            >
              {Array.from({ length: 19 }, (_, age) => (
                <option key={age} value={String(age)}>
                  {age} {age === 1 ? "year" : "years"}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Covers {AGE_BANDS[0].label.toLowerCase()} through teenagers.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="screen-planned">
              Planned recreational screen time (minutes)
            </label>
            <input
              id="screen-planned"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="5"
              value={values.plannedScreenMinutes}
              onChange={(event) => update("plannedScreenMinutes", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="screen-sleep">
              Sleep planned (hours)
            </label>
            <input
              id="screen-sleep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="0.5"
              value={values.sleepHours}
              onChange={(event) => update("sleepHours", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="screen-school">
              School / nursery (hours)
            </label>
            <input
              id="screen-school"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="0.25"
              value={values.schoolHours}
              onChange={(event) => update("schoolHours", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="screen-homework">
              Homework / study (hours)
            </label>
            <input
              id="screen-homework"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="0.25"
              value={values.homeworkHours}
              onChange={(event) => update("homeworkHours", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="screen-routine">
              Meals, travel and routine (hours)
            </label>
            <input
              id="screen-routine"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="0.25"
              value={values.routineHours}
              onChange={(event) => update("routineHours", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="screen-outdoor">
              Outdoor daylight time (minutes)
            </label>
            <input
              id="screen-outdoor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="5"
              value={values.outdoorMinutes}
              onChange={(event) => update("outdoorMinutes", event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended recreational limit
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatMinutes(plan.recommendedMinutes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see a plan."
                : plan.withinLimit
                  ? "The planned screen time fits this day."
                  : `${formatMinutes(plan.overMinutes)} over this day’s calculated limit.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} disabled={hasError} className={`${GHOST_BTN} disabled:opacity-50`}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
              <dt className="text-xs font-medium text-[var(--muted-foreground)]">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 rounded-lg bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
            <p className="font-semibold text-[var(--foreground)]">{plan.guidance}</p>
            {plan.notes.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {plan.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
            <p className="mt-2">
              Weekly recreational total: {NUM1.format(plan.weeklyScreenHours)} hours.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
