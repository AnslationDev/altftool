"use client";

import { useMemo, useState } from "react";
import { Activity, Check, Copy, RotateCcw } from "lucide-react";

import {
  PERIODS,
  UPTIME_PRESETS,
  computeDowntimeBudget,
  computeUptimeFromDowntime,
  formatDuration,
} from "../lib";

const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 5 });

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
  uptime: "99.9",
  downtimeMinutes: "45",
  periodId: "month",
};

const DASH = "—";

export default function ToolHome() {
  const [uptime, setUptime] = useState(DEFAULTS.uptime);
  const [downtimeMinutes, setDowntimeMinutes] = useState(DEFAULTS.downtimeMinutes);
  const [periodId, setPeriodId] = useState(DEFAULTS.periodId);
  const [copied, setCopied] = useState(false);

  const budget = useMemo(() => computeDowntimeBudget({ uptimePercent: uptime }), [uptime]);
  const inverse = useMemo(
    () => computeUptimeFromDowntime({ downtimeMinutes, periodId }),
    [downtimeMinutes, periodId],
  );

  const hasError = Boolean(budget.error);
  const inverseError = Boolean(inverse.error);

  const monthly = hasError ? null : budget.periods.find((p) => p.id === "month");

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `SLA downtime budget for ${PCT.format(budget.uptimePercent)}% uptime`,
      ...budget.periods.map((p) => `${p.label}: ${p.formatted}`),
    ].join("\n");
  }, [hasError, budget]);

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
    setUptime(DEFAULTS.uptime);
    setDowntimeMinutes(DEFAULTS.downtimeMinutes);
    setPeriodId(DEFAULTS.periodId);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Reliability
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          SLA Uptime Downtime Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn an availability target like 99.9% into the downtime it actually allows per day,
          week, month, quarter and year — or work backwards from real downtime to the uptime you
          achieved.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="sla-uptime">
          Uptime target (%)
        </label>
        <input
          id="sla-uptime"
          className={`mt-2 ${INPUT_CLASS}`}
          type="number"
          inputMode="decimal"
          min="0"
          max="100"
          step="0.001"
          value={uptime}
          onChange={(event) => setUptime(event.target.value)}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {UPTIME_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setUptime(preset.value)}
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
          {budget.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Allowed downtime per month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || !monthly ? DASH : monthly.formatted}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `At ${PCT.format(budget.uptimePercent)}% uptime, this is your total error budget in an average month (30.44 days).`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the downtime budget for all periods"
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
          {(hasError ? PERIODS.map((p) => ({ ...p, formatted: DASH })) : budget.periods).map(
            (period) => (
              <div key={period.id} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{period.label}</dt>
                <dd className="text-right font-semibold">{period.formatted}</dd>
              </div>
            ),
          )}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Reverse: downtime → uptime achieved</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sla-downtime">
              Actual downtime (minutes)
            </label>
            <input
              id="sla-downtime"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={downtimeMinutes}
              onChange={(event) => setDowntimeMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sla-period">
              Over which period
            </label>
            <select
              id="sla-period"
              className={`mt-2 ${INPUT_CLASS}`}
              value={periodId}
              onChange={(event) => setPeriodId(event.target.value)}
            >
              {PERIODS.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.label.replace("Per ", "One ")}
                </option>
              ))}
            </select>
          </div>
        </div>
        {inverseError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {inverse.error}
          </p>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            {formatDuration(inverse.downtimeSeconds).text} of downtime {inverse.periodLabel.toLowerCase()}{" "}
            means an uptime of{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {PCT.format(inverse.uptimePercent)}%
            </span>
            .
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Periods use the Gregorian average year of 365.2425 days, so a month is 30.436875 days.
        Contractual SLAs may define the measurement window differently — always check the
        agreement's own definition of the service period and any exclusions.
      </p>
    </main>
  );
}
