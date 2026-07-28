"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Moon, RotateCcw } from "lucide-react";
import { EFFICIENCY_TARGET, NAP_RULES, formatDuration, planSeniorSleep } from "../lib";

const DASH = "—";

const DEFAULTS = {
  wake: "06:30",
  age: "70",
  target: "7.5",
  latency: "20",
  nap: "20",
  avgSleep: "",
  timeInBed: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [wake, setWake] = useState(DEFAULTS.wake);
  const [age, setAge] = useState(DEFAULTS.age);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [latency, setLatency] = useState(DEFAULTS.latency);
  const [nap, setNap] = useState(DEFAULTS.nap);
  const [avgSleep, setAvgSleep] = useState(DEFAULTS.avgSleep);
  const [timeInBed, setTimeInBed] = useState(DEFAULTS.timeInBed);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planSeniorSleep({
        wakeTime: wake,
        ageYears: age === "" ? NaN : Number(age),
        targetSleepHours: target === "" ? NaN : Number(target),
        sleepLatencyMin: latency === "" ? NaN : Number(latency),
        napMinutes: nap === "" ? 0 : Number(nap),
        avgSleepHours: avgSleep === "" ? null : avgSleep,
        timeInBedHours: timeInBed === "" ? null : timeInBed,
      }),
    [wake, age, target, latency, nap, avgSleep, timeInBed],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Senior Sleep Routine Planner",
      `Fixed wake time: ${result.wake12}`,
      `Lights out: ${result.lightsOut12}`,
      `Time in bed: ${formatDuration(result.inBedMinutes)} (${formatDuration(result.targetMinutes)} asleep plus ${result.latencyMinutes} min to drop off)`,
      "",
      "Daily schedule:",
      ...result.schedule.map(
        (item) => `- ${item.time12}${item.until12 ? ` to ${item.until12}` : ""} — ${item.label}`,
      ),
      ...(result.napPlan
        ? [
            "",
            `Nap: up to ${result.napPlan.minutes} minutes, started no later than ${result.napPlan.latestStart12} and finished by ${result.napPlan.latestEnd12}.`,
          ]
        : []),
      ...(result.efficiency
        ? [
            "",
            `Sleep efficiency: ${result.efficiency.percent}% (target ${result.efficiency.target}%)`,
            `Awake in bed: ${formatDuration(result.efficiency.awakeInBedMinutes)} a night`,
            `Sleep-restriction time in bed: ${formatDuration(result.efficiency.prescribedTimeInBedMinutes)}, lights out ${result.efficiency.prescribedLightsOut12}`,
          ]
        : []),
      ...(result.notes.length > 0 ? ["", "Notes:", ...result.notes.map((note) => `- ${note}`)] : []),
      "",
      "Informational planner, not medical advice.",
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
    setWake(DEFAULTS.wake);
    setAge(DEFAULTS.age);
    setTarget(DEFAULTS.target);
    setLatency(DEFAULTS.latency);
    setNap(DEFAULTS.nap);
    setAvgSleep(DEFAULTS.avgSleep);
    setTimeInBed(DEFAULTS.timeInBed);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Moon className="h-4 w-4" aria-hidden="true" />
          Senior health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Senior Sleep Routine Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sleep gets lighter and the body clock shifts earlier with age. This planner works backwards
          from a fixed wake time to set lights out, the wind-down hour, the caffeine cut-off and a
          nap window that will not steal from the night.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ssr-wake">
              Wake-up time (fixed, seven days a week)
            </label>
            <input
              id="ssr-wake"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={wake}
              onChange={(event) => setWake(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssr-age">
              Age (years)
            </label>
            <input
              id="ssr-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="18"
              max="110"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssr-target">
              Nightly sleep target (hours)
            </label>
            <input
              id="ssr-target"
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
            <label className={LABEL_CLASS} htmlFor="ssr-latency">
              Usual minutes to fall asleep
            </label>
            <input
              id="ssr-latency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="180"
              step="5"
              value={latency}
              onChange={(event) => setLatency(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ssr-nap">
              Usual daytime nap (minutes, 0 if none)
            </label>
            <input
              id="ssr-nap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="5"
              value={nap}
              onChange={(event) => setNap(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5 rounded-lg border border-[var(--border)] p-4">
          <legend className="px-1 text-sm font-semibold">Sleep diary (optional)</legend>
          <p className="text-sm text-[var(--muted-foreground)]">
            Enter a week's averages to get a sleep efficiency figure and a sleep-restriction bedtime.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="ssr-avg-sleep">
                Average hours actually asleep
              </label>
              <input
                id="ssr-avg-sleep"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="24"
                step="0.25"
                placeholder="e.g. 5.5"
                value={avgSleep}
                onChange={(event) => setAvgSleep(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="ssr-tib">
                Average hours in bed
              </label>
              <input
                id="ssr-tib"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="24"
                step="0.25"
                placeholder="e.g. 8"
                value={timeInBed}
                onChange={(event) => setTimeInBed(event.target.value)}
              />
            </div>
          </div>
        </fieldset>
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
              Lights out
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.lightsOut12}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${formatDuration(result.inBedMinutes)} in bed for ${formatDuration(result.targetMinutes)} of sleep, waking at ${result.wake12}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the sleep routine"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy routine"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Recommended range for this age", hasError ? DASH : `${result.band.min}–${result.band.max} hours a night`],
            ["Time in bed", hasError ? DASH : formatDuration(result.inBedMinutes)],
            ["Expected asleep by", hasError ? DASH : result.schedule.find((item) => item.key === "asleep").time12],
            [
              "Nap window",
              hasError || !result.napPlan
                ? "No nap planned"
                : `${result.napPlan.minutes} min, start by ${result.napPlan.latestStart12}, end by ${result.napPlan.latestEnd12}`,
            ],
            [
              "Total sleep in 24 hours",
              hasError ? DASH : formatDuration(result.totalSleepWithNapMinutes),
            ],
            [
              "Sleep efficiency",
              hasError || !result.efficiency
                ? "Add the sleep diary figures"
                : `${result.efficiency.percent}% (target ${EFFICIENCY_TARGET}%)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your day, in order</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Time</th>
                  <th scope="col" className="py-2 font-semibold">What happens</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((item) => (
                  <tr key={item.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap font-semibold tabular-nums">
                      {item.time12}
                      {item.until12 ? ` – ${item.until12}` : ""}
                    </td>
                    <td className="py-2">
                      <span className="font-medium">{item.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">{item.why}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && result.efficiency && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Sleep efficiency and time in bed</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.efficiency.meetsTarget
              ? `At ${result.efficiency.percent}% you are at or above the ${EFFICIENCY_TARGET}% target, so the current time in bed is about right.`
              : `At ${result.efficiency.percent}% you are below the ${EFFICIENCY_TARGET}% target, spending about ${formatDuration(result.efficiency.awakeInBedMinutes)} awake in bed each night. Cognitive behavioural therapy for insomnia would shorten time in bed to build sleep pressure, then extend it again as efficiency improves.`}
          </p>
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Average sleep", formatDuration(result.efficiency.sleptMinutes)],
              ["Average time in bed", formatDuration(result.efficiency.inBedMinutes)],
              ["Awake in bed", formatDuration(result.efficiency.awakeInBedMinutes)],
              [
                "Sleep-restriction time in bed",
                `${formatDuration(result.efficiency.prescribedTimeInBedMinutes)} — lights out ${result.efficiency.prescribedLightsOut12}`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          {result.efficiency.floorApplied && (
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
              The calculated figure fell below the 5 hour 30 minute floor that sleep restriction never
              goes under, so that floor has been used. Sleep restriction causes daytime sleepiness in
              the first weeks and should be supervised, especially by anyone who drives.
            </p>
          )}
        </section>
      )}

      {!hasError && result.notes.length > 0 && (
        <section className="mt-6 space-y-2" aria-label="Planner notes">
          {result.notes.map((note) => (
            <p key={note} role="status" className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
              {note}
            </p>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planner, not medical advice. Naps are capped at {NAP_RULES.maxMinutes} minutes
        here because longer ones cause grogginess and reduce night-time sleep pressure. Loud snoring
        with pauses in breathing, acting out dreams, restless legs, or sleepiness severe enough to
        affect driving all need medical assessment rather than a better routine.
      </p>
    </main>
  );
}
