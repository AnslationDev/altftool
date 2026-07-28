"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, RotateCcw } from "lucide-react";

import {
  MODERATE_MET_MAX,
  MODERATE_MET_MIN,
  STYLES,
  WHO_WEEKLY_MODERATE_MINUTES,
  compareStyles,
  estimateSession,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  styleId: "vinyasa",
  minutes: "60",
  weight: "70",
  weightUnit: "kg",
  sessions: "3",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [styleId, setStyleId] = useState(DEFAULTS.styleId);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState(DEFAULTS.weightUnit);
  const [sessions, setSessions] = useState(DEFAULTS.sessions);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateSession({
        styleId,
        minutes: toNumber(minutes),
        weight: toNumber(weight),
        weightUnit,
        sessionsPerWeek: toNumber(sessions),
      }),
    [styleId, minutes, weight, weightUnit, sessions],
  );

  const comparison = useMemo(
    () =>
      compareStyles({
        minutes: toNumber(minutes),
        weight: toNumber(weight),
        weightUnit,
      }),
    [minutes, weight, weightUnit],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Yoga session energy estimate",
      `Style: ${result.style.name} (MET ${result.style.met})`,
      `Session: ${NUM0.format(result.minutes)} min at ${NUM1.format(result.weightKg)} kg`,
      `Gross: ${NUM0.format(result.grossCalories)} kcal (${NUM1.format(result.grossPerMinute)} kcal/min)`,
      `Net of resting metabolism: ${NUM0.format(result.netCalories)} kcal`,
      `MET-minutes: ${NUM0.format(result.metMinutes)}`,
      `Weekly at ${NUM0.format(toNumber(sessions))} sessions: ${NUM0.format(result.weeklyGrossCalories)} kcal across ${NUM0.format(result.weeklyMinutes)} min`,
      `MET source: ${result.style.source}`,
    ].join("\n");
  }, [hasError, result, sessions]);

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
    setStyleId(DEFAULTS.styleId);
    setMinutes(DEFAULTS.minutes);
    setWeight(DEFAULTS.weight);
    setWeightUnit(DEFAULTS.weightUnit);
    setSessions(DEFAULTS.sessions);
    setCopied(false);
  };

  const style = STYLES.find((item) => item.id === styleId);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Yoga energy cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Yoga Session Calorie Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Calories from published MET values and the ACSM formula — kcal/min = MET × 3.5 × kg ÷ 200 —
          across twelve styles from restorative to power yoga.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="yc-style">
              Yoga style
            </label>
            <select
              id="yc-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={styleId}
              onChange={(event) => setStyleId(event.target.value)}
            >
              {STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {item.met} METs
                </option>
              ))}
            </select>
            {style && <p className="mt-2 text-sm text-[var(--muted-foreground)]">{style.note}</p>}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yc-minutes">
              Session length (minutes)
            </label>
            <input
              id="yc-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="300"
              step="5"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yc-sessions">
              Sessions per week
            </label>
            <input
              id="yc-sessions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="21"
              step="1"
              value={sessions}
              onChange={(event) => setSessions(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yc-weight">
              Body weight
            </label>
            <input
              id="yc-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yc-unit">
              Weight unit
            </label>
            <select
              id="yc-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={weightUnit}
              onChange={(event) => setWeightUnit(event.target.value)}
            >
              <option value="kg">kilograms</option>
              <option value="lb">pounds</option>
            </select>
          </div>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Calories this session
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.grossCalories)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see an estimate."
                : `${NUM1.format(result.grossPerMinute)} kcal per minute at MET ${result.style.met}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the yoga calorie estimate"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Net of resting metabolism",
              hasError ? DASH : `${NUM0.format(result.netCalories)} kcal`,
            ],
            ["MET-minutes this session", hasError ? DASH : NUM0.format(result.metMinutes)],
            [
              "Counts as moderate intensity",
              hasError
                ? DASH
                : result.isModerate
                  ? `Yes (${MODERATE_MET_MIN}–${MODERATE_MET_MAX} METs)`
                  : `No — below ${MODERATE_MET_MIN} METs`,
            ],
            [
              "Weekly minutes at this frequency",
              hasError ? DASH : `${NUM0.format(result.weeklyMinutes)} min`,
            ],
            [
              "Weekly calories",
              hasError ? DASH : `${NUM0.format(result.weeklyGrossCalories)} kcal`,
            ],
            [
              `Share of the ${WHO_WEEKLY_MODERATE_MINUTES} min weekly target`,
              hasError
                ? DASH
                : result.isModerate
                  ? `${NUM0.format(result.whoTargetPercent)}%`
                  : "does not count towards it",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm ${
              result.style.derived
                ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                : "bg-[var(--success-soft)] text-[var(--success)]"
            }`}
          >
            {result.style.derived ? "Estimated MET value: " : "Published MET value: "}
            {result.style.source}.
          </p>
        )}
      </section>

      <section className="mt-6 overflow-x-auto rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Every style at this weight and duration</h2>
        <table className="mt-3 w-full min-w-[340px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <th scope="col" className="py-2 pr-3 font-semibold">
                Style
              </th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">
                MET
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                kcal
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr
                key={row.style.id}
                className={`border-b border-[var(--border)] last:border-0 ${
                  row.style.id === styleId ? "bg-[var(--muted)]" : ""
                }`}
              >
                <td className="py-2 pr-3">
                  <span className="font-semibold">{row.style.name}</span>
                  {row.style.derived && (
                    <span className="ml-2 text-xs text-[var(--muted-foreground)]">estimated</span>
                  )}
                </td>
                <td className="py-2 pr-3 text-right tabular-nums">{row.style.met}</td>
                <td className="py-2 text-right font-semibold tabular-nums">
                  {row.error ? DASH : NUM0.format(row.grossCalories)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        MET values describe an average adult, so real energy cost varies with fitness, class
        intensity and how much of the session is spent resting. Treat the number as a comparison
        between styles rather than a measurement, and do not use it to justify a large calorie
        deficit. Informational only — speak to a dietitian or doctor about your own intake.
      </p>
    </main>
  );
}
