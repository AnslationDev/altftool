"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScanLine } from "lucide-react";
import { REDATING_THRESHOLDS, compareDueDates, formatWeeksDays } from "../lib";

const DEFAULTS = {
  lmpDate: "2026-01-01",
  cycleLength: "28",
  scanDate: "2026-02-26",
  scanWeeks: "8",
  scanDays: "5",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export default function ToolHome() {
  const [lmpDate, setLmpDate] = useState(DEFAULTS.lmpDate);
  const [cycleLength, setCycleLength] = useState(DEFAULTS.cycleLength);
  const [scanDate, setScanDate] = useState(DEFAULTS.scanDate);
  const [scanWeeks, setScanWeeks] = useState(DEFAULTS.scanWeeks);
  const [scanDays, setScanDays] = useState(DEFAULTS.scanDays);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => compareDueDates({ lmpDate, cycleLength, scanDate, scanWeeks, scanDays }),
    [lmpDate, cycleLength, scanDate, scanWeeks, scanDays],
  );

  const hasError = Boolean(result.error);

  const summary = (() => {
    if (hasError) return "";
    return [
      "Ultrasound vs LMP Due Date Comparator",
      `LMP due date: ${SHORT_DATE.format(result.lmpEdd)} (cycle ${result.cycleLength} days)`,
      `Ultrasound due date: ${SHORT_DATE.format(result.scanEdd)}`,
      `Difference: ${result.magnitude} days`,
      `Gestational age at the scan — by LMP ${formatWeeksDays(result.gaByLmpAtScan)}, by scan ${formatWeeksDays(result.gaByScan)}`,
      `ACOG threshold at that age: more than ${result.threshold.days} days (${result.threshold.label})`,
      `Suggested dating: ${SHORT_DATE.format(result.recommendedEdd)} by ${result.recommendedSource}`,
    ].join("\n");
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
    setLmpDate(DEFAULTS.lmpDate);
    setCycleLength(DEFAULTS.cycleLength);
    setScanDate(DEFAULTS.scanDate);
    setScanWeeks(DEFAULTS.scanWeeks);
    setScanDays(DEFAULTS.scanDays);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ScanLine className="h-4 w-4" aria-hidden="true" />
          Pregnancy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Ultrasound vs LMP Due Date Comparator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two due dates rarely match exactly. This puts the period-based date and the scan-based date
          side by side, measures the gap in days, and checks it against the ACOG threshold for the
          gestational age at which the scan was done.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dd-lmp">
              First day of the last period
            </label>
            <input
              id="dd-lmp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lmpDate}
              onChange={(event) => setLmpDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dd-cycle">
              Usual cycle length (days)
            </label>
            <input
              id="dd-cycle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="20"
              max="45"
              step="1"
              value={cycleLength}
              onChange={(event) => setCycleLength(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dd-scandate">
              Date of the ultrasound
            </label>
            <input
              id="dd-scandate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={scanDate}
              onChange={(event) => setScanDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dd-scanweeks">
              Gestational age on the scan — weeks
            </label>
            <input
              id="dd-scanweeks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="4"
              max="42"
              step="1"
              value={scanWeeks}
              onChange={(event) => setScanWeeks(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dd-scandays">
              Gestational age on the scan — days
            </label>
            <input
              id="dd-scandays"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="6"
              step="1"
              value={scanDays}
              onChange={(event) => setScanDays(event.target.value)}
            />
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Gap between the two dates
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.magnitude} days`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to compare the two dates."
                : result.shouldRedate
                  ? `Beyond the ${result.threshold.days}-day threshold for ${result.threshold.label} — the scan date is usually adopted.`
                  : `Within the ${result.threshold.days}-day threshold for ${result.threshold.label} — the period-based date is usually kept.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the due date comparison"
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

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] p-4">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Due date from the last period
            </p>
            <p className="mt-1 text-lg font-semibold">
              {hasError ? DASH : LONG_DATE.format(result.lmpEdd)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-4">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Due date from the scan
            </p>
            <p className="mt-1 text-lg font-semibold">
              {hasError ? DASH : LONG_DATE.format(result.scanEdd)}
            </p>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Gestational age at the scan, by the last period",
              hasError ? DASH : formatWeeksDays(result.gaByLmpAtScan),
            ],
            [
              "Gestational age at the scan, by the scan",
              hasError ? DASH : formatWeeksDays(result.gaByScan),
            ],
            [
              "The scan makes the pregnancy",
              hasError
                ? DASH
                : result.ageDifferenceDays === 0
                  ? "exactly the same age"
                  : `${result.ageDifferenceMagnitude} days ${result.scanIsAhead ? "further along" : "less far along"}`,
            ],
            [
              "Cycle-length adjustment applied",
              hasError
                ? DASH
                : result.cycleShift === 0
                  ? "None (28-day cycle)"
                  : `${result.cycleShift > 0 ? "+" : "−"}${result.cycleShiftMagnitude} days`,
            ],
            [
              "ACOG redating threshold here",
              hasError ? DASH : `More than ${result.threshold.days} days (${result.threshold.label})`,
            ],
            [
              "Dating usually adopted",
              hasError
                ? DASH
                : `${SHORT_DATE.format(result.recommendedEdd)} — ${result.recommendedSource}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">When a scan replaces the period date</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Gestational age at the scan
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Redate if the gap exceeds
                </th>
              </tr>
            </thead>
            <tbody>
              {REDATING_THRESHOLDS.map((band) => (
                <tr key={band.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{band.label}</td>
                  <td className="py-2 text-right">{band.days} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Dating decisions belong to your obstetrician or midwife, who also weigh
        the quality of the scan, the measurement used, whether the pregnancy was conceived with
        assisted reproduction, and how certain the period date is.
      </p>
    </main>
  );
}
