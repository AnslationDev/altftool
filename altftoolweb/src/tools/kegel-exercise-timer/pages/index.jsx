"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, Timer } from "lucide-react";

import {
  GUIDELINE_DAILY_CONTRACTIONS,
  GUIDELINE_PROGRAMME_WEEKS,
  GUIDELINE_REPS_PER_SESSION,
  GUIDELINE_SESSIONS_PER_DAY,
  LEVELS,
  PHASE_KINDS,
  buildKegelPlan,
  formatClock,
  phaseAt,
} from "../lib";

const COUNT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_LEVEL = LEVELS[1];
const DASH = "—";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [levelId, setLevelId] = useState(DEFAULT_LEVEL.id);
  const [hold, setHold] = useState(String(DEFAULT_LEVEL.hold));
  const [release, setRelease] = useState(String(DEFAULT_LEVEL.rest));
  const [reps, setReps] = useState(String(DEFAULT_LEVEL.reps));
  const [sets, setSets] = useState(String(DEFAULT_LEVEL.sets));
  const [setBreak, setSetBreak] = useState(String(DEFAULT_LEVEL.setRest));
  const [prep, setPrep] = useState("5");
  const [sessions, setSessions] = useState(String(GUIDELINE_SESSIONS_PER_DAY));

  const [elapsed, setElapsed] = useState(0);
  const [anchor, setAnchor] = useState(null);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(() => {
    const values = {
      hold: toNumber(hold),
      rest: toNumber(release),
      reps: toNumber(reps),
      sets: toNumber(sets),
      setRest: toNumber(setBreak),
      prep: toNumber(prep),
      sessionsPerDay: toNumber(sessions),
    };
    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Enter a number in every field." };
    }
    return buildKegelPlan(values);
  }, [hold, release, reps, sets, setBreak, prep, sessions]);

  const hasError = Boolean(plan.error);
  const totalSeconds = hasError ? 0 : plan.totalSeconds;

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
  }, [hold, release, reps, sets, setBreak, prep]);

  const running = Boolean(anchor);
  const current = useMemo(
    () => (hasError ? null : phaseAt(plan.phases, elapsed)),
    [hasError, plan.phases, elapsed],
  );

  const applyLevel = (id) => {
    const level = LEVELS.find((item) => item.id === id);
    if (!level) return;
    setLevelId(level.id);
    setHold(String(level.hold));
    setRelease(String(level.rest));
    setReps(String(level.reps));
    setSets(String(level.sets));
    setSetBreak(String(level.setRest));
  };

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

  const restartTimer = () => {
    setAnchor(null);
    setElapsed(0);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Kegel Exercise Timer",
      `Hold ${plan.hold}s / release ${plan.rest}s`,
      `${plan.reps} reps x ${plan.sets} sets = ${plan.repsPerSession} contractions per session`,
      `Session length: ${formatClock(plan.totalSeconds)}`,
      `Sessions per day: ${plan.sessionsPerDay}`,
      `Daily contractions: ${plan.dailyContractions}`,
      `Weekly contractions: ${plan.weeklyContractions}`,
      `${GUIDELINE_PROGRAMME_WEEKS}-week programme total: ${plan.programmeContractions}`,
      plan.meetsGuideline
        ? `Meets the reference programme of ${GUIDELINE_DAILY_CONTRACTIONS} contractions a day.`
        : `${plan.guidelineGap} contractions a day short of the reference ${GUIDELINE_DAILY_CONTRACTIONS} a day.`,
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

  const resetAll = () => {
    applyLevel(DEFAULT_LEVEL.id);
    setPrep("5");
    setSessions(String(GUIDELINE_SESSIONS_PER_DAY));
    setAnchor(null);
    setElapsed(0);
    setCopied(false);
  };

  const phaseTone = (() => {
    if (!current || !current.phase) return "text-[var(--muted-foreground)]";
    if (current.phase.kind === PHASE_KINDS.HOLD) return "text-[var(--primary)]";
    if (current.phase.kind === PHASE_KINDS.DONE) return "text-[var(--success)]";
    return "text-[var(--foreground)]";
  })();

  const progressPercent = hasError ? 0 : Math.round(current.overallProgress * 100);

  const fields = [
    { id: "kegel-hold", label: "Hold (seconds)", value: hold, onSet: setHold, min: 1, max: 30, step: 1 },
    { id: "kegel-release", label: "Release (seconds)", value: release, onSet: setRelease, min: 0, max: 60, step: 1 },
    { id: "kegel-reps", label: "Repetitions per set", value: reps, onSet: setReps, min: 1, max: 50, step: 1 },
    { id: "kegel-sets", label: "Sets per session", value: sets, onSet: setSets, min: 1, max: 10, step: 1 },
    { id: "kegel-setbreak", label: "Rest between sets (seconds)", value: setBreak, onSet: setSetBreak, min: 0, max: 300, step: 5 },
    { id: "kegel-prep", label: "Get-ready countdown (seconds)", value: prep, onSet: setPrep, min: 0, max: 60, step: 1 },
    { id: "kegel-sessions", label: "Sessions per day", value: sessions, onSet: setSessions, min: 1, max: 6, step: 1 },
  ];

  const activeLevel = LEVELS.find((level) => level.id === levelId);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Pelvic floor training
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Kegel Exercise Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A guided squeeze-and-release timer built on the standard pelvic floor muscle training
          prescription: at least {GUIDELINE_REPS_PER_SESSION} contractions,{" "}
          {GUIDELINE_SESSIONS_PER_DAY} times a day, kept up for {GUIDELINE_PROGRAMME_WEEKS} weeks.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Progression level</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {LEVELS.map((level) => {
            const active = level.id === levelId;
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => applyLevel(level.id)}
                aria-pressed={active}
                className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                <span className="block font-semibold text-[var(--foreground)]">{level.name}</span>
                <span className="block text-xs">
                  {level.weeks} · {level.hold}s hold / {level.rest}s release · {level.reps} x{" "}
                  {level.sets}
                </span>
              </button>
            );
          })}
        </div>
        {activeLevel && (
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{activeLevel.note}</p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {hasError ? "Timer unavailable" : current.phase.label}
        </p>
        <p className={`mt-1 text-5xl font-semibold tabular-nums ${phaseTone}`}>
          {hasError ? DASH : formatClock(Math.ceil(current.remaining))}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError
            ? "Fix the inputs above to start the timer."
            : current.done
              ? current.phase.hint
              : `${current.phase.hint} · Set ${Math.max(1, current.phase.set)} of ${plan.sets}`}
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
            : `${formatClock(Math.floor(elapsed))} of ${formatClock(plan.totalSeconds)} elapsed`}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleRun}
            disabled={hasError}
            aria-label={running ? "Pause the Kegel timer" : "Start the Kegel timer"}
            className={`${PRIMARY_BTN} disabled:opacity-50`}
          >
            {running ? (
              <Pause className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
            {running ? "Pause" : elapsed > 0 ? "Resume" : "Start session"}
          </button>
          <button
            type="button"
            onClick={restartTimer}
            aria-label="Restart the session from the beginning"
            className={GHOST_BTN}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restart
          </button>
          <button type="button" onClick={copyResult} aria-label="Copy the session plan" className={GHOST_BTN}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy plan"}
          </button>
          <button type="button" onClick={resetAll} aria-label="Reset every setting" className={GHOST_BTN}>
            Reset all
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your programme</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Contractions per session", hasError ? DASH : COUNT.format(plan.repsPerSession)],
            ["Session length", hasError ? DASH : formatClock(plan.totalSeconds)],
            [
              "Time under contraction per session",
              hasError ? DASH : formatClock(plan.contractionSeconds),
            ],
            ["Daily training time", hasError ? DASH : formatClock(plan.dailySeconds)],
            ["Contractions per day", hasError ? DASH : COUNT.format(plan.dailyContractions)],
            ["Contractions per week", hasError ? DASH : COUNT.format(plan.weeklyContractions)],
            [
              `Contractions over ${GUIDELINE_PROGRAMME_WEEKS} weeks`,
              hasError ? DASH : COUNT.format(plan.programmeContractions),
            ],
            ["Release to hold ratio", hasError ? DASH : `${plan.restToHoldRatio.toFixed(1)} : 1`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              plan.meetsGuideline
                ? "bg-[var(--primary)]/10 text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {plan.meetsGuideline
              ? `This plan reaches the reference programme of ${GUIDELINE_DAILY_CONTRACTIONS} contractions a day.`
              : `This plan is ${plan.guidelineGap} contractions a day below the reference programme of ${GUIDELINE_DAILY_CONTRACTIONS} a day.`}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Pelvic floor training does not suit every symptom — pelvic pain, an
        overactive or non-relaxing pelvic floor and post-surgical recovery all need individual
        assessment. Speak to a doctor or a pelvic health physiotherapist before starting, and stop if
        the exercises hurt.
      </p>
    </main>
  );
}
