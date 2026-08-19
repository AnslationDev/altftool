"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, RotateCcw, TimerReset } from "lucide-react";

import { PERIOD_PRESETS, computeReliability } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });
const RATE = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 4 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  periodHours: "720",
  failures: "3",
  totalRepairHours: "6",
};

const DASH = "—";

export default function ToolHome() {
  const [periodHours, setPeriodHours] = useState(DEFAULTS.periodHours);
  const [failures, setFailures] = useState(DEFAULTS.failures);
  const [totalRepairHours, setTotalRepairHours] = useState(DEFAULTS.totalRepairHours);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const result = useMemo(
    () => computeReliability({ periodHours, failures, totalRepairHours }),
    [periodHours, failures, totalRepairHours],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "MTTR / MTBF result",
      `Observation window: ${NUM.format(result.periodHours)} h`,
      `Failures: ${result.failures}`,
      `Total downtime: ${NUM.format(result.downtimeHours)} h`,
      `MTBF: ${result.mtbfHours === null ? "n/a (no failures)" : `${NUM.format(result.mtbfHours)} h`}`,
      `MTTR: ${result.mttrHours === null ? "n/a (no failures)" : `${NUM.format(result.mttrHours)} h`}`,
      `Failure rate: ${result.failureRatePerHour === null ? "n/a (no failures)" : `${RATE.format(result.failureRatePerHour)} per hour`}`,
      `Availability: ${PCT.format(result.availabilityPercent)}%`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPeriodHours(DEFAULTS.periodHours);
    setFailures(DEFAULTS.failures);
    setTotalRepairHours(DEFAULTS.totalRepairHours);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["MTBF (mean time between failures)", DASH],
        ["MTTR (mean time to repair)", DASH],
        ["Failure rate λ", DASH],
        ["Uptime in window", DASH],
        ["Downtime in window", DASH],
      ]
    : [
        [
          "MTBF (mean time between failures)",
          result.mtbfHours === null ? "n/a — no failures" : `${NUM.format(result.mtbfHours)} h`,
        ],
        [
          "MTTR (mean time to repair)",
          result.mttrHours === null ? "n/a — no failures" : `${NUM.format(result.mttrHours)} h`,
        ],
        [
          "Failure rate λ",
          result.failureRatePerHour === null ? "n/a — no failures" : `${RATE.format(result.failureRatePerHour)} / hour`,
        ],
        ["Uptime in window", `${NUM.format(result.uptimeHours)} h`],
        ["Downtime in window", `${NUM.format(result.downtimeHours)} h`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TimerReset className="h-4 w-4" aria-hidden="true" />
          Reliability
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          MTTR and MTBF Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter an observation window, the number of failures and total repair time to get MTBF,
          MTTR, the failure rate and the availability they imply — MTBF ÷ (MTBF + MTTR).
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rel-period">
              Observation window (hours)
            </label>
            <input
              id="rel-period"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={periodHours}
              onChange={(event) => setPeriodHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rel-failures">
              Number of failures in the window
            </label>
            <input
              id="rel-failures"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={failures}
              onChange={(event) => setFailures(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rel-repair">
              Total repair / down time across all failures (hours)
            </label>
            <input
              id="rel-repair"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={totalRepairHours}
              onChange={(event) => setTotalRepairHours(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Time from failure detection to restored service, summed over every incident in the
              window.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {PERIOD_PRESETS.map((preset) => (
            <button
              key={preset.hours}
              type="button"
              onClick={() => setPeriodHours(preset.hours)}
              className={CHIP_BTN}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Availability
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${PCT.format(result.availabilityPercent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.noFailures || result.fullyDown
                  ? result.note
                  : `MTBF ÷ (MTBF + MTTR) — about ${NUM.format(result.nines)} nines of availability.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the MTTR and MTBF results"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The formulas</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Metric
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Formula
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["MTBF", "uptime in window ÷ number of failures"],
                ["MTTR", "total repair time ÷ number of failures"],
                ["Failure rate λ", "1 ÷ MTBF"],
                ["Availability", "MTBF ÷ (MTBF + MTTR) = uptime ÷ window"],
              ].map(([metric, formula]) => (
                <tr key={metric} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{metric}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{formula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        MTBF is used here in the repairable-system sense (up time between failures). Some teams
        track MTTF for non-repairable parts and MTTA for time-to-acknowledge separately; a small
        number of observed failures makes any mean a rough estimate.
      </p>
    </main>
  );
}
