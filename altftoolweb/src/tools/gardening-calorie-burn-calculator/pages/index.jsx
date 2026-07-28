"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sprout } from "lucide-react";

import {
  GARDEN_TASKS,
  WHO_WEEKLY_MODERATE_MAX,
  WHO_WEEKLY_MODERATE_MIN,
  computeGardeningCalories,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULT_WEIGHT = "70";
const DEFAULT_UNIT = "kg";
const DEFAULT_SESSIONS = "2";
const DEFAULT_MINUTES = {
  watering: "10",
  containers: "0",
  weeding: "30",
  general: "0",
  raking: "0",
  trimming: "0",
  planting: "0",
  digging: "20",
  mowingPower: "25",
  mowingHand: "0",
};

const BAND_LABEL = {
  light: "Light",
  moderate: "Moderate",
  vigorous: "Vigorous",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const num = (raw) => {
  const text = String(raw ?? "").trim();
  if (text === "") return 0;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULT_WEIGHT);
  const [weightUnit, setWeightUnit] = useState(DEFAULT_UNIT);
  const [sessions, setSessions] = useState(DEFAULT_SESSIONS);
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const parsed = {};
    for (const task of GARDEN_TASKS) {
      const value = num(minutes[task.id]);
      if (value === null) return { error: "Enter minutes as plain numbers." };
      parsed[task.id] = value;
    }
    return computeGardeningCalories({
      weight: num(weight),
      weightUnit,
      minutes: parsed,
      sessionsPerWeek: num(sessions),
    });
  }, [weight, weightUnit, minutes, sessions]);

  const hasError = Boolean(result.error);

  const setTask = (id, value) => {
    setMinutes((current) => ({ ...current, [id]: value }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Gardening Calorie Burn Calculator",
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Session: ${NUM0.format(result.sessionMinutes)} min, ${NUM0.format(result.sessionKcal)} kcal`,
      `Net above resting: ${NUM0.format(result.sessionNetKcal)} kcal`,
      `Average intensity: ${NUM2.format(result.averageMet)} METs`,
      `Per week (${NUM0.format(result.sessionsPerWeek)} sessions): ${NUM0.format(result.weekKcal)} kcal`,
      `Weekly MET-minutes: ${NUM0.format(result.weekMetMinutes)}`,
      `Weekly moderate-equivalent minutes: ${NUM0.format(result.weeklyMvpaEquivalent)} of ${WHO_WEEKLY_MODERATE_MIN}`,
      result.meetsWhoMinimum
        ? "This meets the WHO minimum of 150 moderate-intensity minutes a week."
        : "This is below the WHO minimum of 150 moderate-intensity minutes a week.",
      "",
      "Breakdown:",
    ];
    for (const row of result.rows) {
      lines.push(
        `- ${row.label}: ${NUM0.format(row.minutes)} min at ${NUM1.format(row.met)} METs (${BAND_LABEL[row.band]}) = ${NUM0.format(row.kcal)} kcal`,
      );
    }
    return lines.join("\n");
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
    setWeight(DEFAULT_WEIGHT);
    setWeightUnit(DEFAULT_UNIT);
    setSessions(DEFAULT_SESSIONS);
    setMinutes(DEFAULT_MINUTES);
    setCopied(false);
  };

  const targetWidth = hasError ? 0 : Math.max(0, Math.min(100, result.whoTargetPercent));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sprout className="h-4 w-4" aria-hidden="true" />
          Household activity
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gardening Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price each garden job at its published MET value — watering is 1.5, weeding 3.5, digging
          5.0, push-mowing 6.0 — and see how much of the WHO weekly activity target your garden
          covers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="garden-weight">
              Body weight
            </label>
            <input
              id="garden-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="garden-unit">
              Weight unit
            </label>
            <select
              id="garden-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={weightUnit}
              onChange={(event) => setWeightUnit(event.target.value)}
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="lb">Pounds (lb)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="garden-sessions">
              Gardening sessions per week
            </label>
            <input
              id="garden-sessions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="14"
              step="1"
              value={sessions}
              onChange={(event) => setSessions(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Minutes per session</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {GARDEN_TASKS.map((task) => (
            <div key={task.id}>
              <label className={LABEL_CLASS} htmlFor={`garden-${task.id}`}>
                {task.label}
              </label>
              <input
                id={`garden-${task.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="5"
                value={minutes[task.id]}
                onChange={(event) => setTask(task.id, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {NUM1.format(task.met)} METs · code {task.code}
              </p>
            </div>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Calories per session
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.sessionKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see a result."
                : `${NUM0.format(result.sessionMinutes)} minutes in the garden`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy gardening calorie result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Net above resting, per session",
              hasError ? DASH : `${NUM0.format(result.sessionNetKcal)} kcal`,
            ],
            ["Average intensity", hasError ? DASH : `${NUM2.format(result.averageMet)} METs`],
            ["Burn rate", hasError ? DASH : `${NUM1.format(result.kcalPerMin)} kcal/min`],
            ["Calories per week", hasError ? DASH : `${NUM0.format(result.weekKcal)} kcal`],
            ["MET-minutes per week", hasError ? DASH : NUM0.format(result.weekMetMinutes)],
            [
              "Moderate minutes per week",
              hasError ? DASH : NUM0.format(result.weeklyModerateMinutes),
            ],
            [
              "Vigorous minutes per week",
              hasError ? DASH : NUM0.format(result.weeklyVigorousMinutes),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Against the WHO weekly target</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Adults are advised to do {WHO_WEEKLY_MODERATE_MIN}–{WHO_WEEKLY_MODERATE_MAX} minutes of
          moderate-intensity activity a week. Vigorous minutes count double.
        </p>
        <p className="mt-4 text-2xl font-semibold">
          {hasError
            ? DASH
            : `${NUM0.format(result.weeklyMvpaEquivalent)} of ${WHO_WEEKLY_MODERATE_MIN} minutes`}
        </p>
        <div
          className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={
            hasError
              ? "No weekly activity total available"
              : `${NUM0.format(result.whoTargetPercent)} percent of the WHO weekly minimum`
          }
        >
          <span
            className={`block h-full ${
              !hasError && result.meetsWhoMinimum ? "bg-[var(--success)]" : "bg-[var(--primary)]"
            }`}
            style={{ width: `${targetWidth}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {hasError
            ? "Fix the inputs above to see your weekly total."
            : result.meetsWhoMinimum
              ? `Gardening alone covers ${NUM0.format(result.whoTargetPercent)}% of the weekly minimum.`
              : `Gardening covers ${NUM0.format(result.whoTargetPercent)}% of the weekly minimum — light tasks such as watering do not count toward it.`}
        </p>
      </section>

      {!hasError && result.rows.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Task-by-task breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Task
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Minutes
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    METs
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Band
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    kcal
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{NUM0.format(row.minutes)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(row.met)}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {BAND_LABEL[row.band]}
                    </td>
                    <td className="py-2 text-right font-semibold">{NUM0.format(row.kcal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        MET values describe an average adult working steadily; tea breaks and standing about are not
        deducted. Informational only — if you have a heart, joint or back condition, check with a
        doctor before taking on heavy digging or mowing.
      </p>
    </main>
  );
}
