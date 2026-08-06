"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, SkipForward, Timer, Volume2 } from "lucide-react";

import {
  buildSession,
  CUE_TONES,
  finishClock,
  formatClock,
  LIMITS,
  phaseAt,
  PRESETS,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  focus: "25",
  shortBreak: "5",
  longBreak: "15",
  perSet: "4",
  total: "8",
  startTime: "09:30",
  volume: "0.25",
};

const DASH = "—";
const TICK_MS = 200;
const PEAK_GAIN_FLOOR = 0.0001;

/** "" for same-day, " (next day)" for +1, " (+N days)" beyond that. */
const dayRolloverLabel = (days) => {
  if (!days) return "";
  return days === 1 ? " (next day)" : ` (+${days} days)`;
};

export default function ToolHome() {
  const [focus, setFocus] = useState(DEFAULTS.focus);
  const [shortBreak, setShortBreak] = useState(DEFAULTS.shortBreak);
  const [longBreak, setLongBreak] = useState(DEFAULTS.longBreak);
  const [perSet, setPerSet] = useState(DEFAULTS.perSet);
  const [total, setTotal] = useState(DEFAULTS.total);
  const [startTime, setStartTime] = useState(DEFAULTS.startTime);
  const [volume, setVolume] = useState(DEFAULTS.volume);
  const [soundOn, setSoundOn] = useState(true);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [anchor, setAnchor] = useState(0);
  const [copied, setCopied] = useState(false);

  const audioCtxRef = useRef(null);
  const lastCueRef = useRef(null);

  const session = useMemo(
    () =>
      buildSession({
        focusMinutes: Number(focus),
        shortBreakMinutes: Number(shortBreak),
        longBreakMinutes: Number(longBreak),
        pomodorosPerSet: Number(perSet),
        totalPomodoros: Number(total),
      }),
    [focus, shortBreak, longBreak, perSet, total],
  );

  const hasError = Boolean(session.error);
  const totalSeconds = hasError ? 0 : session.totalSeconds;

  const state = useMemo(
    () => (hasError ? null : phaseAt(session, Math.max(0, Math.min(elapsed, totalSeconds)))),
    [hasError, session, elapsed, totalSeconds],
  );

  const ending = useMemo(
    () => (hasError ? null : finishClock(startTime, totalSeconds)),
    [hasError, startTime, totalSeconds],
  );

  // Settings changed -> start the session over.
  useEffect(() => {
    setRunning(false);
    setElapsed(0);
    lastCueRef.current = null;
  }, [totalSeconds]);

  useEffect(() => {
    if (!running || hasError) return undefined;
    const id = setInterval(() => {
      // Clamp to >= 0: if the system clock is adjusted backward mid-session
      // (NTP resync, sleep/wake, manual change), Date.now() - anchor can go
      // negative, and phaseAt() treats negative elapsed as an error.
      setElapsed(Math.max(0, Math.min(totalSeconds, (Date.now() - anchor) / 1000)));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, anchor, totalSeconds, hasError]);

  const playCue = useCallback(
    (cueKey) => {
      if (!soundOn) return;
      const tone = CUE_TONES[cueKey];
      if (!tone || typeof window === "undefined") return;
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtor();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const peak = Math.max(PEAK_GAIN_FLOOR, Math.min(1, Number(volume) || 0));
      const beep = tone.beepMs / 1000;
      tone.frequencies.forEach((frequency, index) => {
        const startAt = ctx.currentTime + index * beep * 1.15;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency, startAt);
        gain.gain.setValueAtTime(PEAK_GAIN_FLOOR, startAt);
        gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.02);
        gain.gain.exponentialRampToValueAtTime(PEAK_GAIN_FLOOR, startAt + beep);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + beep + 0.05);
      });
    },
    [soundOn, volume],
  );

  // Cue on every phase change while the timer runs.
  const phaseKey = state ? (state.finished ? "done" : String(state.phaseIndex)) : null;
  const cueKey = state ? (state.finished ? "done" : state.phase.cue) : null;
  useEffect(() => {
    if (!running || !phaseKey) return;
    if (lastCueRef.current === null) {
      lastCueRef.current = phaseKey;
      return;
    }
    if (lastCueRef.current !== phaseKey) {
      lastCueRef.current = phaseKey;
      playCue(cueKey);
    }
  }, [running, phaseKey, cueKey, playCue]);

  useEffect(() => {
    if (running && state?.finished) setRunning(false);
  }, [running, state?.finished]);

  useEffect(
    () => () => {
      if (audioCtxRef.current && typeof audioCtxRef.current.close === "function") {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    },
    [],
  );

  const jumpTo = (seconds) => {
    const target = Math.max(0, Math.min(totalSeconds, seconds));
    setElapsed(target);
    setAnchor(Date.now() - target * 1000);
    lastCueRef.current = null;
  };

  const toggleRun = () => {
    if (hasError) return;
    if (running) {
      setRunning(false);
      return;
    }
    const from = state?.finished ? 0 : elapsed;
    setElapsed(from);
    setAnchor(Date.now() - from * 1000);
    if (from === 0) {
      // A true (re)start is a phase change into the first focus block —
      // reset the cue tracker and announce it.
      lastCueRef.current = null;
      playCue("focus");
    }
    // Resuming mid-phase (from !== 0) is not a phase change, so lastCueRef
    // is left untouched and no cue plays — otherwise every pause/resume
    // cycle would replay the current phase's tone.
    setRunning(true);
  };

  const skipPhase = () => {
    if (hasError || !state || state.finished) return;
    const target = state.phase.endSeconds;
    jumpTo(target);
    // jumpTo() nulls lastCueRef so the phase-change effect treats this as
    // "just initialized" and stays silent — play the cue for the phase we
    // land on here instead, the same way toggleRun() compensates for its
    // own lastCueRef reset. Without this, Skip silently mutes the cue for
    // the very transition it causes (including the session-complete tone).
    const next = phaseAt(session, Math.min(target, totalSeconds));
    if (!next.error) {
      playCue(next.finished ? "done" : next.phase.cue);
    }
  };

  const applyPreset = (preset) => {
    setFocus(String(preset.focusMinutes));
    setShortBreak(String(preset.shortBreakMinutes));
    setLongBreak(String(preset.longBreakMinutes));
    setPerSet(String(preset.pomodorosPerSet));
    setTotal(String(preset.totalPomodoros));
    setRunning(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Pomodoro session plan",
      `Focus: ${focus} min | Short break: ${shortBreak} min | Long break: ${longBreak} min`,
      `${session.pomodoroCount} pomodoros, long break every ${perSet}`,
      `Total session: ${formatClock(session.totalSeconds)} (focus ${formatClock(session.focusSeconds)}, breaks ${formatClock(session.breakSeconds)})`,
      ending && !ending.error ? `Start ${startTime} -> ends ${ending.time}${dayRolloverLabel(ending.dayRollover)}` : "",
      "",
      ...session.phases.map(
        (phase) => `${formatClock(phase.startSeconds)}  ${phase.label} (${formatClock(phase.durationSeconds)})`,
      ),
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, focus, shortBreak, longBreak, perSet, session, ending, startTime]);

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
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Reset the timer settings and clear the current session progress?",
      );
      if (!confirmed) return;
    }
    setFocus(DEFAULTS.focus);
    setShortBreak(DEFAULTS.shortBreak);
    setLongBreak(DEFAULTS.longBreak);
    setPerSet(DEFAULTS.perSet);
    setTotal(DEFAULTS.total);
    setStartTime(DEFAULTS.startTime);
    setVolume(DEFAULTS.volume);
    setSoundOn(true);
    setRunning(false);
    setElapsed(0);
    setCopied(false);
    lastCueRef.current = null;
  };

  const numberField = (id, label, value, setter, key, step = "1") => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="numeric"
        min={LIMITS[key].min}
        max={LIMITS[key].max}
        step={step}
        value={value}
        onChange={(event) => setter(event.target.value)}
      />
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Focus audio
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Pomodoro Sound Cue Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Runs a full pomodoro session and plays a short tone (two or three notes at each focus or
          break change, four notes when the session finishes), so you can look away from the screen
          and still know when focus ends, the break starts, and the session is done.
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
          {numberField("pom-focus", "Focus length (minutes)", focus, setFocus, "focusMinutes")}
          {numberField("pom-short", "Short break (minutes)", shortBreak, setShortBreak, "shortBreakMinutes")}
          {numberField("pom-long", "Long break (minutes)", longBreak, setLongBreak, "longBreakMinutes")}
          {numberField("pom-set", "Pomodoros before a long break", perSet, setPerSet, "pomodorosPerSet")}
          {numberField("pom-total", "Pomodoros in this session", total, setTotal, "totalPomodoros")}
          <div>
            <label className={LABEL_CLASS} htmlFor="pom-start">
              Session start time
            </label>
            <input
              id="pom-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pom-volume">
              Cue volume
            </label>
            <input
              id="pom-volume"
              className="mt-4 h-2 w-full accent-[var(--primary)]"
              type="range"
              min="0.02"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => setVolume(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              onClick={() => setSoundOn((value) => !value)}
              aria-pressed={soundOn}
              className={GHOST_BTN}
            >
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              {soundOn ? "Cues on" : "Cues off"}
            </button>
            <button
              type="button"
              onClick={() => playCue("focus")}
              aria-label={soundOn ? "Play a test cue tone" : "Play a test cue tone (turn Cues on first)"}
              disabled={!soundOn}
              className={`${GHOST_BTN} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Test cue
            </button>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {session.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              aria-live="polite"
              role="status"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              {hasError ? "Current phase" : state.finished ? "Session complete" : state.phase.label}
            </p>
            <p className="mt-1 font-mono text-5xl font-semibold text-[var(--primary)] tabular-nums">
              {hasError ? DASH : formatClock(state.remainingSeconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the settings to build a session."
                : `${formatClock(state.sessionRemainingSeconds)} left in the whole session`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleRun}
              aria-label={running ? "Pause the timer" : "Start the timer"}
              className={PRIMARY_BTN}
            >
              {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {running ? "Pause" : "Start"}
            </button>
            <button type="button" onClick={skipPhase} aria-label="Skip to the next phase" className={GHOST_BTN}>
              <SkipForward className="h-4 w-4" aria-hidden="true" />
              Skip
            </button>
            <button type="button" onClick={reset} aria-label="Reset the timer and settings" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button type="button" onClick={copyResult} aria-label="Copy the session plan" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
          </div>
        </div>

        <div
          className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasError ? "No session" : `Session ${Math.round(state.sessionProgressPercent)} percent complete`}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${hasError ? 0 : state.sessionProgressPercent}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total session length", hasError ? DASH : formatClock(session.totalSeconds)],
            ["Focus time", hasError ? DASH : formatClock(session.focusSeconds)],
            ["Break time", hasError ? DASH : formatClock(session.breakSeconds)],
            ["Focus share", hasError ? DASH : `${session.focusSharePercent.toFixed(1)}%`],
            [
              "Breaks",
              hasError
                ? DASH
                : `${session.shortBreakCount} short, ${session.longBreakCount} long`,
            ],
            [
              "Finishes at",
              hasError || !ending || ending.error
                ? DASH
                : `${ending.time}${dayRolloverLabel(ending.dayRollover)}`,
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
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Session timeline</h2>
          <div className="mt-3 max-h-80 overflow-y-auto overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Starts</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Phase</th>
                  <th scope="col" className="py-2 text-right font-semibold">Length</th>
                </tr>
              </thead>
              <tbody>
                {session.phases.map((phase) => (
                  <tr
                    key={phase.index}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      !state.finished && state.phaseIndex === phase.index ? "text-[var(--primary)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 font-mono tabular-nums">{formatClock(phase.startSeconds)}</td>
                    <td className="py-2 pr-3 font-semibold">{phase.label}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {formatClock(phase.durationSeconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Tones are generated in the browser with the Web Audio API — nothing is downloaded and no
        audio leaves your device. Browsers only allow sound after you interact with the page, so
        press Start or Test cue once to enable it.
      </p>
    </main>
  );
}
