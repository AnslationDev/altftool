"use client";

import { useMemo, useState } from "react";
import { BedDouble, Check, Copy, RotateCcw } from "lucide-react";
import {
  EFFICIENCY_EXCELLENT,
  EFFICIENCY_HEALTHY,
  computeSleepEfficiency,
  formatClock12,
  formatDuration,
} from "../lib";

const DEFAULTS = {
  bedTime: "23:00",
  riseTime: "07:00",
  onsetMinutes: "20",
  wasoMinutes: "35",
  earlyWakeMinutes: "10",
  awakenings: "2",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

export default function ToolHome() {
  const [bedTime, setBedTime] = useState(DEFAULTS.bedTime);
  const [riseTime, setRiseTime] = useState(DEFAULTS.riseTime);
  const [onsetMinutes, setOnsetMinutes] = useState(DEFAULTS.onsetMinutes);
  const [wasoMinutes, setWasoMinutes] = useState(DEFAULTS.wasoMinutes);
  const [earlyWakeMinutes, setEarlyWakeMinutes] = useState(DEFAULTS.earlyWakeMinutes);
  const [awakenings, setAwakenings] = useState(DEFAULTS.awakenings);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSleepEfficiency({
        bedTime,
        riseTime,
        onsetMinutes,
        wasoMinutes,
        earlyWakeMinutes,
        awakenings,
      }),
    [bedTime, riseTime, onsetMinutes, wasoMinutes, earlyWakeMinutes, awakenings],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Sleep Efficiency Calculator",
      `In bed ${formatClock12(result.bed)} to ${formatClock12(result.rise)}`,
      `Time in bed: ${formatDuration(result.tib)}`,
      `Total sleep time: ${formatDuration(result.tst)}`,
      `Time awake in bed: ${formatDuration(result.awake)}`,
      `Sleep efficiency: ${PCT.format(result.efficiency)}%`,
      `Rating: ${result.rating.label}`,
      `Suggested time-in-bed window: ${formatDuration(result.prescribedWindow)}`,
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
    setBedTime(DEFAULTS.bedTime);
    setRiseTime(DEFAULTS.riseTime);
    setOnsetMinutes(DEFAULTS.onsetMinutes);
    setWasoMinutes(DEFAULTS.wasoMinutes);
    setEarlyWakeMinutes(DEFAULTS.earlyWakeMinutes);
    setAwakenings(DEFAULTS.awakenings);
    setCopied(false);
  };

  const barWidth = hasError ? 0 : Math.max(0, Math.min(100, result.efficiency));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <BedDouble className="h-4 w-4" aria-hidden="true" />
          Sleep diary
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Sleep Efficiency Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter one night from your sleep diary. This works out time in bed, total sleep time and
          sleep efficiency using the standard consensus sleep-diary definitions, and shows the
          time-in-bed window sleep restriction therapy would aim for.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="se-bed">
              Got into bed at
            </label>
            <input
              id="se-bed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={bedTime}
              onChange={(event) => setBedTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="se-rise">
              Got out of bed at
            </label>
            <input
              id="se-rise"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={riseTime}
              onChange={(event) => setRiseTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="se-onset">
              Minutes to fall asleep
            </label>
            <input
              id="se-onset"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={onsetMinutes}
              onChange={(event) => setOnsetMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="se-waso">
              Minutes awake during the night
            </label>
            <input
              id="se-waso"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={wasoMinutes}
              onChange={(event) => setWasoMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="se-early">
              Minutes awake in bed before getting up
            </label>
            <input
              id="se-early"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={earlyWakeMinutes}
              onChange={(event) => setEarlyWakeMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="se-awakenings">
              Number of awakenings
            </label>
            <input
              id="se-awakenings"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={awakenings}
              onChange={(event) => setAwakenings(event.target.value)}
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
              Sleep efficiency
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${PCT.format(result.efficiency)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the entries above to see the result." : result.rating.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy sleep efficiency result"
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
                ? "No sleep efficiency to show"
                : `Sleep efficiency ${PCT.format(result.efficiency)} percent`
            }
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {EFFICIENCY_HEALTHY}% is the usual healthy benchmark; {EFFICIENCY_EXCELLENT}% and above
            is treated as well consolidated sleep.
          </p>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Time in bed", hasError ? DASH : formatDuration(result.tib)],
            ["Total sleep time", hasError ? DASH : formatDuration(result.tst)],
            ["Total time awake in bed", hasError ? DASH : formatDuration(result.awake)],
            [
              "Awake as a share of time in bed",
              hasError ? DASH : `${PCT.format(result.awakeShare)}%`,
            ],
            ["Time to fall asleep", hasError ? DASH : formatDuration(result.onsetMinutes)],
            [
              "Awake after sleep onset",
              hasError ? DASH : formatDuration(result.wasoMinutes + result.earlyWakeMinutes),
            ],
            ["Awakenings recorded", hasError ? DASH : String(result.awakenings)],
            [
              "Suggested time-in-bed window",
              hasError ? DASH : formatDuration(result.prescribedWindow),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What the numbers suggest</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{result.titration}</p>
          {result.flags.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              {result.flags.map((flag) => (
                <li key={flag} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">
                    •
                  </span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Compared with last night&apos;s window, that is a change of{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {result.windowChange === 0
                ? "no change"
                : `${result.windowChange > 0 ? "+" : "−"}${formatDuration(Math.abs(result.windowChange))}`}
            </span>
            .
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Sleep efficiency from a single night varies a lot — clinicians average at
        least a week of diary entries before changing anything, and sleep restriction is normally run
        under professional supervision. Speak to a doctor about persistent insomnia, loud snoring or
        daytime sleepiness.
      </p>
    </main>
  );
}
