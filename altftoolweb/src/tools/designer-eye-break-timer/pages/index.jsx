"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Palette, Pause, Play, RotateCcw } from "lucide-react";

import {
  DEFAULT_RESET_SECONDS,
  EYE_BREAK_DISTANCE_METRES,
  EYE_BREAK_SECONDS,
  EYE_RULE_SECONDS,
  PHASE_KINDS,
  VIEWING_NOTES,
  buildDesignerPlan,
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

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [sessionMinutes, setSessionMinutes] = useState("180");
  const [checkIntervalMinutes, setCheckIntervalMinutes] = useState("30");
  const [resetSeconds, setResetSeconds] = useState(String(DEFAULT_RESET_SECONDS));
  const [decisionSeconds, setDecisionSeconds] = useState("120");
  const [resetAtDistance, setResetAtDistance] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [anchor, setAnchor] = useState(null);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(() => {
    const values = {
      sessionMinutes: toNumber(sessionMinutes),
      checkIntervalMinutes: toNumber(checkIntervalMinutes),
      resetSeconds: toNumber(resetSeconds),
      decisionSeconds: toNumber(decisionSeconds),
    };
    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Enter a number in every field." };
    }
    return buildDesignerPlan({ ...values, resetAtDistance });
  }, [sessionMinutes, checkIntervalMinutes, resetSeconds, decisionSeconds, resetAtDistance]);

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
  }, [sessionMinutes, checkIntervalMinutes, resetSeconds, decisionSeconds, resetAtDistance]);

  const current = useMemo(
    () => (hasError ? null : phaseAt(plan.phases, elapsed)),
    [hasError, plan.phases, elapsed],
  );

  const kind = current && current.phase ? current.phase.kind : "";
  const highlighted = kind === PHASE_KINDS.EYE_BREAK || kind === PHASE_KINDS.RESET;

  const toggleRun = () => {
    if (hasError) return;
    if (running) {
      setAnchor(null);
      return;
    }
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
      "Designer eye break and colour reset plan",
      `Session: ${formatClock(plan.totalSeconds)}`,
      `Colour decision every ${plan.workSeconds / 60} minutes (${plan.decisions} in the session)`,
      `Neutral reset before each decision: ${plan.resetSeconds}s${plan.resetCountsAsEyeBreak ? " (distant, also counts as the eye break)" : " (near, does not count as the eye break)"}`,
      `Colour decision window: ${plan.decisionSeconds}s`,
      `Eye breaks scheduled: ${plan.eyeBreaks}`,
      `Total eye rest: ${formatClock(plan.totalEyeRestSeconds)}`,
      `Longest unbroken near-work run: ${plan.longestRunMinutes} minutes`,
      `Reset and break overhead: ${plan.overheadPercent}% of the session`,
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
    setSessionMinutes("180");
    setCheckIntervalMinutes("30");
    setResetSeconds(String(DEFAULT_RESET_SECONDS));
    setDecisionSeconds("120");
    setResetAtDistance(true);
    setAnchor(null);
    setElapsed(0);
    setCopied(false);
  };

  const progressPercent = hasError ? 0 : Math.round(current.overallProgress * 100);

  const fields = [
    { id: "deb-session", label: "Session length (minutes)", value: sessionMinutes, onSet: setSessionMinutes, min: 15, max: 480, step: 15 },
    { id: "deb-interval", label: "Time between colour decisions (minutes)", value: checkIntervalMinutes, onSet: setCheckIntervalMinutes, min: 5, max: 120, step: 5 },
    { id: "deb-reset", label: "Neutral reset (seconds)", value: resetSeconds, onSet: setResetSeconds, min: 10, max: 300, step: 5 },
    { id: "deb-decision", label: "Colour decision window (seconds)", value: decisionSeconds, onSet: setDecisionSeconds, min: 10, max: 600, step: 10 },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Palette className="h-4 w-4" aria-hidden="true" />
          Colour-critical work
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Designer Eye Break Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two clocks run while you design. One is eye strain — {EYE_RULE_SECONDS / 60} minutes of near
          work before you owe your eyes {EYE_BREAK_SECONDS} seconds at{" "}
          {EYE_BREAK_DISTANCE_METRES} m. The other is chromatic adaptation: stare at a strong colour
          cast and your judgement drifts with it, so a neutral reset belongs before every critical
          call.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
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
                inputMode="numeric"
                min={field.min}
                max={field.max}
                step={field.step}
                value={field.value}
                onChange={(event) => field.onSet(event.target.value)}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setResetAtDistance((value) => !value)}
          aria-pressed={resetAtDistance}
          className={`mt-4 min-h-11 w-full rounded-md border px-3 py-2 text-left text-sm transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
            resetAtDistance
              ? "border-[var(--primary)] bg-[var(--primary)]/10"
              : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
          }`}
        >
          <span className="block font-semibold text-[var(--foreground)]">
            {resetAtDistance ? "Reset on a distant neutral surface" : "Reset on a near neutral field"}
          </span>
          <span className="block text-xs text-[var(--muted-foreground)]">
            {resetAtDistance
              ? `A plain grey wall across the room resets your white point and rests accommodation, so it counts as the eye break too.`
              : `A mid-grey screen fill or a grey card on the desk resets colour but is still near work, so eye breaks are scheduled separately.`}
          </span>
        </button>
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
          highlighted ? "bg-[var(--primary)]/10 ring-[var(--primary)]" : "bg-[var(--card)] ring-[var(--border)]"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {hasError ? "Timer unavailable" : current.phase.label}
        </p>
        <p
          className={`mt-1 text-5xl font-semibold tabular-nums ${
            highlighted ? "text-[var(--primary)]" : "text-[var(--foreground)]"
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
            : `${current.decisionsMade} of ${plan.decisions} colour decisions made · ${formatClock(Math.floor(elapsed))} of ${formatClock(plan.totalSeconds)}`}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleRun}
            disabled={hasError}
            aria-label={running ? "Pause the designer break timer" : "Start the designer break timer"}
            className={`${PRIMARY_BTN} disabled:opacity-50`}
          >
            {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
          </button>
          <button type="button" onClick={restart} aria-label="Restart the session" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restart
          </button>
          <button type="button" onClick={copyResult} aria-label="Copy the session plan" className={GHOST_BTN}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy plan"}
          </button>
          <button type="button" onClick={reset} aria-label="Reset every setting" className={GHOST_BTN}>
            Reset all
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What the session costs you</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Colour decisions", hasError ? DASH : WHOLE.format(plan.decisions)],
            ["Decisions per hour", hasError ? DASH : NUM.format(plan.decisionsPerHour)],
            ["Neutral resets", hasError ? DASH : `${WHOLE.format(plan.resets)} x ${plan.resetSeconds}s`],
            ["Eye breaks scheduled", hasError ? DASH : WHOLE.format(plan.eyeBreaks)],
            ["Total eye rest", hasError ? DASH : formatClock(plan.totalEyeRestSeconds)],
            ["Time actually designing", hasError ? DASH : formatClock(plan.workTotal)],
            ["Time on resets and breaks", hasError ? DASH : `${NUM.format(plan.overheadPercent)}% of the session`],
            [
              "Longest unbroken near-work run",
              hasError ? DASH : `${NUM.format(plan.longestRunMinutes)} minutes`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !plan.resetLongEnough && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            A {plan.resetSeconds} second reset is short. Most of the adaptation shift settles within
            about a minute, so {DEFAULT_RESET_SECONDS} seconds on a neutral field is the usual
            working minimum before a decision you intend to stand behind.
          </p>
        )}

        {!hasError && !plan.withinEyeRule && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            The longest near-work run here is {NUM.format(plan.longestRunMinutes)} minutes, past the{" "}
            {EYE_RULE_SECONDS / 60} minute limit.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Keeping your eye neutral</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {VIEWING_NOTES.map((note) => (
            <li key={note} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
              {note}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. A reset habit reduces the drift in your own colour judgement but it is not
        a substitute for a calibrated, profiled display and a controlled viewing environment when
        colour has to be signed off. Persistent eye strain, headaches or blurred vision should be
        checked by an optometrist.
      </p>
    </main>
  );
}
