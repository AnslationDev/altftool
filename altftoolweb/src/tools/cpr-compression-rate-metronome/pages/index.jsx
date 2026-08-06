"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, HeartPulse, Pause, Play, RotateCcw, TriangleAlert } from "lucide-react";
import {
  GUIDELINE_RATE_MAX,
  GUIDELINE_RATE_MIN,
  SCENARIOS,
  computeCprTiming,
  cprPhaseAt,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  bpm: "110",
  scenarioId: "adult",
  breathPauseSeconds: "6",
  switchMinutes: "2",
  sound: true,
};

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";
const TICK_MS = 50;

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [running, setRunning] = useState(false);
  const [live, setLive] = useState(null);
  const [copied, setCopied] = useState(false);

  const audioRef = useRef(null);
  const startRef = useRef(0);
  const lastBeatRef = useRef(-1);
  // Compressions/cycles delivered under timing regimes prior to the current one —
  // lets a mid-session slider/select edit rebase the clock onto the new rate
  // without retroactively reinterpreting time that already elapsed under the old
  // rate.
  const offsetRef = useRef(0);
  const cycleOffsetRef = useRef(0);
  const prevTimingRef = useRef(null);
  const prevRunningRef = useRef(false);

  // If a live edit (e.g. clearing the swap-interval field) makes the settings
  // invalid while the metronome is running, stop it right here in the same event
  // that caused it — instead of leaving `running` stuck true with a disabled Stop
  // button and a frozen, stale readout until Reset is clicked.
  const update = (key, value) => {
    const next = { ...form, [key]: value };
    if (running) {
      const nextTiming = computeCprTiming({
        bpm: Number(next.bpm),
        scenarioId: next.scenarioId,
        breathPauseSeconds: Number(next.breathPauseSeconds),
        switchMinutes: Number(next.switchMinutes),
      });
      if (nextTiming.error) {
        setRunning(false);
        setLive(null);
      }
    }
    setForm(next);
  };

  const timing = useMemo(
    () =>
      computeCprTiming({
        bpm: Number(form.bpm),
        scenarioId: form.scenarioId,
        breathPauseSeconds: Number(form.breathPauseSeconds),
        switchMinutes: Number(form.switchMinutes),
      }),
    [form.bpm, form.scenarioId, form.breathPauseSeconds, form.switchMinutes],
  );

  const hasError = Boolean(timing.error);
  const soundOn = form.sound;

  const playClick = useCallback((accent) => {
    const ctx = audioRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(accent ? 1320 : 880, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.28 : 0.18, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }, []);

  useEffect(() => {
    if (!running || hasError) {
      prevRunningRef.current = running;
      return undefined;
    }

    const justStarted = !prevRunningRef.current;

    if (!justStarted && prevTimingRef.current && prevTimingRef.current !== timing) {
      // A control changed while the metronome was already running. Work out how
      // many compressions had actually been delivered under the OLD timing up to
      // this instant, then rebase the clock onto the NEW timing from right now —
      // instead of letting cprPhaseAt reinterpret the entire elapsed session as if
      // it had all been paced at the new rate (which both rewrites history shown
      // on screen and fires a spurious click at whatever phase elapsed-since-start
      // now falls on under the new rate).
      const elapsedUnderOldTiming = (performance.now() - startRef.current) / 1000;
      const oldPhase = cprPhaseAt(elapsedUnderOldTiming, prevTimingRef.current);
      const deliveredSoFar = offsetRef.current + (oldPhase ? oldPhase.totalCompressions : 0);
      offsetRef.current = deliveredSoFar;
      cycleOffsetRef.current += oldPhase ? oldPhase.cycleIndex : 0;
      startRef.current = performance.now();
      const zeroPhase = cprPhaseAt(0, timing);
      // Prime the guard with what the very first tick of the new regime will
      // compute, so the rebase itself doesn't fire an unscheduled beat.
      lastBeatRef.current = deliveredSoFar + (zeroPhase ? zeroPhase.totalCompressions : 0);
    }

    prevRunningRef.current = running;
    prevTimingRef.current = timing;

    const id = window.setInterval(() => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      const phase = cprPhaseAt(elapsed, timing);
      if (!phase) return;
      const totalCompressions = offsetRef.current + phase.totalCompressions;
      const cycleNumber = cycleOffsetRef.current + phase.cycleNumber;
      if (phase.phase === "compress" && totalCompressions !== lastBeatRef.current) {
        lastBeatRef.current = totalCompressions;
        if (soundOn) playClick(phase.compressionInCycle === 1);
      }
      setLive({ ...phase, totalCompressions, cycleNumber });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [running, hasError, timing, soundOn, playClick]);

  useEffect(() => () => {
    const ctx = audioRef.current;
    if (ctx && typeof ctx.close === "function") ctx.close();
  }, []);

  const start = () => {
    if (hasError) return;
    if (!audioRef.current && typeof window !== "undefined") {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (Ctor) audioRef.current = new Ctor();
    }
    if (audioRef.current && audioRef.current.state === "suspended") {
      audioRef.current.resume();
    }
    startRef.current = performance.now();
    lastBeatRef.current = -1;
    offsetRef.current = 0;
    cycleOffsetRef.current = 0;
    prevTimingRef.current = null;
    setLive(null);
    setRunning(true);
  };

  const stop = () => setRunning(false);

  const reset = () => {
    setRunning(false);
    setForm(DEFAULTS);
    setLive(null);
    lastBeatRef.current = -1;
    offsetRef.current = 0;
    cycleOffsetRef.current = 0;
    prevTimingRef.current = null;
    prevRunningRef.current = false;
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "CPR compression pacing",
      `${timing.scenarioLabel} at ${timing.bpm} compressions per minute`,
      `Depth: ${timing.depth}`,
      `Hand position: ${timing.handPosition}`,
    ];
    if (timing.continuous) {
      lines.push(
        `Continuous compressions — about ${timing.compressionsPerSwitch} in a ${timing.switchMinutes} minute stint`,
      );
      if (timing.breathEverySeconds) {
        lines.push(`One breath every ${timing.breathEverySeconds} seconds without pausing compressions`);
      }
    } else {
      lines.push(
        `${timing.compressionsPerCycle}:2 cycle — ${NUM.format(timing.compressionPhaseSeconds)} s of compressions plus a ${NUM.format(timing.breathPauseSeconds)} s pause`,
        `${timing.cyclesPerSwitch} full cycles (${timing.compressionsPerSwitch} compressions) before swapping rescuer at ${timing.switchMinutes} minutes`,
      );
    }
    lines.push(`Chest compression fraction: ${NUM.format(timing.compressionFraction)}%`);
    lines.push("", "Practice aid only — in a real emergency call your local emergency number first.");
    return lines.join("\n");
  }, [hasError, timing]);

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

  const compressing = live ? live.phase === "compress" : true;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
          CPR practice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          CPR Compression Rate Metronome
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A pacer for the {GUIDELINE_RATE_MIN}–{GUIDELINE_RATE_MAX} compressions per minute that
          the AHA and ERC guidelines specify, with 30:2 or 15:2 cycle timing, a rescuer swap
          countdown and the depth reminders for adults, children and infants.
        </p>
      </header>

      <div
        role="alert"
        className="rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm text-[var(--danger)]"
      >
        <p className="flex items-center gap-2 font-semibold">
          <TriangleAlert className="h-4 w-4" aria-hidden="true" />
          This is a training aid, not an emergency tool
        </p>
        <p className="mt-1">
          If someone is unresponsive and not breathing normally, call your local emergency number
          now and follow the dispatcher, who will pace compressions for you over the phone.
        </p>
      </div>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cpr-bpm">
              Compression rate: {form.bpm} per minute
            </label>
            <input
              id="cpr-bpm"
              className="mt-3 h-11 w-full accent-[var(--primary)]"
              type="range"
              min="60"
              max="140"
              step="1"
              value={form.bpm}
              onChange={(event) => update("bpm", event.target.value)}
            />
            <div className="mt-1 flex flex-wrap gap-2">
              {[100, 110, 120].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update("bpm", String(value))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {value} /min
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cpr-scenario">
              Who you are practising on
            </label>
            <select
              id="cpr-scenario"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.scenarioId}
              onChange={(event) => update("scenarioId", event.target.value)}
            >
              {SCENARIOS.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cpr-pause">
              Pause for two breaths (seconds)
            </label>
            <input
              id="cpr-pause"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="0.5"
              value={form.breathPauseSeconds}
              onChange={(event) => update("breathPauseSeconds", event.target.value)}
              disabled={timing.continuous === true}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cpr-switch">
              Swap rescuer every (minutes)
            </label>
            <input
              id="cpr-switch"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="10"
              step="0.5"
              value={form.switchMinutes}
              onChange={(event) => update("switchMinutes", event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              htmlFor="cpr-sound"
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <input
                id="cpr-sound"
                type="checkbox"
                checked={form.sound}
                onChange={(event) => update("sound", event.target.checked)}
                className="h-5 w-5 accent-[var(--primary)]"
              />
              <span>Audible click</span>
            </label>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {timing.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Pacing at
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${timing.bpm} /min`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the settings above to start."
                : timing.continuous
                  ? `${timing.scenarioLabel} — continuous compressions`
                  : `${timing.scenarioLabel} — ${timing.compressionsPerCycle}:2 cycles`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy result — CPR pacing settings"
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
              onClick={running ? stop : start}
              aria-label={running ? "Stop the metronome" : "Start the metronome"}
              className={PRIMARY_BTN}
              disabled={hasError}
            >
              {running ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
              {running ? "Stop" : "Start"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset everything" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <div
            aria-hidden="true"
            className={`flex h-32 w-32 items-center justify-center rounded-full border-4 transition-transform duration-100 motion-reduce:transition-none ${
              running && compressing
                ? "border-[var(--primary)] bg-[var(--primary)]/15"
                : "border-[var(--border)] bg-[var(--background)]"
            } ${running && compressing && live && live.compressionInCycle % 2 === 0 ? "scale-110" : "scale-100"}`}
          >
            <span className="text-3xl font-semibold text-[var(--primary)]">
              {live ? live.compressionInCycle : "—"}
            </span>
          </div>
          {/* Announces once per phase change ("Push hard..." / "Give 2 breaths"), not
              on every 50ms tick — the live countdown next to it is visual-only so
              screen readers aren't flooded with a new number ~20 times a second. */}
          <p role="status" aria-live="polite" className="text-sm font-semibold">
            {!running ? "Stopped" : compressing ? "Push hard, push fast" : "Give 2 breaths"}
          </p>
          {running && !compressing ? (
            <p aria-hidden="true" className="text-sm text-[var(--muted-foreground)]">
              {NUM.format(live ? live.breathSecondsLeft : 0)} s
            </p>
          ) : null}
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Compressions delivered",
              !running || !live ? DASH : String(live.totalCompressions),
            ],
            ["Cycle", !running || !live ? DASH : String(live.cycleNumber)],
            [
              "Measured rate",
              !running || !live || live.averageRate == null
                ? DASH
                : `${live.averageRate} /min including pauses`,
            ],
            [
              "Swap rescuer in",
              !running || !live ? DASH : `${NUM.format(live.secondsToSwitch)} s`,
            ],
            [
              "Beat interval",
              hasError ? DASH : `${NUM.format(timing.intervalMs)} ms`,
            ],
            [
              "Cycle length",
              hasError
                ? DASH
                : timing.continuous
                  ? "Continuous"
                  : `${NUM.format(timing.cycleSeconds)} s (${NUM.format(timing.compressionPhaseSeconds)} s compressing)`,
            ],
            [
              "Chest compression fraction",
              hasError ? DASH : `${NUM.format(timing.compressionFraction)}%`,
            ],
            [
              "Cycles before swapping",
              hasError
                ? DASH
                : `${timing.cyclesPerSwitch} (${timing.compressionsPerSwitch} compressions)`,
            ],
            ["Depth", hasError ? DASH : timing.depth],
            ["Hand position", hasError ? DASH : timing.handPosition],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && timing.warnings.length > 0 && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm text-[var(--danger)]"
          >
            <ul className="list-disc space-y-1 pl-5">
              {timing.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The numbers behind the pacing</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li className="flex gap-2">
            <span aria-hidden="true" className="text-[var(--primary)]">•</span>
            <span>
              Rate {GUIDELINE_RATE_MIN}–{GUIDELINE_RATE_MAX} per minute — faster is not better,
              because the chest has to recoil fully between compressions for the heart to refill.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="text-[var(--primary)]">•</span>
            <span>
              Adult depth of at least 5 cm and no more than 6 cm; children and infants about one
              third of the chest depth.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="text-[var(--primary)]">•</span>
            <span>
              Keep every interruption under 10 seconds and spend at least 60% of the time
              compressing.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="text-[var(--primary)]">•</span>
            <span>
              Swap the compressor about every 2 minutes — quality falls off well before the
              rescuer feels tired.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="text-[var(--primary)]">•</span>
            <span>
              Untrained bystanders should give hands-only compressions on an adult and send
              someone for the nearest defibrillator.
            </span>
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only and no substitute for a hands-on certified CPR course, which is where
        depth, recoil and airway technique are actually learned. Rates and ratios follow the AHA
        2020 and ERC 2021 guidelines; local protocols may differ.
      </p>
    </main>
  );
}
