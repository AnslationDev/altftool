"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, Volume2, Wind } from "lucide-react";

import {
  buildPattern,
  expansionAt,
  formatClock,
  HOLD_TONE_SECONDS,
  LIMITS,
  oneDecimal,
  PRESETS,
  stateAt,
  TONES,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  inhale: "4",
  holdIn: "4",
  exhale: "4",
  holdOut: "4",
  minutes: "5",
  volume: "0.2",
};

const DASH = "—";
const TICK_MS = 100;
const MIN_CIRCLE_SCALE = 0.45;
const MAX_TONE_SECONDS = 12;
const GAIN_FLOOR = 0.0001;

export default function ToolHome() {
  const [inhale, setInhale] = useState(DEFAULTS.inhale);
  const [holdIn, setHoldIn] = useState(DEFAULTS.holdIn);
  const [exhale, setExhale] = useState(DEFAULTS.exhale);
  const [holdOut, setHoldOut] = useState(DEFAULTS.holdOut);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [volume, setVolume] = useState(DEFAULTS.volume);
  const [soundOn, setSoundOn] = useState(true);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [anchor, setAnchor] = useState(0);
  const [copied, setCopied] = useState(false);

  const audioCtxRef = useRef(null);
  const lastToneRef = useRef(null);

  const pattern = useMemo(
    () =>
      buildPattern({
        inhale: Number(inhale),
        holdIn: Number(holdIn),
        exhale: Number(exhale),
        holdOut: Number(holdOut),
        minutes: Number(minutes),
      }),
    [inhale, holdIn, exhale, holdOut, minutes],
  );

  const hasError = Boolean(pattern.error);
  const totalSeconds = hasError ? 0 : pattern.totalSeconds;
  const state = hasError ? null : stateAt(pattern, Math.min(elapsed, totalSeconds));
  const expansion = state ? expansionAt(state) : 0;

  useEffect(() => {
    setRunning(false);
    setElapsed(0);
    lastToneRef.current = null;
  }, [totalSeconds]);

  useEffect(() => {
    if (!running || hasError) return undefined;
    const id = setInterval(() => {
      const next = Math.min(totalSeconds, (Date.now() - anchor) / 1000);
      setElapsed(next);
      if (next >= totalSeconds) setRunning(false);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, anchor, totalSeconds, hasError]);

  const playTone = useCallback(
    (phaseName, seconds) => {
      if (!soundOn || typeof window === "undefined") return;
      const spec = TONES[phaseName];
      if (!spec) return;
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtor();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const isHold = phaseName === "holdIn" || phaseName === "holdOut";
      const length = isHold
        ? HOLD_TONE_SECONDS
        : Math.min(MAX_TONE_SECONDS, Math.max(0.4, Number(seconds) || 1));
      const peak = Math.max(GAIN_FLOOR, Math.min(1, Number(volume) || 0));
      const start = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(spec.from, start);
      osc.frequency.linearRampToValueAtTime(spec.to, start + length);
      gain.gain.setValueAtTime(GAIN_FLOOR, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.08);
      gain.gain.setValueAtTime(peak, start + Math.max(0.1, length - 0.25));
      gain.gain.exponentialRampToValueAtTime(GAIN_FLOOR, start + length);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + length + 0.05);
    },
    [soundOn, volume],
  );

  const toneKey = state && !state.finished ? `${state.cycleNumber}-${state.phase.name}` : null;
  const tonePhase = state && !state.finished ? state.phase.name : null;
  const toneSeconds = state && !state.finished ? state.phase.seconds : 0;

  useEffect(() => {
    if (!running || !toneKey) return;
    if (lastToneRef.current === toneKey) return;
    lastToneRef.current = toneKey;
    playTone(tonePhase, toneSeconds);
  }, [running, toneKey, tonePhase, toneSeconds, playTone]);

  useEffect(
    () => () => {
      if (audioCtxRef.current && typeof audioCtxRef.current.close === "function") {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    },
    [],
  );

  const toggleRun = () => {
    if (hasError) return;
    if (running) {
      setRunning(false);
      return;
    }
    const from = state && state.finished ? 0 : elapsed;
    setElapsed(from);
    setAnchor(Date.now() - from * 1000);
    lastToneRef.current = null;
    setRunning(true);
  };

  const applyPreset = (preset) => {
    setInhale(String(preset.inhale));
    setHoldIn(String(preset.holdIn));
    setExhale(String(preset.exhale));
    setHoldOut(String(preset.holdOut));
    setRunning(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Breathing pacer",
      `Pattern: ${pattern.ratio} (inhale-hold-exhale-hold, seconds)`,
      `One breath: ${oneDecimal(pattern.cycleSeconds)} s`,
      `Rate: ${oneDecimal(pattern.breathsPerMinute)} breaths per minute`,
      `Session: ${pattern.cycles} breaths in ${formatClock(pattern.totalSeconds)}`,
    ].join("\n");
  }, [hasError, pattern]);

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
    setInhale(DEFAULTS.inhale);
    setHoldIn(DEFAULTS.holdIn);
    setExhale(DEFAULTS.exhale);
    setHoldOut(DEFAULTS.holdOut);
    setMinutes(DEFAULTS.minutes);
    setVolume(DEFAULTS.volume);
    setSoundOn(true);
    setRunning(false);
    setElapsed(0);
    setCopied(false);
    lastToneRef.current = null;
  };

  const field = (id, label, value, setter, key) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min={LIMITS[key].min}
        max={LIMITS[key].max}
        step="0.5"
        value={value}
        onChange={(event) => setter(event.target.value)}
      />
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wind className="h-4 w-4" aria-hidden="true" />
          Guided breathing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Breathing Pacer with Tones</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sets any inhale-hold-exhale-hold rhythm and guides it with a tone that glides up as you
          breathe in and back down as you breathe out, so you can pace with your eyes closed.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("br-inhale", "Inhale (seconds)", inhale, setInhale, "inhale")}
          {field("br-holdin", "Hold after inhale (seconds)", holdIn, setHoldIn, "holdIn")}
          {field("br-exhale", "Exhale (seconds)", exhale, setExhale, "exhale")}
          {field("br-holdout", "Hold after exhale (seconds)", holdOut, setHoldOut, "holdOut")}
          <div>
            <label className={LABEL_CLASS} htmlFor="br-minutes">
              Session length (minutes)
            </label>
            <input
              id="br-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.minutes.min}
              max={LIMITS.minutes.max}
              step="1"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="br-volume">
              Tone volume
            </label>
            <input
              id="br-volume"
              className="mt-4 h-2 w-full accent-[var(--primary)]"
              type="range"
              min="0.02"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => setVolume(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSoundOn((value) => !value)}
            aria-pressed={soundOn}
            className={GHOST_BTN}
          >
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            {soundOn ? "Tones on" : "Tones off"}
          </button>
          <button
            type="button"
            onClick={() => playTone("inhale", 2)}
            aria-label="Play a sample inhale tone"
            className={GHOST_BTN}
          >
            Test tone
          </button>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {pattern.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-col items-center">
          <div className="flex h-48 w-48 items-center justify-center">
            <div
              className="flex h-40 w-40 items-center justify-center rounded-full bg-[var(--primary)]/15 ring-2 ring-[var(--primary)]"
              style={{ transform: `scale(${MIN_CIRCLE_SCALE + (1 - MIN_CIRCLE_SCALE) * expansion})` }}
              aria-hidden="true"
            >
              <span className="font-mono text-2xl font-semibold tabular-nums text-[var(--primary)]">
                {hasError ? DASH : formatClock(state.phaseRemaining)}
              </span>
            </div>
          </div>
          <p className="mt-3 text-center text-lg font-semibold" aria-live="polite">
            {hasError ? DASH : state.finished ? "Session complete" : state.phase.label}
          </p>
          <p className="mt-1 text-center text-sm text-[var(--muted-foreground)]">
            {hasError
              ? "Fix the pattern to start."
              : `Breath ${state.cycleNumber} of ${pattern.cycles} · ${formatClock(state.sessionRemaining)} left`}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={toggleRun}
            aria-label={running ? "Pause the breathing pacer" : "Start the breathing pacer"}
            className={PRIMARY_BTN}
          >
            {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {running ? "Pause" : state && state.finished ? "Start again" : "Start"}
          </button>
          <button type="button" onClick={copyResult} aria-label="Copy the breathing pattern" className={GHOST_BTN}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy pattern"}
          </button>
          <button type="button" onClick={reset} aria-label="Reset the pacer" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Pattern (in-hold-out-hold)", hasError ? DASH : `${pattern.ratio} seconds`],
            ["One full breath", hasError ? DASH : `${oneDecimal(pattern.cycleSeconds)} s`],
            ["Breathing rate", hasError ? DASH : `${oneDecimal(pattern.breathsPerMinute)} breaths/min`],
            ["Breaths this session", hasError ? DASH : String(pattern.cycles)],
            ["Session length", hasError ? DASH : formatClock(pattern.totalSeconds)],
            [
              "Exhale vs inhale",
              hasError
                ? DASH
                : pattern.exhaleLongerThanInhale
                  ? "Exhale is longer — the calming direction"
                  : "Exhale is not longer than the inhale",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Stop if you feel dizzy or light-headed and return to
        normal breathing; never practise breath holds in water or while driving. Check with a doctor
        first if you are pregnant or have a heart, lung or blood-pressure condition.
      </p>
    </main>
  );
}
