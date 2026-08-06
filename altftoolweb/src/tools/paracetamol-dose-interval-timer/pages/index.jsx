"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Pill, RotateCcw } from "lucide-react";
import {
  ADULT_DAILY_MAX_MG,
  CHILD_DOSE_MG_PER_KG,
  MODES,
  OTC_LABEL_DAILY_MAX_MG,
  computeParacetamolPlan,
  formatClock12,
  formatDuration,
} from "../lib";

const DEFAULTS = {
  mode: "adult",
  weightKg: "20",
  lastDoseTime: "14:00",
  dosesTaken: "2",
  mgPerDose: "1000",
  intervalHours: "4",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const MG = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [lastDoseTime, setLastDoseTime] = useState(DEFAULTS.lastDoseTime);
  const [dosesTaken, setDosesTaken] = useState(DEFAULTS.dosesTaken);
  const [mgPerDose, setMgPerDose] = useState(DEFAULTS.mgPerDose);
  const [intervalHours, setIntervalHours] = useState(DEFAULTS.intervalHours);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeParacetamolPlan({
        mode,
        weightKg,
        lastDoseTime,
        dosesTaken,
        mgPerDose,
        intervalHours,
      }),
    [mode, weightKg, lastDoseTime, dosesTaken, mgPerDose, intervalHours],
  );

  const hasError = Boolean(result.error);

  const summary = (() => {
    if (hasError) return "";
    const lines = [
      "Paracetamol Dose Interval Timer",
      `Last dose: ${formatClock12(result.lastDose)} · ${result.dosesTaken} dose(s) of ${MG.format(result.mgPerDose)} mg in 24 hours`,
      `Taken so far: ${MG.format(result.takenMg)} mg of a ${MG.format(result.dailyMaxMg)} mg limit`,
      `Next dose no earlier than: ${formatClock12(result.nextDoseMinutes)}`,
      `Doses still available today: ${result.remainingDoses}`,
    ];
    if (result.overLimit) lines.push("OVER THE 24-HOUR LIMIT — seek medical advice.");
    return lines.join("\n");
  })();

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
    setMode(DEFAULTS.mode);
    setWeightKg(DEFAULTS.weightKg);
    setLastDoseTime(DEFAULTS.lastDoseTime);
    setDosesTaken(DEFAULTS.dosesTaken);
    setMgPerDose(DEFAULTS.mgPerDose);
    setIntervalHours(DEFAULTS.intervalHours);
    setCopied(false);
  };

  const usedWidth = hasError ? 0 : result.usedShareCapped;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Pill className="h-4 w-4" aria-hidden="true" />
          Medication timing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Paracetamol Dose Interval Timer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two limits govern paracetamol: a minimum gap between doses, and a total for the 24-hour
          period. Enter what has already been taken and this shows the earliest time for the next
          dose, how much of the daily allowance is left, and which limit you will hit first.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pt-mode">
              Who is this for
            </label>
            <select
              id="pt-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {MODES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          {mode === "child" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="pt-weight">
                Child weight (kg)
              </label>
              <input
                id="pt-weight"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="4"
                max="100"
                step="0.5"
                value={weightKg}
                onChange={(event) => setWeightKg(event.target.value)}
              />
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Standard paediatric dosing is {CHILD_DOSE_MG_PER_KG} mg per kg per dose.
              </p>
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="pt-interval">
                Gap between doses (hours)
              </label>
              <input
                id="pt-interval"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="4"
                max="8"
                step="1"
                value={intervalHours}
                onChange={(event) => setIntervalHours(event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="pt-lastdose">
              Time of the last dose
            </label>
            <input
              id="pt-lastdose"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={lastDoseTime}
              onChange={(event) => setLastDoseTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pt-doses">
              Doses taken in the last 24 hours
            </label>
            <input
              id="pt-doses"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={dosesTaken}
              onChange={(event) => setDosesTaken(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pt-mg">
              Milligrams in each dose
            </label>
            <input
              id="pt-mg"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="60"
              max="1000"
              step="10"
              value={mgPerDose}
              onChange={(event) => setMgPerDose(event.target.value)}
            />
          </div>
          {mode === "child" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="pt-interval-child">
                Gap between doses (hours)
              </label>
              <input
                id="pt-interval-child"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="4"
                max="8"
                step="1"
                value={intervalHours}
                onChange={(event) => setIntervalHours(event.target.value)}
              />
            </div>
          )}
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Next dose no earlier than
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || result.remainingDoses === 0
                ? DASH
                : formatClock12(result.nextDoseMinutes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the timing."
                : result.remainingDoses === 0
                  ? "No further doses fit in this 24-hour period."
                  : `${formatDuration(result.intervalMinutes)} after the last dose · ${result.remainingDoses} dose${result.remainingDoses === 1 ? "" : "s"} left today`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the paracetamol dosing summary"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={
              hasError
                ? "No total to show"
                : `${MG.format(result.takenMg)} of ${MG.format(result.dailyMaxMg)} milligrams used`
            }
          >
            <span
              className={`block h-full ${hasError || result.overLimit ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
              style={{ width: `${usedWidth}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {hasError
              ? DASH
              : `${MG.format(result.takenMg)} mg of the ${MG.format(result.dailyMaxMg)} mg 24-hour limit`}
          </p>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Taken in the last 24 hours", hasError ? DASH : `${MG.format(result.takenMg)} mg`],
            ["24-hour limit applied", hasError ? DASH : `${MG.format(result.dailyMaxMg)} mg`],
            ["Left in the allowance", hasError ? DASH : `${MG.format(result.remainingMg)} mg`],
            ["Doses still available", hasError ? DASH : String(result.remainingDoses)],
            ["Limited first by", hasError ? DASH : result.limitingFactor],
            [
              "Weight-based dose for this child",
              hasError || result.recommendedDoseMg === null
                ? DASH
                : `${MG.format(result.recommendedDoseMg)} mg`,
            ],
            [
              "Allowance resets around",
              hasError ? DASH : formatClock12(result.twentyFourHourResetMinutes),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.overLimit && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.warnings[0]}
          </p>
        )}
      </section>

      {!hasError && result.schedule.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Remaining doses today</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Dose
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    No earlier than
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Running total
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">#{row.index}</td>
                    <td className="py-2 pr-3">{formatClock12(row.at)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {MG.format(row.cumulativeMg)} mg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Before you take the next dose</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {/* The lead warning is already shown prominently in the alert box above
                when overLimit is true — do not repeat it here as a routine bullet. */}
            {(result.overLimit ? result.warnings.slice(1) : result.warnings).map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  •
                </span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only — this is arithmetic on the standard label limits, not medical advice or a
        prescription. The usual adult ceiling is {MG.format(ADULT_DAILY_MAX_MG)} mg in 24 hours and
        many labels use {MG.format(OTC_LABEL_DAILY_MAX_MG)} mg; lower limits apply with liver
        disease, low body weight, malnutrition or regular alcohol use. Follow the label and your
        doctor or pharmacist, and treat any suspected overdose as an emergency even without symptoms.
      </p>
    </main>
  );
}
