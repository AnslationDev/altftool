"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, RotateCcw } from "lucide-react";

import {
  MEAL_COUNT_OPTIONS,
  formatClock,
  formatDuration,
  planFastingWindow,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  anchor: "start",
  anchorTime: "12:00",
  eatingHours: "8",
  mealsPerDay: 3,
  bedtime: "23:00",
  wakeTime: "07:00",
  workoutTime: "18:00",
};

const PRESETS = [
  { label: "Classic 12–20", anchor: "start", anchorTime: "12:00" },
  { label: "Early 10–18", anchor: "start", anchorTime: "10:00" },
  { label: "Late 14–22", anchor: "start", anchorTime: "14:00" },
  { label: "Finish by 19:00", anchor: "end", anchorTime: "19:00" },
];

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return String(raw).trim() === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [anchor, setAnchor] = useState(DEFAULTS.anchor);
  const [anchorTime, setAnchorTime] = useState(DEFAULTS.anchorTime);
  const [eatingHours, setEatingHours] = useState(DEFAULTS.eatingHours);
  const [mealsPerDay, setMealsPerDay] = useState(DEFAULTS.mealsPerDay);
  const [bedtime, setBedtime] = useState(DEFAULTS.bedtime);
  const [wakeTime, setWakeTime] = useState(DEFAULTS.wakeTime);
  const [workoutTime, setWorkoutTime] = useState(DEFAULTS.workoutTime);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planFastingWindow({
        anchor,
        anchorTime,
        eatingHours: toNumber(eatingHours),
        mealsPerDay,
        bedtime,
        wakeTime,
        workoutTime: workoutTime || undefined,
      }),
    [anchor, anchorTime, eatingHours, mealsPerDay, bedtime, wakeTime, workoutTime],
  );

  const hasError = Boolean(plan.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `${plan.ratioLabel} time-restricted eating plan`,
      `Eating window: ${formatClock(plan.eatingStart)} – ${formatClock(plan.eatingEnd)} (${formatDuration(plan.windowMinutes)})`,
      `Fast: ${formatClock(plan.eatingEnd)} – ${formatClock(plan.eatingStart)} (${formatDuration(plan.fastingMinutes)})`,
      "",
      ...plan.meals.map((meal) => `${formatClock(meal.at)} — ${meal.role}`),
      "",
      `Fasting hours asleep: ${formatDuration(plan.fastAsleepMinutes)} of ${formatDuration(plan.fastingMinutes)}`,
      `Waking hours fasted: ${formatDuration(plan.fastAwakeMinutes)}`,
    ];
    if (plan.workout) {
      lines.push("", `Training at ${formatClock(plan.workout.at)}: ${plan.workout.insideWindow ? "inside the window" : "fasted"}`);
    }
    return lines.join("\n");
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

  const reset = () => {
    setAnchor(DEFAULTS.anchor);
    setAnchorTime(DEFAULTS.anchorTime);
    setEatingHours(DEFAULTS.eatingHours);
    setMealsPerDay(DEFAULTS.mealsPerDay);
    setBedtime(DEFAULTS.bedtime);
    setWakeTime(DEFAULTS.wakeTime);
    setWorkoutTime(DEFAULTS.workoutTime);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Fasting plans
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">16:8 Fasting Window Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Anchor an 8-hour eating window to whichever end suits your day, and see the meal times, how
          much of the 16-hour fast you sleep through, and whether training lands in the right place.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tf-anchor">
              Anchor the window to
            </label>
            <select
              id="tf-anchor"
              className={`mt-2 ${INPUT_CLASS}`}
              value={anchor}
              onChange={(event) => setAnchor(event.target.value)}
            >
              <option value="start">My first meal (window opens)</option>
              <option value="end">My last bite (window closes)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tf-anchor-time">
              {anchor === "start" ? "First meal at" : "Last bite by"}
            </label>
            <input
              id="tf-anchor-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={anchorTime}
              onChange={(event) => setAnchorTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tf-hours">
              Eating window length (hours)
            </label>
            <input
              id="tf-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="4"
              max="12"
              step="0.5"
              value={eatingHours}
              onChange={(event) => setEatingHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tf-meals">
              Meals inside the window
            </label>
            <select
              id="tf-meals"
              className={`mt-2 ${INPUT_CLASS}`}
              value={String(mealsPerDay)}
              onChange={(event) => setMealsPerDay(Number(event.target.value))}
            >
              {MEAL_COUNT_OPTIONS.map((count) => (
                <option key={count} value={String(count)}>
                  {count} meals
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tf-bed">
              Usual bedtime
            </label>
            <input
              id="tf-bed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={bedtime}
              onChange={(event) => setBedtime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tf-wake">
              Usual wake time
            </label>
            <input
              id="tf-wake"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={wakeTime}
              onChange={(event) => setWakeTime(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tf-workout">
              Training time (optional)
            </label>
            <input
              id="tf-workout"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={workoutTime}
              onChange={(event) => setWorkoutTime(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setAnchor(preset.anchor);
                setAnchorTime(preset.anchorTime);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Eating window
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${formatClock(plan.eatingStart)} – ${formatClock(plan.eatingEnd)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${plan.ratioLabel} — fast from ${formatClock(plan.eatingEnd)} to ${formatClock(plan.eatingStart)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy fasting window plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div
            className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`${formatDuration(plan.windowMinutes)} eating and ${formatDuration(plan.fastingMinutes)} fasting`}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${(plan.windowMinutes / 1440) * 100}%` }}
            />
            <span
              className="block h-full bg-[var(--muted-foreground)]"
              style={{ width: `${(plan.fastingMinutes / 1440) * 100}%` }}
            />
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Eating hours", hasError ? dash : formatDuration(plan.windowMinutes)],
            ["Fasting hours", hasError ? dash : formatDuration(plan.fastingMinutes)],
            [
              "Fasting hours you are asleep",
              hasError ? dash : `${formatDuration(plan.fastAsleepMinutes)} (${NUM1.format(plan.fastAsleepPct)}%)`,
            ],
            ["Fasting hours awake", hasError ? dash : formatDuration(plan.fastAwakeMinutes)],
            ["Waking to first meal", hasError ? dash : formatDuration(plan.wakeToFirstMeal)],
            ["Last meal to bedtime", hasError ? dash : formatDuration(plan.lastMealToBed)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError &&
          plan.warnings.map((warning) => (
            <p key={warning} className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]">
              {warning}
            </p>
          ))}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Meal times</h2>
          <ol className="mt-3 space-y-3">
            {plan.meals.map((meal) => (
              <li key={meal.index} className="flex flex-wrap items-baseline gap-x-3 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                <span className="min-w-[4.5rem] text-lg font-semibold text-[var(--primary)]">
                  {formatClock(meal.at)}
                </span>
                <span className="text-sm font-semibold">{meal.role}</span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {meal.offset === 0 ? "window opens" : `+${formatDuration(meal.offset)} into the window`}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!hasError && plan.workout && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            Training at {formatClock(plan.workout.at)} — {plan.workout.insideWindow ? "fed" : "fasted"}
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {plan.workout.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What breaks the fast</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Water, plain black coffee and plain tea carry essentially no calories and are the usual
          choices during the fasting hours. Anything with sugar, milk, cream, juice or a sweetened
          protein drink supplies calories and ends the fast. Read labels on flavoured drinks — several
          "zero" products still contain a few calories per serving.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Time-restricted eating is not suitable for everyone: talk to a doctor
        first if you are pregnant or breastfeeding, under 18, taking insulin or other glucose-lowering
        medication, managing an eating disorder or a history of one, underweight, or on medication
        that must be taken with food.
      </p>
    </main>
  );
}
