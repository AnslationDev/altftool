"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Headphones, Pause, Play, RotateCcw } from "lucide-react";

import {
  DEFAULT_BREAK_MINUTES,
  DEFAULT_LISTEN_MINUTES,
  MAX_BREAK_MINUTES,
  MAX_LEVEL_DB,
  MAX_LISTEN_MINUTES,
  MAX_SESSION_MINUTES,
  MIN_BREAK_MINUTES,
  MIN_LEVEL_DB,
  MIN_LISTEN_MINUTES,
  SECONDS_PER_MINUTE,
  buildSchedule,
  doseUsed,
  formatClock,
  timerState,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULTS = {
  sessionMinutes: "180",
  listenMinutes: String(DEFAULT_LISTEN_MINUTES),
  breakMinutes: String(DEFAULT_BREAK_MINUTES),
  levelDb: "85",
};

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
  const [sessionMinutes, setSessionMinutes] = useState(DEFAULTS.sessionMinutes);
  const [listenMinutes, setListenMinutes] = useState(DEFAULTS.listenMinutes);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULTS.breakMinutes);
  const [levelDb, setLevelDb] = useState(DEFAULTS.levelDb);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const [copied, setCopied] = useState(false);

  const numbers = useMemo(
    () => ({
      sessionMinutes: toNumber(sessionMinutes),
      listenMinutes: toNumber(listenMinutes),
      breakMinutes: toNumber(breakMinutes),
      levelDb: toNumber(levelDb),
    }),
    [sessionMinutes, listenMinutes, breakMinutes, levelDb],
  );

  const schedule = useMemo(
    () =>
      buildSchedule({
        sessionMinutes: numbers.sessionMinutes,
        listenMinutes: numbers.listenMinutes,
        breakMinutes: numbers.breakMinutes,
      }),
    [numbers],
  );

  const levelValid =
    Number.isFinite(numbers.levelDb) &&
    numbers.levelDb >= MIN_LEVEL_DB &&
    numbers.levelDb <= MAX_LEVEL_DB;

  const error = schedule.error
    ? schedule.error
    : !levelValid
      ? `Listening level must be between ${MIN_LEVEL_DB} and ${MAX_LEVEL_DB} dB(A).`
      : null;

  const state = useMemo(() => {
    if (error) return { error };
    return timerState({
      elapsedSeconds: elapsed,
      listenSeconds: numbers.listenMinutes * SECONDS_PER_MINUTE,
      breakSeconds: numbers.breakMinutes * SECONDS_PER_MINUTE,
      sessionSeconds: numbers.sessionMinutes * SECONDS_PER_MINUTE,
    });
  }, [error, elapsed, numbers]);

  const ok = !error && !state.error;

  useEffect(() => {
    if (!running || !anchor) return undefined;
    const id = setInterval(() => {
      setElapsed(anchor.base + Math.floor((Date.now() - anchor.startedAt) / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [running, anchor]);

  useEffect(() => {
    if (ok && state.done && running) {
      setRunning(false);
      setAnchor(null);
    }
  }, [ok, state.done, running]);

  const start = () => {
    setAnchor({ startedAt: Date.now(), base: elapsed });
    setRunning(true);
  };
  const pause = () => {
    setRunning(false);
    setAnchor(null);
  };
  const restartTimer = () => {
    setRunning(false);
    setAnchor(null);
    setElapsed(0);
  };
  const resetAll = () => {
    setSessionMinutes(DEFAULTS.sessionMinutes);
    setListenMinutes(DEFAULTS.listenMinutes);
    setBreakMinutes(DEFAULTS.breakMinutes);
    setLevelDb(DEFAULTS.levelDb);
    restartTimer();
    setCopied(false);
  };

  const dose = ok ? doseUsed(schedule.listeningMinutes, numbers.levelDb) : null;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Headphone Listening Break Timer",
      `Session: ${NUM.format(schedule.sessionMinutes)} min`,
      `Cycle: ${NUM.format(numbers.listenMinutes)} min listening + ${NUM.format(numbers.breakMinutes)} min rest`,
      `Listening blocks: ${NUM.format(schedule.listenBlockCount)} · rest breaks: ${NUM.format(schedule.breakCount)}`,
      `Total listening time: ${NUM.format(schedule.listeningMinutes)} min`,
      `Total rest time: ${NUM.format(schedule.breakMinutes)} min`,
      dose
        ? `At ${NUM.format(numbers.levelDb)} dB(A) this uses ${NUM1.format(dose.usedPercent)}% of the daily WHO-ITU sound allowance (${NUM.format(dose.allowanceMinutes)} min).`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, schedule, numbers, dose]);

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

  const phaseLabel = !ok
    ? DASH
    : state.phase === "listen"
      ? "Listening"
      : state.phase === "break"
        ? "Rest your ears"
        : "Session complete";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Headphones className="h-4 w-4" aria-hidden="true" />
          Hearing health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Headphone Listening Break Timer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Runs a long headphone session as repeating listen-and-rest blocks, then shows how much of
          the WHO-ITU daily sound allowance your listening time uses at the level you set.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hbt-session">
              Session length (minutes)
            </label>
            <input
              id="hbt-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_SESSION_MINUTES}
              step="15"
              value={sessionMinutes}
              onChange={(event) => setSessionMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hbt-level">
              Listening level, dB(A)
            </label>
            <input
              id="hbt-level"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_LEVEL_DB}
              max={MAX_LEVEL_DB}
              step="1"
              value={levelDb}
              onChange={(event) => setLevelDb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hbt-listen">
              Listening block (minutes)
            </label>
            <input
              id="hbt-listen"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_LISTEN_MINUTES}
              max={MAX_LISTEN_MINUTES}
              step="5"
              value={listenMinutes}
              onChange={(event) => setListenMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hbt-break">
              Rest break (minutes)
            </label>
            <input
              id="hbt-break"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_BREAK_MINUTES}
              max={MAX_BREAK_MINUTES}
              step="1"
              value={breakMinutes}
              onChange={(event) => setBreakMinutes(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["60 / 5", 60, 5],
            ["45 / 10", 45, 10],
            ["30 / 5", 30, 5],
            ["90 / 15", 90, 15],
          ].map(([label, listen, rest]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setListenMinutes(String(listen));
                setBreakMinutes(String(rest));
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {phaseLabel}
            </p>
            <p
              className={`mt-1 text-5xl font-semibold tabular-nums ${
                ok && state.phase === "break" ? "text-[var(--success)]" : "text-[var(--primary)]"
              }`}
            >
              {ok ? formatClock(state.remainingSeconds) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]" aria-live="polite">
              {ok
                ? state.done
                  ? "Session finished — take your headphones off for a while."
                  : `Cycle ${NUM.format(state.cycleNumber)} · ${formatClock(state.sessionRemainingSeconds)} left in the session`
                : "Fix the inputs above to start the timer"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {running ? (
              <button type="button" onClick={pause} aria-label="Pause the timer" className={PRIMARY_BTN}>
                <Pause className="h-4 w-4" aria-hidden="true" />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                disabled={!ok || state.done}
                aria-label="Start the timer"
                className={`${PRIMARY_BTN} disabled:opacity-50`}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Start
              </button>
            )}
            <button
              type="button"
              onClick={restartTimer}
              aria-label="Restart the timer from zero"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Restart
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={ok ? `${Math.round(state.phaseProgress * 100)} percent through this block` : "No timer running"}
          >
            <span
              className={`block h-full ${
                ok && state.phase === "break" ? "bg-[var(--success)]" : "bg-[var(--primary)]"
              }`}
              style={{ width: `${ok ? Math.round(state.phaseProgress * 100) : 0}%` }}
            />
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Listened so far", ok ? formatClock(state.listenedSeconds) : DASH],
            ["Rested so far", ok ? formatClock(state.restedSeconds) : DASH],
            [
              "Planned listening in this session",
              ok ? `${NUM.format(schedule.listeningMinutes)} min` : DASH,
            ],
            ["Rest breaks planned", ok ? NUM.format(schedule.breakCount) : DASH],
            [
              "Daily sound allowance at this level",
              ok && dose ? `${NUM.format(dose.allowanceMinutes)} min` : DASH,
            ],
            [
              "Allowance this session would use",
              ok && dose ? `${NUM1.format(dose.usedPercent)}%` : DASH,
              ok && dose && !dose.withinAllowance
                ? "text-[var(--danger)]"
                : "text-[var(--success)]",
            ],
          ].map(([label, value, tone]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className={`text-right font-semibold ${tone || ""}`}>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyResult}
            disabled={!ok}
            aria-label="Copy the break schedule summary"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy plan"}
          </button>
          <button type="button" onClick={resetAll} aria-label="Reset every input" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset all
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Session plan</h2>
        {ok ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Block</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Starts at</th>
                  <th scope="col" className="py-2 text-right font-semibold">Length</th>
                </tr>
              </thead>
              <tbody>
                {schedule.segments.map((segment) => (
                  <tr key={segment.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{segment.index}</td>
                    <td
                      className={`py-2 pr-3 font-semibold ${
                        segment.type === "break" ? "text-[var(--success)]" : "text-[var(--primary)]"
                      }`}
                    >
                      {segment.type === "break" ? "Rest" : "Listen"}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {formatClock(segment.startMinute * SECONDS_PER_MINUTE)}
                    </td>
                    <td className="py-2 text-right">{NUM.format(segment.minutes)} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Device volume percentages do not translate reliably
        into decibels, so treat the level as an estimate. Persistent ringing, muffled hearing or
        trouble following speech is worth an audiologist appointment.
      </p>
    </main>
  );
}
