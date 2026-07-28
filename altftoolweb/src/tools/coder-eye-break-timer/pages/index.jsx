"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Code, Copy, Pause, Play, RotateCcw } from "lucide-react";

import {
  BREAK_DISTANCE_METRES,
  BUILD_PRESETS,
  MIN_BREAK_SECONDS,
  PHASE_KINDS,
  RULE_INTERVAL_SECONDS,
  buildCoderPlan,
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
  const [sessionMinutes, setSessionMinutes] = useState("240");
  const [editMinutes, setEditMinutes] = useState("25");
  const [buildSeconds, setBuildSeconds] = useState("90");
  const [elapsed, setElapsed] = useState(0);
  const [anchor, setAnchor] = useState(null);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(() => {
    const values = {
      sessionMinutes: toNumber(sessionMinutes),
      editMinutes: toNumber(editMinutes),
      buildSeconds: toNumber(buildSeconds),
    };
    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Enter a number in every field." };
    }
    return buildCoderPlan(values);
  }, [sessionMinutes, editMinutes, buildSeconds]);

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
  }, [sessionMinutes, editMinutes, buildSeconds]);

  const current = useMemo(
    () => (hasError ? null : phaseAt(plan.phases, elapsed)),
    [hasError, plan.phases, elapsed],
  );

  const resting =
    current &&
    current.phase &&
    (current.phase.kind === PHASE_KINDS.PROMPT ||
      (current.phase.kind === PHASE_KINDS.BUILD && current.phase.qualifies));

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
      "Coder eye break plan",
      `Session: ${formatClock(plan.totalSeconds)}`,
      `Editing between builds: ${plan.editSeconds / 60} minutes`,
      `Build or test wait: ${plan.waitSeconds} seconds (${plan.waitQualifies ? "counts as a break" : "too short to count as a break"})`,
      `Builds in the session: ${plan.builds} (${plan.buildsPerHour} per hour)`,
      `Breaks supplied by build waits: ${plan.breaksFromBuilds}`,
      `Extra prompted breaks needed: ${plan.prompts}`,
      `Total eye rest available: ${formatClock(plan.eyeRestSeconds)}`,
      `Longest unbroken near-work run: ${plan.longestRunMinutes} minutes`,
      `Build waits cover ${plan.coveragePercent}% of the breaks the rule asks for.`,
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
    setSessionMinutes("240");
    setEditMinutes("25");
    setBuildSeconds("90");
    setAnchor(null);
    setElapsed(0);
    setCopied(false);
  };

  const progressPercent = hasError ? 0 : Math.round(current.overallProgress * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Code className="h-4 w-4" aria-hidden="true" />
          Eye care for developers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Coder Eye Break Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          You already stop every time a build or test suite runs. If that wait is at least{" "}
          {MIN_BREAK_SECONDS} seconds it can serve as your 20-20-20 break — so this works out how many
          of the required breaks your builds already cover, and only prompts for the ones they miss.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ceb-session">
              Session length (minutes)
            </label>
            <input
              id="ceb-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="15"
              max="480"
              step="15"
              value={sessionMinutes}
              onChange={(event) => setSessionMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ceb-edit">
              Editing between builds (minutes)
            </label>
            <input
              id="ceb-edit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="120"
              step="1"
              value={editMinutes}
              onChange={(event) => setEditMinutes(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ceb-build">
              Build or test wait (seconds)
            </label>
            <input
              id="ceb-build"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="1800"
              step="5"
              value={buildSeconds}
              onChange={(event) => setBuildSeconds(event.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {BUILD_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setBuildSeconds(String(preset.seconds))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {preset.name} · {preset.seconds}s
                </button>
              ))}
            </div>
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
          resting ? "bg-[var(--primary)]/10 ring-[var(--primary)]" : "bg-[var(--card)] ring-[var(--border)]"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {hasError ? "Timer unavailable" : current.phase.label}
        </p>
        <p
          className={`mt-1 text-5xl font-semibold tabular-nums ${
            resting ? "text-[var(--primary)]" : "text-[var(--foreground)]"
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
            : `${current.breaksTaken} breaks taken · ${formatClock(Math.floor(elapsed))} of ${formatClock(plan.totalSeconds)}`}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleRun}
            disabled={hasError}
            aria-label={running ? "Pause the coder eye break timer" : "Start the coder eye break timer"}
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
        <h2 className="text-base font-semibold">How your build cycle scores</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Builds in the session", hasError ? DASH : WHOLE.format(plan.builds)],
            ["Builds per hour", hasError ? DASH : NUM.format(plan.buildsPerHour)],
            [
              "Does a build wait count as a break?",
              hasError ? DASH : plan.waitQualifies ? `Yes, it is ${plan.waitSeconds}s` : `No, under ${MIN_BREAK_SECONDS}s`,
            ],
            ["Breaks the rule asks for", hasError ? DASH : WHOLE.format(plan.ruleRequiredBreaks)],
            ["Breaks supplied by build waits", hasError ? DASH : WHOLE.format(plan.breaksFromBuilds)],
            ["Extra prompted breaks scheduled", hasError ? DASH : WHOLE.format(plan.prompts)],
            ["Total eye rest available", hasError ? DASH : formatClock(plan.eyeRestSeconds)],
            ["Time spent waiting on builds", hasError ? DASH : formatClock(plan.waitTotal)],
            [
              "Longest unbroken near-work run",
              hasError ? DASH : `${NUM.format(plan.longestRunMinutes)} minutes`,
            ],
            ["Build waits cover", hasError ? DASH : `${WHOLE.format(plan.coveragePercent)}% of the requirement`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !plan.waitQualifies && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            A {plan.waitSeconds} second wait is shorter than the {MIN_BREAK_SECONDS} second break the
            rule asks for, so it does not reset the near-work clock. Every break in this schedule has
            to be a deliberate one.
          </p>
        )}
      </section>

      {!hasError && plan.phases.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">First blocks of the schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Starts at</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Block</th>
                  <th scope="col" className="py-2 text-right font-semibold">Length</th>
                </tr>
              </thead>
              <tbody>
                {plan.phases.slice(0, 12).map((phase, index) => {
                  const startsAt = plan.phases
                    .slice(0, index)
                    .reduce((sum, item) => sum + item.seconds, 0);
                  return (
                    <tr key={`${phase.kind}-${index}`} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 tabular-nums text-[var(--muted-foreground)]">
                        {formatClock(startsAt)}
                      </td>
                      <td className="py-2 pr-3 font-semibold">{phase.label}</td>
                      <td className="py-2 text-right tabular-nums">{formatClock(phase.seconds)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {plan.phases.length > 12 && (
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Showing the first 12 of {plan.phases.length} blocks. The pattern repeats to the end of
              the session.
            </p>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Making the wait count</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {[
            `A build wait only helps if you look away from the screen. Watching the log scroll is still near work — turn to a window about ${BREAK_DISTANCE_METRES} m away instead.`,
            `The near-work clock resets only when you actually break. Twenty minutes is ${RULE_INTERVAL_SECONDS / 60} minutes of screen time, not of wall-clock time at your desk.`,
            "Hot-reload workflows give almost no natural pauses, so they need the most prompted breaks — a fast feedback loop is good for code and bad for eyes.",
            "Dark mode does not remove the need for breaks. The strain comes from sustained near focus and a halved blink rate, not from screen brightness alone.",
          ].map((tip) => (
            <li key={tip} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Breaks help with the tired, dry, aching feeling of long screen days, but
        persistent headaches, blurred vision or eye pain deserve a proper eye examination — an
        uncorrected prescription is a common and easily fixed cause.
      </p>
    </main>
  );
}
