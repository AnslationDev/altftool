"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Check, Copy, Eye, Pause, Play, RotateCcw } from "lucide-react";

import {
  BREAK_SECONDS,
  DISTANCE_FEET,
  OPTICAL_INFINITY_METRES,
  PHASE_KINDS,
  RESTING_BLINK_RATE_PER_MIN,
  SCREEN_BLINK_RATE_PER_MIN,
  WORK_INTERVAL_MINUTES,
  buildTwentyPlan,
  feetToMetres,
  formatClock,
  phaseAt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const WHOLE = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** Module-level so a single AudioContext is reused across renders. */
let sharedAudioContext = null;

function chime(pitch) {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!sharedAudioContext) sharedAudioContext = new Ctx();
    const ctx = sharedAudioContext;
    if (ctx.state === "suspended") ctx.resume();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = pitch;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio is a nicety; silence is an acceptable fallback.
  }
}

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [sessionMinutes, setSessionMinutes] = useState("120");
  const [workMinutes, setWorkMinutes] = useState(String(WORK_INTERVAL_MINUTES));
  const [breakSeconds, setBreakSeconds] = useState(String(BREAK_SECONDS));
  const [sound, setSound] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [anchor, setAnchor] = useState(null);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(() => {
    const values = {
      sessionMinutes: toNumber(sessionMinutes),
      workMinutes: toNumber(workMinutes),
      breakSeconds: toNumber(breakSeconds),
    };
    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Enter a number in every field." };
    }
    return buildTwentyPlan(values);
  }, [sessionMinutes, workMinutes, breakSeconds]);

  const hasError = Boolean(plan.error);
  const totalSeconds = hasError ? 0 : plan.totalSeconds;
  const running = Boolean(anchor);

  useEffect(() => {
    if (!anchor) return undefined;
    const id = setInterval(() => {
      const next = anchor.base + (Date.now() - anchor.at) / 1000;
      setElapsed(next > totalSeconds ? totalSeconds : next);
    }, 200);
    return () => clearInterval(id);
  }, [anchor, totalSeconds]);

  useEffect(() => {
    if (anchor && elapsed >= totalSeconds) setAnchor(null);
  }, [anchor, elapsed, totalSeconds]);

  useEffect(() => {
    setAnchor(null);
    setElapsed(0);
  }, [sessionMinutes, workMinutes, breakSeconds]);

  const current = useMemo(
    () => (hasError ? null : phaseAt(plan.phases, elapsed)),
    [hasError, plan.phases, elapsed],
  );

  const phaseIndex = current ? current.index : -1;
  const phaseKind = current && current.phase ? current.phase.kind : "";

  useEffect(() => {
    if (!sound || !running || phaseIndex <= 0) return;
    chime(phaseKind === PHASE_KINDS.BREAK ? 880 : 523.25);
  }, [phaseIndex, phaseKind, sound, running]);

  const toggleRun = () => {
    if (hasError) return;
    if (running) {
      setAnchor(null);
      return;
    }
    if (sound) chime(659.25);
    const base = elapsed >= totalSeconds ? 0 : elapsed;
    setElapsed(base);
    setAnchor({ at: Date.now(), base });
  };

  const restart = () => {
    setAnchor(null);
    setElapsed(0);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "20-20-20 eye break plan",
      `Session: ${formatClock(plan.totalSeconds)}`,
      `Work interval: ${plan.workSeconds / 60} minutes`,
      `Break: ${plan.restSeconds} seconds looking about ${feetToMetres(DISTANCE_FEET)} m away`,
      `Breaks in the session: ${plan.breaks} (${plan.breaksPerHour} per hour)`,
      `Total eye rest: ${formatClock(plan.breakTotalSeconds)}`,
      `Screen time: ${formatClock(plan.screenSeconds)}`,
      plan.followsRule
        ? "This schedule keeps to the 20-20-20 rule."
        : "This schedule is looser than the 20-20-20 rule.",
    ].join("\n");
  }, [hasError, plan]);

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
    setSessionMinutes("120");
    setWorkMinutes(String(WORK_INTERVAL_MINUTES));
    setBreakSeconds(String(BREAK_SECONDS));
    setSound(true);
    setAnchor(null);
    setElapsed(0);
    setCopied(false);
  };

  const onBreak = phaseKind === PHASE_KINDS.BREAK;
  const progressPercent = hasError ? 0 : Math.round(current.overallProgress * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Eye care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">20-20-20 Eye Break Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every {WORK_INTERVAL_MINUTES} minutes of screen work, look at something about{" "}
          {DISTANCE_FEET} feet ({feetToMetres(DISTANCE_FEET)} m) away for {BREAK_SECONDS} seconds.
          Beyond roughly {OPTICAL_INFINITY_METRES} m the focusing muscle is effectively at rest —
          that is the whole point of the distance.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ebt-session">
              Session length (minutes)
            </label>
            <input
              id="ebt-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="480"
              step="5"
              value={sessionMinutes}
              onChange={(event) => setSessionMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ebt-work">
              Work interval (minutes)
            </label>
            <input
              id="ebt-work"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="60"
              step="1"
              value={workMinutes}
              onChange={(event) => setWorkMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ebt-break">
              Break length (seconds)
            </label>
            <input
              id="ebt-break"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="120"
              step="5"
              value={breakSeconds}
              onChange={(event) => setBreakSeconds(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setSound((value) => !value)}
              aria-pressed={sound}
              aria-label="Toggle the break chime"
              className={`${GHOST_BTN} w-full`}
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {sound ? "Chime on" : "Chime off"}
            </button>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section
        className={`mt-6 rounded-xl p-5 ring-1 ${
          onBreak ? "bg-[var(--primary)]/10 ring-[var(--primary)]" : "bg-[var(--card)] ring-[var(--border)]"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {hasError ? "Timer unavailable" : current.phase.label}
        </p>
        <p
          className={`mt-1 text-5xl font-semibold tabular-nums ${
            onBreak ? "text-[var(--primary)]" : "text-[var(--foreground)]"
          }`}
        >
          {hasError ? DASH : formatClock(Math.ceil(current.remaining))}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError ? "Fix the inputs above to start the timer." : current.phase.hint}
        </p>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
          aria-label="Session progress"
        >
          <span
            className="block h-full bg-[var(--primary)] transition-[width] duration-200 motion-reduce:transition-none"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          {hasError
            ? DASH
            : `${current.breaksTaken} of ${plan.breaks} breaks taken · ${formatClock(Math.floor(elapsed))} of ${formatClock(plan.totalSeconds)}`}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleRun}
            disabled={hasError}
            aria-label={running ? "Pause the eye break timer" : "Start the eye break timer"}
            className={`${PRIMARY_BTN} disabled:opacity-50`}
          >
            {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
          </button>
          <button type="button" onClick={restart} aria-label="Restart the session" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restart
          </button>
          <button type="button" onClick={copyResult} aria-label="Copy the break plan" className={GHOST_BTN}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy plan"}
          </button>
          <button type="button" onClick={reset} aria-label="Reset every setting" className={GHOST_BTN}>
            Reset all
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What this session adds up to</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Breaks in the session", hasError ? DASH : WHOLE.format(plan.breaks)],
            ["Breaks per hour", hasError ? DASH : NUM.format(plan.breaksPerHour)],
            ["Total eye rest", hasError ? DASH : formatClock(plan.breakTotalSeconds)],
            ["Screen time", hasError ? DASH : formatClock(plan.screenSeconds)],
            ["Rest as a share of the session", hasError ? DASH : `${NUM.format(plan.restSharePercent)}%`],
            [
              "Longest unbroken stretch",
              hasError ? DASH : `${NUM.format(plan.longestUnbrokenMinutes)} minutes`,
            ],
            [
              "Blinks missed at screen blink rate",
              hasError ? DASH : `about ${WHOLE.format(plan.blinksLostEstimate)}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !plan.followsRule && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            This schedule is looser than the rule: 20-20-20 means a work interval no longer than{" "}
            {WORK_INTERVAL_MINUTES} minutes and a break of at least {BREAK_SECONDS} seconds.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Getting the break right</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {[
            `Distance beats duration: anything past about ${OPTICAL_INFINITY_METRES} m relaxes accommodation, so a window, a corridor or across a large room all work. A wall two metres away does not.`,
            `Blink hard a few times during the break. Blink rate falls from around ${RESTING_BLINK_RATE_PER_MIN} a minute at rest to roughly ${SCREEN_BLINK_RATE_PER_MIN} while you concentrate, and incomplete blinks leave the tear film thin.`,
            "Close your eyes fully for a couple of the twenty seconds if they feel gritty — that spreads the tear film better than staring into the distance alone.",
            "The rule addresses eye strain and dryness, not posture. Stand up on some of the breaks so the rest of you benefits too.",
          ].map((tip) => (
            <li key={tip} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Regular breaks ease the tired, dry, achy feeling of prolonged screen work,
        but persistent blurred vision, headaches, double vision or eye pain need an eye examination —
        they can point to an uncorrected prescription or another treatable cause.
      </p>
    </main>
  );
}
