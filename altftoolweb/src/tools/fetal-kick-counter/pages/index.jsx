"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Baby, Check, Copy, Play, RotateCcw, Square, Undo2 } from "lucide-react";

import {
  COUNTING_FROM_WEEK,
  STATUS,
  TARGET_KICKS,
  WINDOW_MINUTES,
  formatMinutes,
  summariseHistory,
  summariseSession,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const clockLabel = (ms) =>
  new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ToolHome() {
  const [target, setTarget] = useState(String(TARGET_KICKS));
  const [windowMinutes, setWindowMinutes] = useState(String(WINDOW_MINUTES));
  const [startedAt, setStartedAt] = useState(null);
  const [nowMs, setNowMs] = useState(0);
  const [kicks, setKicks] = useState([]);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const running = startedAt !== null;

  useEffect(() => {
    if (!running) return undefined;
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  const numericTarget = Number(target);
  const numericWindow = Number(windowMinutes);

  const result = useMemo(
    () =>
      summariseSession({
        startedAt: running ? startedAt : 0,
        nowMs: running ? Math.max(nowMs, startedAt) : 0,
        kickTimes: running ? kicks : [],
        targetKicks: Number.isFinite(numericTarget) ? numericTarget : NaN,
        windowMinutes: Number.isFinite(numericWindow) ? numericWindow : NaN,
      }),
    [running, startedAt, nowMs, kicks, numericTarget, numericWindow],
  );

  const hasError = Boolean(result.error);
  const historySummary = useMemo(() => summariseHistory(history), [history]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Fetal movement session",
      `Movements counted: ${result.count} of ${result.target}`,
      `Session length: ${formatMinutes(result.elapsedMinutes)}`,
      `Time to movement ${result.target}: ${
        result.minutesToTarget === null ? "not reached yet" : formatMinutes(result.minutesToTarget)
      }`,
      `Counting window: ${formatMinutes(result.windowMinutes)}`,
      `Outcome: ${result.message}`,
    ].join("\n");
  }, [hasError, result]);

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

  const startSession = () => {
    const now = Date.now();
    setStartedAt(now);
    setNowMs(now);
    setKicks([]);
    setCopied(false);
  };

  const recordKick = () => {
    if (!running) return;
    setKicks((current) => [...current, Date.now()]);
  };

  const undoKick = () => {
    setKicks((current) => current.slice(0, -1));
  };

  const finishSession = () => {
    if (!running || hasError) {
      setStartedAt(null);
      return;
    }
    setHistory((current) => [
      {
        id: startedAt,
        startedAt,
        count: result.count,
        elapsedMinutes: result.elapsedMinutes,
        minutesToTarget: result.minutesToTarget,
        status: result.status,
      },
      ...current,
    ]);
    setStartedAt(null);
    setKicks([]);
  };

  const reset = () => {
    setTarget(String(TARGET_KICKS));
    setWindowMinutes(String(WINDOW_MINUTES));
    setStartedAt(null);
    setKicks([]);
    setHistory([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Pregnancy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Fetal Kick Counter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tap once for every kick, roll or jab. The session times how long ten movements take, the
          count-to-ten method usually started from around week {COUNTING_FROM_WEEK}.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fkc-target">
              Movements to count
            </label>
            <input
              id="fkc-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="50"
              step="1"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fkc-window">
              Counting window (minutes)
            </label>
            <input
              id="fkc-window"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="360"
              step="10"
              value={windowMinutes}
              onChange={(event) => setWindowMinutes(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {!running ? (
            <button type="button" onClick={startSession} className={`${PRIMARY_BTN} flex-1`}>
              <Play className="h-4 w-4" aria-hidden="true" />
              Start session
            </button>
          ) : (
            <>
              <button type="button" onClick={finishSession} className={`${GHOST_BTN} flex-1`}>
                <Square className="h-4 w-4" aria-hidden="true" />
                Finish and save
              </button>
              <button
                type="button"
                onClick={undoKick}
                disabled={kicks.length === 0}
                aria-label="Remove the last recorded movement"
                className={`${GHOST_BTN} disabled:opacity-50`}
              >
                <Undo2 className="h-4 w-4" aria-hidden="true" />
                Undo
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={recordKick}
          disabled={!running}
          aria-label="Record one fetal movement"
          className="mt-4 flex min-h-[7rem] w-full items-center justify-center rounded-xl bg-[var(--primary)] text-2xl font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50"
        >
          {running ? "Tap for a movement" : "Start a session to begin tapping"}
        </button>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Movements counted
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.count} / ${result.target}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Check the settings above." : result.message}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy this movement session summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset counter and history" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Session length", hasError ? DASH : formatMinutes(result.elapsedMinutes)],
            [
              `Time to movement ${hasError ? "" : result.target}`.trim(),
              hasError || result.minutesToTarget === null ? DASH : formatMinutes(result.minutesToTarget),
            ],
            ["Movements still needed", hasError ? DASH : `${result.remaining}`],
            [
              "Average gap per movement",
              hasError || result.averageIntervalMinutes === null
                ? DASH
                : formatMinutes(result.averageIntervalMinutes),
            ],
            [
              "At this rate, ten by",
              hasError || result.projectedMinutesToTarget === null
                ? DASH
                : formatMinutes(result.projectedMinutesToTarget),
            ],
            [
              "Last movement",
              hasError || result.lastKickMinutesAgo === null
                ? DASH
                : `${formatMinutes(result.lastKickMinutesAgo)} ago`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 space-y-3">
            <div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${result.count} of ${result.target} movements recorded`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${result.progressPercent}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Movements towards target</p>
            </div>
            <div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${Math.round(result.windowPercent)} percent of the counting window used`}
              >
                <span
                  className={`block h-full ${
                    result.status === STATUS.windowPassed ? "bg-[var(--danger)]" : "bg-[var(--success)]"
                  }`}
                  style={{ width: `${result.windowPercent}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Counting window used</p>
            </div>
          </div>
        )}

        {!hasError && result.needsCall && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Fewer movements than expected in the window. Phone your midwife or maternity unit now, at any
            hour — do not wait and do not try to make the baby move first.
          </p>
        )}
      </section>

      {running && kicks.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">This session&rsquo;s movements</h2>
          <ol className="mt-3 flex flex-wrap gap-2 text-xs">
            {kicks.map((time, index) => (
              <li
                key={time}
                className="rounded-md bg-[var(--muted)] px-2 py-1 font-semibold text-[var(--muted-foreground)]"
              >
                #{index + 1} {clockLabel(time)}
              </li>
            ))}
          </ol>
        </section>
      )}

      {history.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Saved sessions</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Sessions saved", `${historySummary.sessions}`],
              ["Movements recorded in total", `${historySummary.totalKicks}`],
              [
                "Average time to target",
                historySummary.averageMinutesToTarget === null
                  ? DASH
                  : formatMinutes(historySummary.averageMinutesToTarget),
              ],
              [
                "Fastest / slowest",
                historySummary.fastest === null
                  ? DASH
                  : `${formatMinutes(historySummary.fastest)} / ${formatMinutes(historySummary.slowest)}`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Started</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Movements</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Session</th>
                  <th scope="col" className="py-2 text-right font-semibold">To target</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{clockLabel(row.startedAt)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{row.count}</td>
                    <td className="py-2 pr-3 text-right">{formatMinutes(row.elapsedMinutes)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {row.minutesToTarget === null ? DASH : formatMinutes(row.minutesToTarget)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Sessions are kept in this browser tab only and are cleared when you reset or reload.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational tool, not a monitoring device and not medical advice. Any reduction or change in
        your baby&rsquo;s usual movements should be reported to your midwife or maternity unit the same
        day, whatever this counter shows.
      </p>
    </main>
  );
}
