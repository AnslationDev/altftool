"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Smartphone } from "lucide-react";

import { buildDetoxPlan } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  days: "14",
  startMinutes: "30",
  dailyIncrease: "10",
  capMinutes: "90",
  blocksPerDay: "2",
};

export default function ToolHome() {
  const [days, setDays] = useState(DEFAULTS.days);
  const [startMinutes, setStartMinutes] = useState(DEFAULTS.startMinutes);
  const [dailyIncrease, setDailyIncrease] = useState(DEFAULTS.dailyIncrease);
  const [capMinutes, setCapMinutes] = useState(DEFAULTS.capMinutes);
  const [blocksPerDay, setBlocksPerDay] = useState(DEFAULTS.blocksPerDay);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildDetoxPlan({
        days: days.trim() === "" ? Number.NaN : days,
        startMinutes: startMinutes.trim() === "" ? Number.NaN : startMinutes,
        dailyIncreaseMinutes: dailyIncrease.trim() === "" ? Number.NaN : dailyIncrease,
        capMinutes: capMinutes.trim() === "" ? Number.NaN : capMinutes,
        blocksPerDay: blocksPerDay.trim() === "" ? Number.NaN : blocksPerDay,
      }),
    [days, startMinutes, dailyIncrease, capMinutes, blocksPerDay],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Digital detox study plan",
      `Length: ${days} days · ${blocksPerDay} phone-free block(s) per day`,
      `Blocks: start ${startMinutes} min, +${dailyIncrease} min/day, cap ${capMinutes} min`,
      result.capReachedDay !== null
        ? `Cap reached on day ${result.capReachedDay}`
        : "Cap not reached within the plan",
      `Final day: ${result.finalDayTotal} phone-free minutes`,
      `Total phone-free study: ${NUM.format(result.totalPhoneFreeHours)} hours`,
      "",
      "Day-by-day block length:",
      ...result.schedule.map(
        (d) => `  Day ${d.day}: ${d.blockMinutes} min × ${blocksPerDay} = ${d.dailyTotal} min`,
      ),
    ].join("\n");
  }, [hasError, result, days, blocksPerDay, startMinutes, dailyIncrease, capMinutes]);

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
    setDays(DEFAULTS.days);
    setStartMinutes(DEFAULTS.startMinutes);
    setDailyIncrease(DEFAULTS.dailyIncrease);
    setCapMinutes(DEFAULTS.capMinutes);
    setBlocksPerDay(DEFAULTS.blocksPerDay);
    setCopied(false);
  };

  const maxDailyTotal = hasError
    ? 0
    : Math.max(...result.schedule.map((d) => d.dailyTotal));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Smartphone className="h-4 w-4" aria-hidden="true" />
          Study habits
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Digital Detox Study Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build phone-free study blocks that start small and grow every day until they hit
          your cap — graded exposure instead of an unrealistic cold-turkey pledge.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ddx-days">
              Plan length (days)
            </label>
            <input
              id="ddx-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="3"
              max="60"
              step="1"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ddx-blocks">
              Phone-free blocks per day
            </label>
            <input
              id="ddx-blocks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={blocksPerDay}
              onChange={(event) => setBlocksPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ddx-start">
              Day-1 block length (minutes)
            </label>
            <input
              id="ddx-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="240"
              step="5"
              value={startMinutes}
              onChange={(event) => setStartMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ddx-increase">
              Daily increase (minutes)
            </label>
            <input
              id="ddx-increase"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="5"
              value={dailyIncrease}
              onChange={(event) => setDailyIncrease(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ddx-cap">
              Block length cap (minutes)
            </label>
            <input
              id="ddx-cap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="360"
              step="5"
              value={capMinutes}
              onChange={(event) => setCapMinutes(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Blocks stop growing once they reach the cap — pick the longest block you
              actually want to sustain.
            </p>
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total phone-free study
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.totalPhoneFreeHours)} h`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to build the plan."
                : result.capReachedDay !== null
                  ? `Blocks reach the ${capMinutes}-minute cap on day ${result.capReachedDay}; the final day holds ${result.finalDayTotal} phone-free minutes.`
                  : `Blocks grow through the whole plan and finish at ${result.finalBlockMinutes} minutes each.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the detox plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
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
          {[
            [
              "Day 1 total",
              hasError ? DASH : `${result.firstDayTotal} min phone-free`,
            ],
            [
              "Final day total",
              hasError ? DASH : `${result.finalDayTotal} min phone-free`,
            ],
            [
              "Growth from day 1 to final day",
              hasError ? DASH : `${NUM.format(result.growthFactor)}×`,
            ],
            [
              "Cap reached on",
              hasError
                ? DASH
                : result.capReachedDay !== null
                  ? `Day ${result.capReachedDay}`
                  : "Not within this plan",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <div className="mt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Day by day
            </h2>
            <div className="mt-3 space-y-2">
              {result.schedule.map((d) => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-xs font-semibold text-[var(--muted-foreground)]">
                    Day {d.day}
                  </span>
                  <div
                    className="h-5 flex-1 overflow-hidden rounded-full bg-[var(--muted)]"
                    role="img"
                    aria-label={`Day ${d.day}: ${d.dailyTotal} phone-free minutes`}
                  >
                    <div
                      className="h-full rounded-full bg-[var(--primary)]"
                      style={{
                        width: `${maxDailyTotal > 0 ? (d.dailyTotal / maxDailyTotal) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right text-xs font-semibold tabular-nums">
                    {d.blockMinutes} min × {blocksPerDay}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        During each block the phone goes in another room, not just face down. If a day fails,
        repeat its target the next day rather than escalating — the plan works because the
        target only ever grows on top of a success.
      </p>
    </main>
  );
}
