"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BedDouble, Check, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULT_TARGET_SLEEP_HOURS,
  MAX_SAFE_EXTRA_PER_NIGHT_HOURS,
  NIGHT_LABELS,
  RECOMMENDED_EXTRA_PER_NIGHT_HOURS,
  formatDuration,
  planSleepDebtPayback,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_NIGHTS = ["6", "6.5", "7", "6", "5.5", "7", "8"];
const DEFAULTS = {
  target: String(DEFAULT_TARGET_SLEEP_HOURS),
  extra: String(RECOMMENDED_EXTRA_PER_NIGHT_HOURS),
  days: "7",
  wake: "06:30",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const DASH = "—";

export default function ToolHome() {
  const [target, setTarget] = useState(DEFAULTS.target);
  const [extra, setExtra] = useState(DEFAULTS.extra);
  const [days, setDays] = useState(DEFAULTS.days);
  const [wake, setWake] = useState(DEFAULTS.wake);
  const [nights, setNights] = useState(DEFAULT_NIGHTS);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const result = useMemo(
    () =>
      planSleepDebtPayback({
        targetHours: toNumber(target),
        nights: nights.map(toNumber),
        extraPerNightHours: toNumber(extra),
        recoveryDays: toNumber(days),
        wakeTime: wake,
      }),
    [target, nights, extra, days, wake],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Sleep Debt Payback Plan",
      `Nights logged: ${result.nightsCounted} (average ${NUM.format(result.averageSleepHours)} h)`,
      `Sleep target: ${NUM.format(toNumber(target))} h per night`,
      `Total sleep debt: ${formatDuration(result.debtHours)}`,
      `Recovery nights: ${result.recoveryDays}`,
      `Extra sleep per night: ${formatDuration(result.perNightExtraHours)}`,
      `Bedtime on recovery nights: ${result.schedule[0]?.bedtime ?? DASH} (wake ${result.wakeTime})`,
      `Debt cleared in plan: ${formatDuration(result.clearedHours)}`,
      `Debt still outstanding: ${formatDuration(result.remainingDebtHours)}`,
    ].join("\n");
  }, [hasError, result, target]);

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
    setTarget(DEFAULTS.target);
    setExtra(DEFAULTS.extra);
    setDays(DEFAULTS.days);
    setWake(DEFAULTS.wake);
    setNights(DEFAULT_NIGHTS);
    setCopied(false);
  };

  const setNight = (index, value) => {
    setNights((current) => current.map((item, i) => (i === index ? value : item)));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BedDouble className="h-4 w-4" aria-hidden="true" />
          Sleep scheduling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sleep Debt Payback Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Total up the hours you missed this week, then spread the recovery over several nights of
          slightly earlier bedtimes instead of one long lie-in that moves your body clock.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your week</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {nights.map((value, index) => (
            <div key={NIGHT_LABELS[index]}>
              <label className={LABEL_CLASS} htmlFor={`sdp-night-${index}`}>
                {NIGHT_LABELS[index]} night (hours slept)
              </label>
              <input
                id={`sdp-night-${index}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="24"
                step="0.25"
                value={value}
                onChange={(event) => setNight(index, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Recovery settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sdp-target">
              Nightly sleep target (hours)
            </label>
            <input
              id="sdp-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="4"
              max="12"
              step="0.25"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdp-wake">
              Fixed wake-up time
            </label>
            <input
              id="sdp-wake"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={wake}
              onChange={(event) => setWake(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdp-extra">
              Extra sleep per recovery night (hours)
            </label>
            <input
              id="sdp-extra"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              max="2"
              step="0.25"
              value={extra}
              onChange={(event) => setExtra(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdp-days">
              Recovery nights available
            </label>
            <input
              id="sdp-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              step="1"
              value={days}
              onChange={(event) => setDays(event.target.value)}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total sleep debt
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatDuration(result.debtHours)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted input to see your plan."
                : `${result.shortfallNights} of ${result.nightsCounted} nights fell short of target`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy sleep debt payback plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
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
            ["Average sleep per night", hasError ? DASH : `${NUM.format(result.averageSleepHours)} h`],
            ["Surplus sleep logged", hasError ? DASH : formatDuration(result.surplusHours)],
            ["Extra sleep per recovery night", hasError ? DASH : formatDuration(result.perNightExtraHours)],
            ["Bedtime on recovery nights", hasError ? DASH : `${result.schedule[0]?.bedtime ?? DASH} (wake ${result.wakeTime})`],
            ["Normal bedtime at target", hasError ? DASH : `${result.baselineBedtime} (wake ${result.wakeTime})`],
            ["Debt cleared by this plan", hasError ? DASH : formatDuration(result.clearedHours)],
            ["Debt still outstanding", hasError ? DASH : formatDuration(result.remainingDebtHours)],
            [
              `Nights needed at ${formatDuration(MAX_SAFE_EXTRA_PER_NIGHT_HOURS)} a night`,
              hasError ? DASH : `${result.daysNeededAtCap}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.extraWasCapped && result.perNightExtraHours === result.cappedExtraHours && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Extra sleep was capped at {formatDuration(MAX_SAFE_EXTRA_PER_NIGHT_HOURS)} per night. Shifting
            your sleep window by more than that behaves like jet lag and usually costs you the next morning.
          </p>
        )}
        {!hasError && !result.fullyCleared && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {formatDuration(result.remainingDebtHours)} is still outstanding after {result.recoveryDays}{" "}
            nights. Add more recovery nights, or protect the target on ordinary nights so the debt stops growing.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
          <h2 className="text-base font-semibold">Night-by-night payback</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Night</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Asleep by</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Sleep</th>
                  <th scope="col" className="py-2 text-right font-semibold">Debt left</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.day} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.day}</td>
                    <td className="py-2 pr-3">{row.bedtime}</td>
                    <td className="py-2 pr-3 text-right">{formatDuration(row.nightSleepHours)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {formatDuration(row.remainingDebtHours)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Persistent daytime sleepiness, loud snoring or unrefreshing sleep despite
        enough hours in bed are worth discussing with a doctor rather than treating as debt.
      </p>
    </main>
  );
}
