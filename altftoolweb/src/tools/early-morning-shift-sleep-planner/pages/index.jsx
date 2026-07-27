"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sunrise } from "lucide-react";

import {
  CAFFEINE_CUTOFF_BEFORE_BED_H,
  DEFAULT_SLEEP_LATENCY_MIN,
  DEFAULT_WIND_DOWN_MIN,
  formatDuration,
  planEarlyShift,
} from "../lib";

const DEFAULTS = {
  shiftStart: "04:00",
  commuteMin: "30",
  prepMin: "45",
  targetSleepH: "7",
  latency: String(DEFAULT_SLEEP_LATENCY_MIN),
  windDown: String(DEFAULT_WIND_DOWN_MIN),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  return Number(trimmed);
};

export default function ToolHome() {
  const [shiftStart, setShiftStart] = useState(DEFAULTS.shiftStart);
  const [commuteMin, setCommuteMin] = useState(DEFAULTS.commuteMin);
  const [prepMin, setPrepMin] = useState(DEFAULTS.prepMin);
  const [targetSleepH, setTargetSleepH] = useState(DEFAULTS.targetSleepH);
  const [latency, setLatency] = useState(DEFAULTS.latency);
  const [windDown, setWindDown] = useState(DEFAULTS.windDown);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planEarlyShift({
        shiftStart,
        commuteMin: toNumber(commuteMin),
        prepMin: toNumber(prepMin),
        targetSleepH: toNumber(targetSleepH),
        sleepLatencyMin: toNumber(latency),
        windDownMin: toNumber(windDown),
      }),
    [shiftStart, commuteMin, prepMin, targetSleepH, latency, windDown],
  );

  const ok = !plan.error;

  const timeline = [
    ["Caffeine cutoff", ok ? plan.caffeineCutoff.label : DASH, `Last coffee or tea, ${CAFFEINE_CUTOFF_BEFORE_BED_H} h before lights-out`],
    ["Last full meal", ok ? plan.lastMealBy.label : DASH, "Eat by this time so digestion is done"],
    ["Dim screens and lights", ok ? plan.screensDimBy.label : DASH, "Reduce bright light 90 minutes out"],
    ["Start wind-down", ok ? plan.windDownStart.label : DASH, ok ? formatDuration(plan.windDownMin) : DASH],
    ["Lights out", ok ? plan.bedtime.label : DASH, ok ? `${formatDuration(plan.timeInBedMin)} in bed` : DASH],
    ["Alarm", ok ? plan.wake.label : DASH, ok ? `${formatDuration(plan.alarmToDoorMin)} before the shift starts` : DASH],
    ["Shift starts", ok ? plan.shiftStart.label : DASH, "Target arrival"],
  ];

  const summary = ok
    ? [
        "Early Morning Shift Sleep Planner",
        `Shift starts: ${plan.shiftStart.label}`,
        `Alarm: ${plan.wake.label}`,
        `Lights out: ${plan.bedtime.label}`,
        `Wind-down starts: ${plan.windDownStart.label}`,
        `Caffeine cutoff: ${plan.caffeineCutoff.label}`,
        `Last full meal: ${plan.lastMealBy.label}`,
        `Dim screens: ${plan.screensDimBy.label}`,
        `Time in bed: ${formatDuration(plan.timeInBedMin)}`,
        plan.napMin > 0 ? `Suggested post-shift nap: ${formatDuration(plan.napMin)}` : "No nap needed on this plan",
      ].join("\n")
    : "";

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
    setShiftStart(DEFAULTS.shiftStart);
    setCommuteMin(DEFAULTS.commuteMin);
    setPrepMin(DEFAULTS.prepMin);
    setTargetSleepH(DEFAULTS.targetSleepH);
    setLatency(DEFAULTS.latency);
    setWindDown(DEFAULTS.windDown);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sunrise className="h-4 w-4" aria-hidden="true" />
          Shift sleep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Early Morning Shift Sleep Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Give it your shift start time and the planner counts backwards to the alarm, lights-out,
          wind-down, caffeine cutoff and last meal, so a 4am start does not cost you a night of sleep.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="shift-start">
              Shift start time
            </label>
            <input
              id="shift-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={shiftStart}
              onChange={(event) => setShiftStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shift-target-sleep">
              Sleep target (hours)
            </label>
            <input
              id="shift-target-sleep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="3"
              max="12"
              step="0.25"
              value={targetSleepH}
              onChange={(event) => setTargetSleepH(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shift-commute">
              Commute (minutes)
            </label>
            <input
              id="shift-commute"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="5"
              value={commuteMin}
              onChange={(event) => setCommuteMin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shift-prep">
              Getting ready after the alarm (minutes)
            </label>
            <input
              id="shift-prep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="5"
              value={prepMin}
              onChange={(event) => setPrepMin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shift-latency">
              Time you take to fall asleep (minutes)
            </label>
            <input
              id="shift-latency"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="shift-winddown">
              Wind-down routine (minutes)
            </label>
            <input
              id="shift-winddown"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="5"
              value={windDown}
              onChange={(event) => setWindDown(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["04:00", "04:30", "05:00", "05:30", "06:00"].map((value) => (
            <button key={value} type="button" onClick={() => setShiftStart(value)} className={CHIP_BTN}>
              {value} start
            </button>
          ))}
        </div>
      </section>

      {plan.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Lights out at
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? plan.bedtime.time : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${plan.bedtime.dayOffset < 0 ? "The evening before the shift" : "On the shift day"} · alarm at ${plan.wake.time}`
                : "Fix the inputs above to see a plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the shift sleep plan"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {timeline.map(([label, time, note]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt>
                <span className="block font-medium text-[var(--foreground)]">{label}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">{note}</span>
              </dt>
              <dd className="shrink-0 text-right font-semibold">{time}</dd>
            </div>
          ))}
        </dl>

        {ok && plan.napMin > 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            <span className="font-semibold">Nap suggestion:</span>{" "}
            <span className="text-[var(--muted-foreground)]">
              you are {formatDuration(plan.sleepDebtMin)} short of 7 hours. A {formatDuration(plan.napMin)} nap after
              the shift, finished well before the next wind-down, covers most of it.
            </span>
          </p>
        )}

        {ok && plan.warnings.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {plan.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Making an early bedtime stick</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>Get bright light in the first hour after waking — it anchors the body clock to the early start.</li>
          <li>Blackout the bedroom before you go to bed in daylight; even summer evening light delays melatonin.</li>
          <li>Keep the same wake time on days off, or shift it by no more than an hour, to avoid re-setting your clock every weekend.</li>
          <li>Do not push the bedtime earlier than about 19:00 — lying awake trains the brain to associate bed with being alert.</li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Persistent trouble sleeping on a shift pattern, loud snoring, or falling
        asleep while driving are reasons to speak to a doctor or occupational health rather than
        adjusting the schedule alone.
      </p>
    </main>
  );
}
