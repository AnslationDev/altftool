"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, Star, Timer } from "lucide-react";
import {
  SESSIONS_PER_DAY,
  TOOTHPASTE_GUIDE,
  TOTAL_SECONDS,
  buildBrushingPlan,
  computeStreak,
  formatClock,
  progressAt,
} from "../lib";

const DASH = "—";
const SEED_TODAY = "2026-07-28";
const LENGTH_CHOICES = [60, 90, 120, 180];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function isoFor(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function ToolHome() {
  const [sessionSeconds, setSessionSeconds] = useState(String(TOTAL_SECONDS));
  const [includeTongue, setIncludeTongue] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [todayIso, setTodayIso] = useState(SEED_TODAY);
  const [brushedDays, setBrushedDays] = useState([]);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTodayIso(isoFor(new Date()));
  }, []);

  const plan = useMemo(
    () => buildBrushingPlan({ totalSeconds: Number(sessionSeconds), includeTongue }),
    [sessionSeconds, includeTongue],
  );
  const planError = plan.error || null;

  const progress = useMemo(() => (planError ? null : progressAt(plan, elapsed)), [plan, planError, elapsed]);

  useEffect(() => {
    if (!running || planError) return undefined;
    const id = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [running, planError]);

  useEffect(() => {
    if (planError || !progress || !progress.finished || !running) return;
    setRunning(false);
    setSessionsToday((value) => value + 1);
    setBrushedDays((prev) => (prev.includes(todayIso) ? prev : [...prev, todayIso]));
  }, [planError, progress, running, todayIso]);

  const streak = useMemo(() => computeStreak(brushedDays, todayIso), [brushedDays, todayIso]);

  const restart = () => {
    setElapsed(0);
    setRunning(false);
  };

  const resetAll = () => {
    setSessionSeconds(String(TOTAL_SECONDS));
    setIncludeTongue(true);
    setElapsed(0);
    setRunning(false);
    setBrushedDays([]);
    setSessionsToday(0);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (planError || !progress) return "";
    return [
      "Kids Brushing Timer",
      `Session: ${formatClock(plan.totalSeconds)} across ${plan.segments.length} steps`,
      ...plan.segments.map(
        (segment) => `- ${segment.label}: ${formatClock(segment.durationSec)} (${segment.startSec}s to ${segment.endSec}s)`,
      ),
      "",
      `Progress: ${progress.percent}% · ${formatClock(progress.remainingTotal)} left`,
      `Sessions finished today: ${sessionsToday} of ${SESSIONS_PER_DAY} recommended`,
      `Brushing streak: ${streak.streak} day(s)${streak.badge ? ` · badge: ${streak.badge.label}` : ""}`,
      "",
      "Brush twice a day with fluoride toothpaste, last thing at night. Spit, do not rinse.",
    ].join("\n");
  }, [planError, plan, progress, sessionsToday, streak]);

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
          <Timer className="h-4 w-4" aria-hidden="true" />
          Dental care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Kids Brushing Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two minutes is a long time when you are seven. This timer splits the session into four
          mouth quadrants with a prompt for each, so no corner gets thirty seconds and the rest five.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kbt-length">
              Session length
            </label>
            <select
              id="kbt-length"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sessionSeconds}
              onChange={(event) => {
                setSessionSeconds(event.target.value);
                setElapsed(0);
                setRunning(false);
              }}
            >
              {LENGTH_CHOICES.map((choice) => (
                <option key={choice} value={String(choice)}>
                  {formatClock(choice)}
                  {choice === TOTAL_SECONDS ? " (recommended)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className={LABEL_CLASS}>Extra step</span>
            <label
              className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              htmlFor="kbt-tongue"
            >
              <input
                id="kbt-tongue"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={includeTongue}
                onChange={(event) => {
                  setIncludeTongue(event.target.checked);
                  setElapsed(0);
                  setRunning(false);
                }}
              />
              Add a tongue-brushing step
            </label>
          </div>
        </div>
      </section>

      {planError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {planError}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Time left
            </p>
            <p className="mt-1 text-5xl font-semibold tabular-nums text-[var(--primary)]">
              {planError ? DASH : formatClock(progress.remainingTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {planError
                ? DASH
                : progress.finished
                  ? "Session complete — well brushed."
                  : `Step ${progress.stepNumber} of ${progress.stepCount}: ${progress.segment.label} · ${formatClock(progress.remainingInSegment)} left here`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the brushing session summary"
              className={GHOST_BTN}
              disabled={Boolean(planError)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={resetAll} aria-label="Reset the timer and streak" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <p className="mt-4 min-h-12 text-sm leading-6 text-[var(--foreground)]">
          {planError ? DASH : progress.finished ? "Spit out the toothpaste and do not rinse with water — the leftover fluoride keeps working." : progress.segment.tip}
        </p>

        <div className="mt-4">
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={planError ? "Progress unavailable" : `${progress.percent} percent of the session done`}
          >
            <span
              className="block h-full bg-[var(--primary)] transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${planError ? 0 : progress.percent}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRunning((value) => !value)}
            className={PRIMARY_BTN}
            disabled={Boolean(planError)}
            aria-label={running ? "Pause the brushing timer" : "Start the brushing timer"}
          >
            {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {running ? "Pause" : elapsed === 0 ? "Start brushing" : "Resume"}
          </button>
          <button type="button" onClick={restart} className={GHOST_BTN} aria-label="Restart this session from zero">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restart session
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2" aria-label="Stars earned this session">
          {(planError ? [] : plan.segments).map((segment, index) => (
            <Star
              key={segment.key}
              className={`h-6 w-6 ${!planError && index < progress.completedSteps ? "fill-[var(--primary)] text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}
              aria-hidden="true"
            />
          ))}
          <span className="text-sm text-[var(--muted-foreground)]">
            {planError ? DASH : `${progress.completedSteps} of ${plan.segments.length} steps done`}
          </span>
        </div>
      </section>

      {!planError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Rewards</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Sessions finished today", `${sessionsToday} of ${SESSIONS_PER_DAY} recommended`],
                ["Brushing streak", `${streak.streak} day${streak.streak === 1 ? "" : "s"}`],
                ["Badge unlocked", streak.badge ? streak.badge.label : "Finish a session to start the streak"],
                ["Days logged in total", String(streak.totalDays)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              The streak lives in this browser tab only and clears when you reload or press Reset.
            </p>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Session steps</h2>
            <ol className="mt-3 space-y-2">
              {plan.segments.map((segment, index) => (
                <li
                  key={segment.key}
                  className={`rounded-lg border p-3 ${index === progress.index && !progress.finished ? "border-[var(--primary)]" : "border-[var(--border)]"}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {index + 1}. {segment.label}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">{formatClock(segment.durationSec)}</p>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{segment.tip}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">How much toothpaste</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Age</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Amount</th>
                    <th scope="col" className="py-2 font-semibold">Fluoride strength</th>
                  </tr>
                </thead>
                <tbody>
                  {TOOTHPASTE_GUIDE.map((row) => (
                    <tr key={row.ages} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-medium">{row.ages}</td>
                      <td className="py-2 pr-3">{row.amount}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">{row.fluoride}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General dental hygiene guidance, not personal advice. Young children need an adult to brush
        for them or supervise until around age seven. Ask your dentist about fluoride strength,
        varnish and any child who swallows toothpaste.
      </p>
    </main>
  );
}
