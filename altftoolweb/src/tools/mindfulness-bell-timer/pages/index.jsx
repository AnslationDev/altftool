"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, Copy, Pause, Play, RotateCcw, Shuffle, Volume2, VolumeX } from "lucide-react";
import {
  MAX_GAP_MINUTES,
  MAX_INTERVAL_MINUTES,
  MAX_SESSION_MINUTES,
  MIN_GAP_MINUTES,
  MIN_INTERVAL_MINUTES,
  MIN_SESSION_MINUTES,
  MODES,
  PAUSE_BREATHS,
  bellStateAtTime,
  buildBellSchedule,
  formatClock,
} from "../lib";

const DASH = "—";
const TICK_MS = 200;
const DEFAULT_SEED = 1;

const DEFAULTS = {
  minutes: "20",
  mode: "interval",
  interval: "5",
  minGap: "2",
  maxGap: "7",
  startBell: true,
  endBell: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [interval, setIntervalMinutes] = useState(DEFAULTS.interval);
  const [minGap, setMinGap] = useState(DEFAULTS.minGap);
  const [maxGap, setMaxGap] = useState(DEFAULTS.maxGap);
  const [startBell, setStartBell] = useState(DEFAULTS.startBell);
  const [endBell, setEndBell] = useState(DEFAULTS.endBell);
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [soundOn, setSoundOn] = useState(true);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef(null);

  const schedule = useMemo(
    () =>
      buildBellSchedule({
        minutes: Number(minutes),
        mode,
        intervalMinutes: Number(interval),
        minGapMinutes: Number(minGap),
        maxGapMinutes: Number(maxGap),
        startBell,
        endBell,
        seed,
      }),
    [minutes, mode, interval, minGap, maxGap, startBell, endBell, seed],
  );
  const ok = !schedule.error;
  const state = useMemo(
    () => (ok ? bellStateAtTime(elapsed, schedule) : null),
    [ok, elapsed, schedule],
  );

  useEffect(() => {
    setRunning(false);
    setElapsed(0);
  }, [minutes, mode, interval, minGap, maxGap, startBell, endBell, seed]);

  useEffect(() => {
    if (!running || !ok) return undefined;
    const id = setInterval(() => setElapsed((value) => value + TICK_MS / 1000), TICK_MS);
    return () => clearInterval(id);
  }, [running, ok]);

  const finished = Boolean(state && state.done);
  useEffect(() => {
    if (finished) setRunning(false);
  }, [finished]);

  const rungCount = state ? state.rungCount : 0;

  // Strike the bell whenever another one has been reached.
  useEffect(() => {
    if (!running || !soundOn || rungCount === 0) return;
    const ctx = audioRef.current;
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
      gain.connect(ctx.destination);
      [528, 1584, 2376].forEach((frequency, index) => {
        const osc = ctx.createOscillator();
        const partial = ctx.createGain();
        partial.gain.value = index === 0 ? 1 : 0.3 / index;
        osc.type = "sine";
        osc.frequency.value = frequency;
        osc.connect(partial).connect(gain);
        osc.start(now);
        osc.stop(now + 2.7);
      });
    } catch {
      /* the timer still works without sound */
    }
  }, [rungCount, running, soundOn]);

  useEffect(
    () => () => {
      const ctx = audioRef.current;
      if (ctx && typeof ctx.close === "function") ctx.close();
      audioRef.current = null;
    },
    [],
  );

  const start = () => {
    if (!ok) return;
    if (typeof window !== "undefined" && soundOn && !audioRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioRef.current = new Ctx();
    }
    const ctx = audioRef.current;
    if (ctx && ctx.state === "suspended" && typeof ctx.resume === "function") ctx.resume();
    if (finished) setElapsed(0);
    setRunning(true);
  };

  const reset = () => {
    setMinutes(DEFAULTS.minutes);
    setMode(DEFAULTS.mode);
    setIntervalMinutes(DEFAULTS.interval);
    setMinGap(DEFAULTS.minGap);
    setMaxGap(DEFAULTS.maxGap);
    setStartBell(DEFAULTS.startBell);
    setEndBell(DEFAULTS.endBell);
    setSeed(DEFAULT_SEED);
    setRunning(false);
    setElapsed(0);
    setCopied(false);
  };

  const shuffleSeed = () => setSeed(Math.floor(Math.random() * 1000000) + 1);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Mindfulness Bell Timer",
      `Session: ${schedule.minutes} minutes (${formatClock(schedule.totalSeconds)})`,
      `Mode: ${schedule.modeLabel}`,
      `Bells: ${schedule.totalBellCount} in total, ${schedule.pauseBellCount} pause bells`,
      `Average gap: ${formatClock(schedule.averageGapSeconds)}`,
      `Shortest gap ${formatClock(schedule.shortestGapSeconds)}, longest ${formatClock(schedule.longestGapSeconds)}`,
      "",
      ...schedule.bells.map((bell) => `${formatClock(bell.at)} — ${bell.label}`),
    ].join("\n");
  }, [ok, schedule]);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bell className="h-4 w-4" aria-hidden="true" />
          Mindfulness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Mindfulness Bell Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A bell of mindfulness: when it sounds, stop, stay still and follow {PAUSE_BREATHS} breaths
          before carrying on. Space the bells evenly, or set a minimum and maximum gap so they
          cannot be anticipated.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bell-minutes">
              Session length (minutes)
            </label>
            <input
              id="bell-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_SESSION_MINUTES}
              max={MAX_SESSION_MINUTES}
              step="1"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bell-mode">
              Bell spacing
            </label>
            <select
              id="bell-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {Object.values(MODES).map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {mode === "interval" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="bell-interval">
                Minutes between bells
              </label>
              <input
                id="bell-interval"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={MIN_INTERVAL_MINUTES}
                max={MAX_INTERVAL_MINUTES}
                step="0.5"
                value={interval}
                onChange={(event) => setIntervalMinutes(event.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="bell-min-gap">
                  Shortest gap (minutes)
                </label>
                <input
                  id="bell-min-gap"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min={MIN_GAP_MINUTES}
                  max={MAX_GAP_MINUTES}
                  step="0.5"
                  value={minGap}
                  onChange={(event) => setMinGap(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="bell-max-gap">
                  Longest gap (minutes)
                </label>
                <input
                  id="bell-max-gap"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min={MIN_GAP_MINUTES}
                  max={MAX_GAP_MINUTES}
                  step="0.5"
                  value={maxGap}
                  onChange={(event) => setMaxGap(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={shuffleSeed}
                  aria-label="Generate a new random bell pattern"
                  className={GHOST_BTN}
                >
                  <Shuffle className="h-4 w-4" aria-hidden="true" />
                  New random pattern
                </button>
              </div>
            </>
          )}

          <div className="sm:col-span-2 grid gap-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="bell-start"
            >
              <input
                id="bell-start"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={startBell}
                onChange={(event) => setStartBell(event.target.checked)}
              />
              Opening bell at the start
            </label>
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="bell-end"
            >
              <input
                id="bell-end"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={endBell}
                onChange={(event) => setEndBell(event.target.checked)}
              />
              Closing bell at the end
            </label>
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="bell-sound"
            >
              <input
                id="bell-sound"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={soundOn}
                onChange={(event) => setSoundOn(event.target.checked)}
              />
              {soundOn ? (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              )}
              Play the bell sound
            </label>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          {MODES[mode] ? MODES[mode].note : ""}
        </p>
      </section>

      {schedule.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {schedule.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Time remaining
            </p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-[var(--primary)]">
              {ok ? formatClock(state.remainingSeconds) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]" aria-live="polite">
              {ok
                ? state.done
                  ? "Session finished."
                  : state.nextBellLabel
                    ? `${state.nextBellLabel} in ${formatClock(state.secondsToNext)}`
                    : "No further bells."
                : "Fix the settings to see the schedule"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {running ? (
              <button
                type="button"
                onClick={() => setRunning(false)}
                aria-label="Pause the session"
                className={PRIMARY_BTN}
              >
                <Pause className="h-4 w-4" aria-hidden="true" />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                aria-label="Start the session"
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
              aria-label="Copy the bell schedule"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy schedule"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the timer" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${ok ? Math.min(100, state.progress * 100) : 0}%` }}
            aria-hidden="true"
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Bells rung so far", ok ? `${state.rungCount} of ${schedule.totalBellCount}` : DASH],
            ["Pause bells in the session", ok ? `${schedule.pauseBellCount}` : DASH],
            ["Average gap", ok ? formatClock(schedule.averageGapSeconds) : DASH],
            [
              "Shortest / longest gap",
              ok
                ? `${formatClock(schedule.shortestGapSeconds)} / ${formatClock(schedule.longestGapSeconds)}`
                : DASH,
            ],
            ["Session length", ok ? formatClock(schedule.totalSeconds) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Bell schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">At</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Bell</th>
                  <th scope="col" className="py-2 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {schedule.bells.map((bell, index) => (
                  <tr key={`${bell.kind}-${bell.at}-${index}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold tabular-nums">{formatClock(bell.at)}</td>
                    <td className="py-2 pr-3">{bell.label}</td>
                    <td
                      className={`py-2 text-right font-semibold ${index < state.rungCount ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}
                    >
                      {index < state.rungCount ? "Rung" : "Waiting"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Keep this tab open and the device unmuted for the bell to sound; browsers pause audio in
        background tabs on some phones. Mindfulness practice suits most people, but if sitting with
        your attention inward brings up distressing memories or intrusive thoughts, stop and talk to
        a qualified teacher or a mental health professional.
      </p>
    </main>
  );
}
