"use client";

import { useEffect, useMemo, useState } from "react";
import { Armchair, Check, Copy, Pause, Play, RotateCcw } from "lucide-react";

import {
  BREAK_TYPES,
  buildBreakSchedule,
  formatSeconds,
  nextEventAfter,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  session: "180",
  eyeInterval: "20",
  postureInterval: "30",
  standInterval: "60",
};

const DASH = "—";

export default function ToolHome() {
  const [session, setSession] = useState(DEFAULTS.session);
  const [eyeInterval, setEyeInterval] = useState(DEFAULTS.eyeInterval);
  const [postureInterval, setPostureInterval] = useState(DEFAULTS.postureInterval);
  const [standInterval, setStandInterval] = useState(DEFAULTS.standInterval);
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const schedule = useMemo(
    () =>
      buildBreakSchedule({
        sessionMinutes: session.trim() === "" ? Number.NaN : Number(session),
        eyeIntervalMin: Number(eyeInterval),
        postureIntervalMin: Number(postureInterval),
        standIntervalMin: Number(standInterval),
      }),
    [session, eyeInterval, postureInterval, standInterval],
  );

  const hasError = Boolean(schedule.error);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const next = hasError ? null : nextEventAfter(schedule, elapsed);
  const sessionOver = !hasError && running !== undefined && next === null && elapsed > 0;

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Study break schedule for a ${NUM.format(schedule.sessionMinutes)} minute session`,
      `Eye breaks (20-20-20): ${schedule.counts.eye}`,
      `Posture resets: ${schedule.counts.posture}`,
      `Stand-and-move breaks: ${schedule.counts.stand}`,
      `Total pause time: ${formatSeconds(schedule.totalPauseSeconds)} min`,
      "",
      ...schedule.events.map(
        (event) =>
          `At ${event.minute} min: ${event.types.map((t) => BREAK_TYPES[t].label).join(" + ")} (${formatSeconds(event.pauseSeconds)})`,
      ),
    ];
    return lines.join("\n");
  }, [hasError, schedule]);

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
    setSession(DEFAULTS.session);
    setEyeInterval(DEFAULTS.eyeInterval);
    setPostureInterval(DEFAULTS.postureInterval);
    setStandInterval(DEFAULTS.standInterval);
    setRunning(false);
    setElapsed(0);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Eye breaks (20-20-20 rule)", DASH],
        ["Posture resets", DASH],
        ["Stand-and-move breaks", DASH],
        ["Total pause time", DASH],
      ]
    : [
        ["Eye breaks (20-20-20 rule)", NUM.format(schedule.counts.eye)],
        ["Posture resets", NUM.format(schedule.counts.posture)],
        ["Stand-and-move breaks", NUM.format(schedule.counts.stand)],
        ["Total pause time", `${formatSeconds(schedule.totalPauseSeconds)} min`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Armchair className="h-4 w-4" aria-hidden="true" />
          Exam wellness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Study Posture Break Reminder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Plan posture resets, 20-20-20 eye breaks and stand-up breaks across a long study session,
          then start the timer and let it tell you when each break is due.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="spb-session">
              Session length (minutes)
            </label>
            <input
              id="spb-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="20"
              max="720"
              step="10"
              value={session}
              onChange={(event) => setSession(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spb-eye">
              Eye break every (minutes)
            </label>
            <input
              id="spb-eye"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              step="5"
              value={eyeInterval}
              onChange={(event) => setEyeInterval(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spb-posture">
              Posture reset every (minutes)
            </label>
            <input
              id="spb-posture"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              step="5"
              value={postureInterval}
              onChange={(event) => setPostureInterval(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spb-stand">
              Stand and move every (minutes)
            </label>
            <input
              id="spb-stand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              step="5"
              value={standInterval}
              onChange={(event) => setStandInterval(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
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
              {running || elapsed > 0 ? "Next break" : "Breaks in this session"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : next
                  ? `in ${formatSeconds(next.secondsUntil)}`
                  : sessionOver
                    ? "Done"
                    : NUM.format(
                        schedule.counts.eye + schedule.counts.posture + schedule.counts.stand,
                      )}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a schedule."
                : next
                  ? `${next.event.types.map((t) => BREAK_TYPES[t].label).join(" + ")} at the ${next.event.minute} minute mark. ${BREAK_TYPES[next.event.types[0]].cue}`
                  : sessionOver
                    ? "Session complete — stand up, stretch and take a proper break."
                    : "Press start when you begin studying; the timer counts up and flags each break."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              disabled={hasError}
              aria-label={running ? "Pause the session timer" : "Start the session timer"}
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {running ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
              {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
            </button>
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the break schedule"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy schedule"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs and the timer"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {running || elapsed > 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Elapsed: <span className="font-semibold text-[var(--foreground)]">{formatSeconds(elapsed)}</span>
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Break timeline</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {schedule.events.map((event) => (
              <li
                key={event.minute}
                className="flex items-center justify-between gap-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                <span className="font-semibold">{event.minute} min</span>
                <span className="text-right text-[var(--muted-foreground)]">
                  {event.types.map((t) => BREAK_TYPES[t].label).join(" + ")} ·{" "}
                  {formatSeconds(event.pauseSeconds)}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General wellbeing information, not medical advice. The 20-20-20 rule and hourly movement
        breaks follow common ophthalmology and ergonomics guidance; see a professional for pain
        that persists.
      </p>
    </main>
  );
}
