"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

import {
  CAFFEINE_CUTOFF_BEFORE_SLEEP_H,
  DEFAULT_SLEEP_LATENCY_MIN,
  formatDuration,
  planGuardSleep,
} from "../lib";

const DEFAULTS = {
  shiftStart: "22:00",
  shiftEnd: "06:00",
  commuteHomeMin: "30",
  commuteToWorkMin: "30",
  prepMin: "45",
  targetSleepH: "7",
  anchorSleepH: "4",
  latency: String(DEFAULT_SLEEP_LATENCY_MIN),
  strategy: "immediate",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const STRATEGIES = [
  ["immediate", "Straight after"],
  ["delayed", "Delayed"],
  ["split", "Split"],
];

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  return Number(trimmed);
};

export default function ToolHome() {
  const [shiftStart, setShiftStart] = useState(DEFAULTS.shiftStart);
  const [shiftEnd, setShiftEnd] = useState(DEFAULTS.shiftEnd);
  const [commuteHomeMin, setCommuteHomeMin] = useState(DEFAULTS.commuteHomeMin);
  const [commuteToWorkMin, setCommuteToWorkMin] = useState(DEFAULTS.commuteToWorkMin);
  const [prepMin, setPrepMin] = useState(DEFAULTS.prepMin);
  const [targetSleepH, setTargetSleepH] = useState(DEFAULTS.targetSleepH);
  const [anchorSleepH, setAnchorSleepH] = useState(DEFAULTS.anchorSleepH);
  const [latency, setLatency] = useState(DEFAULTS.latency);
  const [strategy, setStrategy] = useState(DEFAULTS.strategy);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planGuardSleep({
        shiftStart,
        shiftEnd,
        commuteHomeMin: toNumber(commuteHomeMin),
        commuteToWorkMin: toNumber(commuteToWorkMin),
        prepMin: toNumber(prepMin),
        targetSleepH: toNumber(targetSleepH),
        anchorSleepH: toNumber(anchorSleepH),
        sleepLatencyMin: toNumber(latency),
      }),
    [shiftStart, shiftEnd, commuteHomeMin, commuteToWorkMin, prepMin, targetSleepH, anchorSleepH, latency],
  );

  const ok = !plan.error;
  const chosen = ok ? plan.options[strategy] : null;

  const rows = [
    ["Shift length", ok ? formatDuration(plan.shiftLengthMin) : DASH, ""],
    ["Home by", ok ? plan.homeAt.time : DASH, "Shift end plus the journey home"],
    ["Earliest lights-out", ok ? plan.earliestSleep.time : DASH, "After a short wind-down at home"],
    ["Must be up by", ok ? plan.mustBeUpBy.time : DASH, "Leaves an hour before travel and getting ready"],
    ["Usable sleep window", ok ? formatDuration(plan.availableWindowMin) : DASH, "Total space between the two"],
    ["Time in bed this plan needs", ok ? formatDuration(plan.totalInBedMin) : DASH, "Sleep target plus falling-asleep time"],
    [
      "Last caffeine",
      ok ? chosen.caffeineCutoff.time : DASH,
      `${CAFFEINE_CUTOFF_BEFORE_SLEEP_H} hours before you plan to be asleep`,
    ],
    [
      "Dark glasses on",
      ok ? `${chosen.sunglassesFrom.time} → ${chosen.sunglassesUntil.time}` : DASH,
      "Morning light is what ruins day sleep",
    ],
    ["Awake before the next shift", ok ? formatDuration(chosen.awakeBeforeShiftMin) : DASH, ""],
    ["Sleep this plan delivers", ok ? formatDuration(chosen.totalSleepMin) : DASH, ""],
  ];

  const summary = ok
    ? [
        "Security Guard Night Sleep Planner",
        `Shift: ${plan.shiftStart.time}–${plan.shiftEnd.time} (${formatDuration(plan.shiftLengthMin)})`,
        `Plan: ${chosen.label}`,
        ...chosen.segments.map((s) => `${s.label}: ${s.start.time}–${s.end.time} (${formatDuration(s.sleepMin)} asleep)`),
        `Last caffeine: ${chosen.caffeineCutoff.time}`,
        `Dark glasses: ${chosen.sunglassesFrom.time} to ${chosen.sunglassesUntil.time}`,
        `Total sleep: ${formatDuration(chosen.totalSleepMin)}`,
        `Bedroom: under ${plan.environment.lightLux} lux, under ${plan.environment.noiseDbA} dB(A), ${plan.environment.tempMinC}–${plan.environment.tempMaxC} °C`,
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
    setShiftEnd(DEFAULTS.shiftEnd);
    setCommuteHomeMin(DEFAULTS.commuteHomeMin);
    setCommuteToWorkMin(DEFAULTS.commuteToWorkMin);
    setPrepMin(DEFAULTS.prepMin);
    setTargetSleepH(DEFAULTS.targetSleepH);
    setAnchorSleepH(DEFAULTS.anchorSleepH);
    setLatency(DEFAULTS.latency);
    setStrategy(DEFAULTS.strategy);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Night duty
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Security Guard Night Sleep Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Three ways to fit a full sleep into daylight hours around an overnight post — straight
          after the shift, delayed until just before it, or split into an anchor sleep and a
          pre-shift nap — with caffeine, light and bedroom targets for each.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="guard-start">
              Shift starts
            </label>
            <input
              id="guard-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={shiftStart}
              onChange={(event) => setShiftStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="guard-end">
              Shift ends
            </label>
            <input
              id="guard-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={shiftEnd}
              onChange={(event) => setShiftEnd(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="guard-home">
              Journey home (minutes)
            </label>
            <input
              id="guard-home"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="5"
              value={commuteHomeMin}
              onChange={(event) => setCommuteHomeMin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="guard-towork">
              Journey to the next shift (minutes)
            </label>
            <input
              id="guard-towork"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="5"
              value={commuteToWorkMin}
              onChange={(event) => setCommuteToWorkMin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="guard-prep">
              Getting ready before leaving (minutes)
            </label>
            <input
              id="guard-prep"
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
            <label className={LABEL_CLASS} htmlFor="guard-sleep">
              Sleep target per 24 hours (hours)
            </label>
            <input
              id="guard-sleep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="4"
              max="12"
              step="0.25"
              value={targetSleepH}
              onChange={(event) => setTargetSleepH(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="guard-anchor">
              Split plan: anchor sleep after the shift (hours)
            </label>
            <input
              id="guard-anchor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="10"
              step="0.5"
              value={anchorSleepH}
              onChange={(event) => setAnchorSleepH(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="guard-latency">
              Time you take to fall asleep (minutes)
            </label>
            <input
              id="guard-latency"
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
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Sleep strategy</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {STRATEGIES.map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={strategy === key}
                onClick={() => setStrategy(key)}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  strategy === key
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
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
              Sleep window
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${chosen.segments[0].start.time}–${chosen.segments[0].end.time}` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? chosen.label : "Fix the inputs above to see a plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the night shift sleep plan"
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

        {ok && (
          <>
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">{chosen.blurb}</p>
            {!chosen.fits && (
              <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]" role="alert">
                This plan does not fit in the gap between shifts. Reduce the sleep target, shorten the
                pre-shift buffer, or pick another strategy.
              </p>
            )}
            <ul className="mt-4 space-y-2 text-sm">
              {chosen.segments.map((seg) => (
                <li
                  key={seg.label}
                  className="flex items-center justify-between gap-3 rounded-md bg-[var(--muted)] px-3 py-2"
                >
                  <span className="font-medium">{seg.label}</span>
                  <span className="font-semibold">
                    {seg.start.time}–{seg.end.time}{" "}
                    <span className="font-normal text-[var(--muted-foreground)]">
                      ({formatDuration(seg.sleepMin)} asleep)
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value, note]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt>
                <span className="block font-medium text-[var(--foreground)]">{label}</span>
                {note ? <span className="block text-xs text-[var(--muted-foreground)]">{note}</span> : null}
              </dt>
              <dd className="shrink-0 text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

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

      {ok && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Daytime bedroom targets</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Light", `Under about ${plan.environment.lightLux} lux — blackout blinds plus a sleep mask. Overcast daylight is well over 1,000 lux.`],
              ["Noise", `Under about ${plan.environment.noiseDbA} dB(A) indoors, the WHO level for undisturbed sleep. Earplugs or steady white noise cover traffic and neighbours.`],
              ["Temperature", `Roughly ${plan.environment.tempMinC}–${plan.environment.tempMaxC} °C — day sleep fails most often because the room heats up by mid-afternoon.`],
              ["Interruptions", "Phone on do-not-disturb with an emergency-contacts exception, and a note on the door for deliveries."],
            ].map(([label, value]) => (
              <div key={label} className="py-2.5">
                <dt className="font-medium text-[var(--foreground)]">{label}</dt>
                <dd className="mt-1 text-[var(--muted-foreground)]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Falling asleep on the drive home, persistent insomnia across a roster,
        or loud snoring with daytime sleepiness should be raised with a doctor or occupational
        health — night-shift sleep problems are treatable and are a road-safety issue.
      </p>
    </main>
  );
}
