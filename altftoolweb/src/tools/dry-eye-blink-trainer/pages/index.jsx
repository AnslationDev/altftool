"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Droplet, Pause, Play, RotateCcw } from "lucide-react";

import { DRILL_STEPS, computeBlinkPlan } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  blinks: "6",
  seconds: "60",
  screenHours: "8",
  interval: "20",
  drillBlinks: "20",
  pacedRate: "15",
  pacedMinutes: "1",
};

const toNumber = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [blinks, setBlinks] = useState(DEFAULTS.blinks);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [screenHours, setScreenHours] = useState(DEFAULTS.screenHours);
  const [drillInterval, setDrillInterval] = useState(DEFAULTS.interval);
  const [drillBlinks, setDrillBlinks] = useState(DEFAULTS.drillBlinks);
  const [pacedRate, setPacedRate] = useState(DEFAULTS.pacedRate);
  const [pacedMinutes, setPacedMinutes] = useState(DEFAULTS.pacedMinutes);
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);

  const plan = useMemo(
    () =>
      computeBlinkPlan({
        blinksCounted: toNumber(blinks),
        countSeconds: toNumber(seconds),
        screenHoursPerDay: toNumber(screenHours),
        drillIntervalMinutes: toNumber(drillInterval),
        drillBlinks: toNumber(drillBlinks),
        pacedRate: toNumber(pacedRate),
        pacedMinutes: toNumber(pacedMinutes),
      }),
    [blinks, seconds, screenHours, drillInterval, drillBlinks, pacedRate, pacedMinutes],
  );

  const hasError = Boolean(plan.error);
  const pacedIntervalMs = hasError ? 4000 : Math.max(400, plan.pacedIntervalSeconds * 1000);
  const totalPaced = hasError ? 0 : plan.pacedTotalBlinks;

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => {
      setTick((current) => current + 1);
    }, pacedIntervalMs);
    return () => window.clearInterval(id);
  }, [running, pacedIntervalMs]);

  useEffect(() => {
    if (running && totalPaced > 0 && tick >= totalPaced) setRunning(false);
  }, [running, tick, totalPaced]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Dry Eye Blink Trainer",
      `Measured blink rate: ${plan.blinksPerMinute} blinks/min (${plan.bandLabel})`,
      `Resting reference: ${plan.restingRange} blinks/min`,
      `Share of resting rate: ${plan.percentOfResting}%`,
      plan.interblinkSeconds !== null
        ? `Average gap between blinks: ${plan.interblinkSeconds} s`
        : "Average gap between blinks: no blinks counted",
      `Shortfall on screen: ${plan.missedBlinksPerHour} blinks/hour, ${plan.missedBlinksPerDay} a day`,
      `Drill plan: ${plan.drillsPerDay} drills of ${plan.drillBlinks} complete blinks (${plan.drillMinutesPerDay} min a day)`,
      `Shortfall replaced by the drill: ${plan.recoveredPercent}%`,
    ].join("\n");
  }, [plan, hasError]);

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
    setBlinks(DEFAULTS.blinks);
    setSeconds(DEFAULTS.seconds);
    setScreenHours(DEFAULTS.screenHours);
    setDrillInterval(DEFAULTS.interval);
    setDrillBlinks(DEFAULTS.drillBlinks);
    setPacedRate(DEFAULTS.pacedRate);
    setPacedMinutes(DEFAULTS.pacedMinutes);
    setRunning(false);
    setTick(0);
    setCopied(false);
  };

  const fields = [
    { id: "blink-count", label: "Blinks you counted", value: blinks, set: setBlinks, min: 0, step: 1 },
    { id: "blink-window", label: "Counting window (seconds)", value: seconds, set: setSeconds, min: 1, step: 5 },
    { id: "blink-screen", label: "Screen hours per day", value: screenHours, set: setScreenHours, min: 0, step: 0.5 },
    {
      id: "blink-interval",
      label: "Run the drill every (minutes)",
      value: drillInterval,
      set: setDrillInterval,
      min: 1,
      step: 5,
    },
    { id: "blink-drill", label: "Complete blinks per drill", value: drillBlinks, set: setDrillBlinks, min: 1, step: 1 },
    { id: "blink-pace", label: "Metronome pace (blinks/min)", value: pacedRate, set: setPacedRate, min: 1, step: 1 },
    {
      id: "blink-paced-min",
      label: "Paced session length (minutes)",
      value: pacedMinutes,
      set: setPacedMinutes,
      min: 1,
      step: 1,
    },
  ];

  const rows = hasError
    ? [
        ["Resting reference", DASH],
        ["Share of the resting rate", DASH],
        ["Average gap between blinks", DASH],
        ["Blinks missed per screen hour", DASH],
        ["Blinks missed per screen day", DASH],
        ["Drills per day", DASH],
        ["Deliberate blinks added per day", DASH],
        ["Time the drill costs per day", DASH],
        ["Shortfall replaced by the drill", DASH],
      ]
    : [
        ["Resting reference", `${plan.restingRange} blinks/min`],
        ["Share of the resting rate", `${NUM.format(plan.percentOfResting)}%`],
        [
          "Average gap between blinks",
          plan.interblinkSeconds !== null ? `${NUM.format(plan.interblinkSeconds)} s` : "No blinks counted",
        ],
        ["Blinks missed per screen hour", INT.format(plan.missedBlinksPerHour)],
        ["Blinks missed per screen day", INT.format(plan.missedBlinksPerDay)],
        ["Drills per day", INT.format(plan.drillsPerDay)],
        ["Deliberate blinks added per day", INT.format(plan.drillBlinksPerDay)],
        ["Time the drill costs per day", `${NUM.format(plan.drillMinutesPerDay)} min`],
        ["Shortfall replaced by the drill", `${NUM.format(plan.recoveredPercent)}%`],
      ];

  const phaseOpen = tick % 2 === 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplet className="h-4 w-4" aria-hidden="true" />
          Eye care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Dry Eye Blink Trainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count your blinks for a minute while you read, compare the result with the 15-20 blinks a
          minute seen at rest, and follow a paced complete-blink drill to close the gap.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your blink rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(plan.blinksPerMinute)}/min`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see your result." : plan.bandLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the blink rate result"
              className={GHOST_BTN}
              disabled={hasError}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-5 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {plan.bandAdvice}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Paced blink metronome</h2>
          <button
            type="button"
            onClick={() => {
              if (running) {
                setRunning(false);
              } else {
                setTick(0);
                setRunning(true);
              }
            }}
            aria-label={running ? "Pause the paced blink metronome" : "Start the paced blink metronome"}
            className={PRIMARY_BTN}
            disabled={hasError}
          >
            {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {running ? "Pause" : "Start"}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <span
            aria-hidden="true"
            className={`h-14 w-14 shrink-0 rounded-full border-2 border-[var(--primary)] transition-transform duration-300 motion-reduce:transition-none ${
              running && !phaseOpen ? "scale-50 bg-[var(--primary)]" : "scale-100 bg-[var(--background)]"
            }`}
          />
          <div aria-live="polite" className="text-sm">
            <p className="text-lg font-semibold">
              {running ? (phaseOpen ? "Open and relax" : "Close and squeeze") : "Ready"}
            </p>
            <p className="text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to start."
                : `${tick} of ${plan.pacedTotalBlinks} paced blinks · one every ${NUM.format(plan.pacedIntervalSeconds)} s`}
            </p>
          </div>
        </div>

        <ol className="mt-5 space-y-3 text-sm leading-6">
          {DRILL_STEPS.map(([title, detail], index) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold text-[var(--primary)]">
                {index + 1}
              </span>
              <span>
                <span className="font-semibold">{title}. </span>
                <span className="text-[var(--muted-foreground)]">{detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Blink training helps the evaporative side of dry eye but does not treat
        every cause — see an optometrist or ophthalmologist for persistent burning, grittiness,
        watering, light sensitivity or vision that fluctuates through the day.
      </p>
    </main>
  );
}
