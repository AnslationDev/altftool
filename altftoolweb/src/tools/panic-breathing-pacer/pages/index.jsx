"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, HeartPulse, Pause, Play, RotateCcw } from "lucide-react";
import {
  GROUNDING_STEPS,
  MAX_MINUTES,
  MAX_START_BPM,
  MAX_TARGET_BPM,
  MIN_MINUTES,
  MIN_START_BPM,
  MIN_TARGET_BPM,
  NORMAL_RESTING_BPM_HIGH,
  NORMAL_RESTING_BPM_LOW,
  PATTERNS,
  RESONANCE_BPM,
  buildPacer,
  formatClock,
  positionAtTime,
} from "../lib";

const DASH = "—";
const TICK_MS = 100;

const DEFAULTS = { pattern: "settle", start: "18", target: "6", minutes: "3" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PHASE_TONE = {
  inhale: "text-[var(--primary)]",
  holdIn: "text-[var(--foreground)]",
  exhale: "text-[var(--success)]",
  holdOut: "text-[var(--foreground)]",
  done: "text-[var(--primary)]",
};

/** Pacer circle size range per phase. Presentation only. */
const PHASE_SCALE = {
  inhale: [0.4, 1],
  holdIn: [1, 1],
  exhale: [1, 0.4],
  holdOut: [0.4, 0.4],
  done: [0.4, 0.4],
};

export default function ToolHome() {
  const [pattern, setPattern] = useState(DEFAULTS.pattern);
  const [start, setStart] = useState(DEFAULTS.start);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const pacer = useMemo(
    () =>
      buildPacer({
        pattern,
        startBpm: Number(start),
        targetBpm: Number(target),
        minutes: Number(minutes),
      }),
    [pattern, start, target, minutes],
  );
  const ok = !pacer.error;
  const position = useMemo(() => (ok ? positionAtTime(elapsed, pacer) : null), [ok, elapsed, pacer]);

  useEffect(() => {
    setRunning(false);
    setElapsed(0);
  }, [pattern, start, target, minutes]);

  useEffect(() => {
    if (!running || !ok) return undefined;
    const id = setInterval(() => setElapsed((value) => value + TICK_MS / 1000), TICK_MS);
    return () => clearInterval(id);
  }, [running, ok]);

  const finished = Boolean(position && position.done);
  useEffect(() => {
    if (finished) setRunning(false);
  }, [finished]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Panic Breathing Pacer",
      `Pattern: ${pacer.patternLabel} (${pacer.exhaleShare}% of each breath is the exhale)`,
      `Ramp: ${pacer.startBpm} down to ${pacer.targetBpm} breaths per minute`,
      `Breaths: ${pacer.cycleCount} over ${formatClock(pacer.totalSeconds)}`,
      `First breath: ${pacer.firstCycleSeconds}s, exhale ${pacer.firstExhaleSeconds}s`,
      `Last breath: ${pacer.lastCycleSeconds}s, exhale ${pacer.lastExhaleSeconds}s`,
      "",
      "Grounding steps:",
      ...GROUNDING_STEPS.map((step) => `- ${step}`),
    ].join("\n");
  }, [ok, pacer]);

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
    setPattern(DEFAULTS.pattern);
    setStart(DEFAULTS.start);
    setTarget(DEFAULTS.target);
    setMinutes(DEFAULTS.minutes);
    setRunning(false);
    setElapsed(0);
    setCopied(false);
  };

  const phaseKey = position ? position.phaseKey : "inhale";
  const range = PHASE_SCALE[phaseKey] || PHASE_SCALE.done;
  const progress = position ? Math.min(1, Math.max(0, position.phaseProgress)) : 0;
  const circleScale = range[0] + (range[1] - range[0]) * progress;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
          Acute anxiety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Panic Breathing Pacer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Starts near the rate you are breathing at right now and slows you down towards{" "}
          {RESONANCE_BPM} breaths a minute, with the exhale equal to or longer than the inhale
          depending on the pattern you choose. Small, quiet breaths — not deep ones.
          Over-breathing is what causes the tingling and dizziness.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="panic-pattern">
              Breathing shape
            </label>
            <select
              id="panic-pattern"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
            >
              {Object.values(PATTERNS).map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {PATTERNS[pattern] ? PATTERNS[pattern].note : ""}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="panic-start">
              Breaths per minute right now
            </label>
            <input
              id="panic-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_START_BPM}
              max={MAX_START_BPM}
              step="1"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Rough guess is fine. A normal resting rate is about {NORMAL_RESTING_BPM_LOW}-
              {NORMAL_RESTING_BPM_HIGH}
              {ok && pacer.startsAboveNormal
                ? " — yours is above that, which is expected during a panic spike."
                : "."}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="panic-target">
              Target breaths per minute
            </label>
            <input
              id="panic-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_TARGET_BPM}
              max={MAX_TARGET_BPM}
              step="1"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="panic-minutes">
              Session length (minutes)
            </label>
            <input
              id="panic-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              step="1"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
        </div>
      </section>

      {pacer.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {pacer.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-col items-center">
          <div className="relative flex h-56 w-56 items-center justify-center">
            <span className="absolute h-56 w-56 rounded-full bg-[var(--muted)]" aria-hidden="true" />
            <span
              className="absolute h-56 w-56 rounded-full bg-[var(--primary)]/25 transition-transform duration-200 ease-linear motion-reduce:transition-none"
              style={{ transform: `scale(${ok ? circleScale : 0.4})` }}
              aria-hidden="true"
            />
            <div className="relative text-center">
              <p
                className={`text-2xl font-semibold ${ok ? PHASE_TONE[phaseKey] || "" : "text-[var(--muted-foreground)]"}`}
              >
                {ok ? position.phaseLabel : DASH}
              </p>
              <p className="mt-1 text-5xl font-semibold tabular-nums">
                {ok ? Math.ceil(position.phaseRemaining) : DASH}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {ok ? `${position.bpm} breaths / min` : "Fix the settings"}
              </p>
            </div>
          </div>

          <p
            className="mt-4 min-h-[3rem] max-w-sm text-center text-sm text-[var(--muted-foreground)]"
            aria-live="polite"
          >
            {ok ? position.instruction : "Choose valid rates and a session length."}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {running ? (
              <button
                type="button"
                onClick={() => setRunning(false)}
                aria-label="Pause the pacer"
                className={PRIMARY_BTN}
              >
                <Pause className="h-4 w-4" aria-hidden="true" />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!ok) return;
                  if (finished) setElapsed(0);
                  setRunning(true);
                }}
                aria-label="Start the pacer"
                className={PRIMARY_BTN}
                disabled={!ok}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                {elapsed > 0 && !finished ? "Resume" : "Start"}
              </button>
            )}
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the pacer plan"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the pacer" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${ok ? Math.min(100, Math.max(0, position.overallProgress * 100)) : 0}%` }}
            aria-hidden="true"
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Time left", ok ? formatClock(position.remainingSeconds) : DASH],
            ["Breath", ok ? `${position.cycleNumber} of ${pacer.cycleCount}` : DASH],
            ["Session length", ok ? formatClock(pacer.totalSeconds) : DASH],
            [
              "First breath",
              ok ? `${pacer.firstCycleSeconds}s (exhale ${pacer.firstExhaleSeconds}s)` : DASH,
            ],
            [
              "Last breath",
              ok ? `${pacer.lastCycleSeconds}s (exhale ${pacer.lastExhaleSeconds}s)` : DASH,
            ],
            ["Exhale share of each breath", ok ? `${pacer.exhaleShare}%` : DASH],
            [
              `Reaches resonance (${RESONANCE_BPM} bpm)`,
              ok ? (pacer.reachesResonance ? "Yes" : "Not quite — lower the target rate") : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && pacer.hasHold ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
            This shape includes breath holds. If holding your breath makes the panic worse, switch
            to Settle 4:6 — holds are optional, the long exhale is the part that matters.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">While you breathe</h2>
        <ol className="mt-3 grid gap-2 text-sm leading-6">
          {GROUNDING_STEPS.map((step) => (
            <li key={step} className="flex gap-2">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                aria-hidden="true"
              />
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not a treatment for panic disorder. Call your local emergency number
        if there is chest pain or pressure, pain spreading to the arm or jaw, fainting, a first-ever
        episode, or if you are unsure whether this is panic. Repeated panic attacks respond well to
        cognitive behavioural therapy — ask a doctor for a referral.
      </p>
    </main>
  );
}
