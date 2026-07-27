"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Play, RotateCcw, Square, Timer, Undo2 } from "lucide-react";

import {
  DEFAULT_RULE_ID,
  REGULARITY_TOLERANCE,
  RULES,
  formatMinutes,
  formatSeconds,
  summariseContractions,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STORAGE_KEY = "altft-contraction-timer-v1";
const DASH = "—";
const TICK_MS = 1000;

/** Example session: eight contractions, seven minutes apart, 45 seconds each. */
const DEMO_COUNT = 8;
const DEMO_GAP_MINUTES = 7;
const DEMO_DURATION_SECONDS = 45;
const DEMO_LAST_START_MINUTES_AGO = 3;

function buildDemoSession(nowMs) {
  return Array.from({ length: DEMO_COUNT }, (_, index) => {
    const minutesAgo =
      DEMO_LAST_START_MINUTES_AGO + (DEMO_COUNT - 1 - index) * DEMO_GAP_MINUTES;
    const start = nowMs - minutesAgo * 60000;
    return { start, end: start + DEMO_DURATION_SECONDS * 1000 };
  });
}

export default function ToolHome() {
  const [contractions, setContractions] = useState([]);
  const [ruleId, setRuleId] = useState(DEFAULT_RULE_ID);
  const [nowMs, setNowMs] = useState(0);
  const [isDemo, setIsDemo] = useState(true);
  const [copied, setCopied] = useState(false);

  // Mount: restore a saved session, otherwise show a clearly labelled example.
  // Deferred to a timeout so the first client render matches the server HTML.
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const startedAt = Date.now();
      setNowMs(startedAt);
      let restored = null;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) restored = JSON.parse(raw);
      } catch {
        restored = null;
      }
      if (restored && Array.isArray(restored.contractions) && restored.contractions.length > 0) {
        setContractions(restored.contractions);
        if (typeof restored.ruleId === "string") setRuleId(restored.ruleId);
        setIsDemo(false);
      } else {
        setContractions(buildDemoSession(startedAt));
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (isDemo) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ contractions, ruleId }));
    } catch {
      /* storage unavailable — the session still works in memory */
    }
  }, [contractions, ruleId, isDemo]);

  const summary = useMemo(() => {
    if (nowMs === 0) return null;
    return summariseContractions({ contractions, nowMs, ruleId });
  }, [contractions, nowMs, ruleId]);

  const hasError = Boolean(summary && summary.error);
  const ready = Boolean(summary) && !hasError;
  const running = ready && summary.currentIsRunning;

  const timeFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [],
  );

  const clearDemo = useCallback(() => {
    if (!isDemo) return;
    setIsDemo(false);
    setContractions([]);
  }, [isDemo]);

  const startContraction = () => {
    const at = Date.now();
    setNowMs(at);
    if (isDemo) {
      setIsDemo(false);
      setContractions([{ start: at, end: null }]);
      return;
    }
    setContractions((current) =>
      current.some((item) => item.end === null)
        ? current
        : [...current, { start: at, end: null }],
    );
  };

  const stopContraction = () => {
    const at = Date.now();
    setNowMs(at);
    setContractions((current) =>
      current.map((item) => (item.end === null ? { ...item, end: at } : item)),
    );
  };

  const undoLast = () => {
    if (isDemo) {
      clearDemo();
      return;
    }
    setContractions((current) => current.slice(0, -1));
  };

  const clearAll = () => {
    setIsDemo(false);
    setContractions([]);
    setCopied(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clear */
    }
  };

  const summaryText = useMemo(() => {
    if (!ready) return "";
    const lines = [
      `Contraction log (${summary.rule.label})`,
      `Contractions timed: ${summary.total} (${summary.finished} complete)`,
      `Average length: ${
        summary.averageDurationSeconds === null
          ? "not yet measured"
          : formatSeconds(summary.averageDurationSeconds)
      }`,
      `Average gap, start to start: ${
        summary.averageIntervalMinutes === null
          ? "not yet measured"
          : formatMinutes(summary.averageIntervalMinutes)
      }`,
      `Pattern matching the rule has held for: ${formatMinutes(summary.patternMinutes)}`,
      `Regular: ${summary.regular ? "yes" : "not yet"} · Trend: ${summary.trend}`,
      `${summary.rule.id} rule met: ${summary.ruleMet ? "yes" : "not yet"}`,
      "",
      "Last contractions (start · length · gap from previous):",
      ...summary.rows
        .slice(-6)
        .map(
          (row) =>
            `${row.number}. ${timeFormat.format(new Date(row.start))} · ${
              row.durationSeconds === null ? "still running" : formatSeconds(row.durationSeconds)
            } · ${row.intervalMinutes === null ? "first" : formatMinutes(row.intervalMinutes)}`,
        ),
    ];
    return lines.join("\n");
  }, [ready, summary, timeFormat]);

  const copyResult = async () => {
    if (!ready || summary.total === 0) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const rule = summary && !hasError ? summary.rule : RULES[0];

  const rows = !ready
    ? [
        ["Average length", DASH],
        ["Contractions timed", DASH],
        ["Qualifying run", DASH],
        ["Regularity", DASH],
        ["Trend across the session", DASH],
      ]
    : [
        [
          "Average length",
          summary.averageDurationSeconds === null
            ? "No completed contraction yet"
            : formatSeconds(summary.averageDurationSeconds),
        ],
        ["Contractions timed", `${summary.total} (${summary.finished} complete)`],
        [
          "Qualifying run",
          summary.recentCount === 0
            ? "None yet match the rule"
            : `${summary.recentCount} in a row · held ${formatMinutes(summary.patternMinutes)}`,
        ],
        [
          "Regularity",
          summary.regular
            ? `Regular — every gap within ${Math.round(REGULARITY_TOLERANCE * 100)}% of the average`
            : "Not regular yet",
        ],
        ["Trend across the session", summary.trend],
      ];

  const checks = !ready
    ? []
    : [
        [`Gap ${rule.intervalMinutes} minutes or less`, summary.intervalOk],
        [`Length ${rule.durationSeconds} seconds or more`, summary.durationOk],
        [`Held for ${rule.sustainedMinutes} minutes`, summary.sustainedOk],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Pregnancy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Contraction Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tap start when a contraction begins and stop when it eases. Gaps are timed
          start to start — the way frequency is actually defined — and tested against
          the pattern rule your maternity unit gave you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ct-rule">
              Pattern rule from your unit
            </label>
            <select
              id="ct-rule"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ruleId}
              onChange={(event) => {
                clearDemo();
                setRuleId(event.target.value);
              }}
            >
              {RULES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className={LABEL_CLASS}>Contraction in progress</p>
            <p className="mt-2 flex h-11 items-center text-2xl font-semibold tabular-nums text-[var(--primary)]">
              {running ? formatSeconds(summary.runningSeconds) : DASH}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {running ? (
            <button
              type="button"
              onClick={stopContraction}
              aria-label="Stop timing the current contraction"
              className={`${PRIMARY_BTN} flex-1 sm:flex-none sm:px-8`}
            >
              <Square className="h-4 w-4" aria-hidden="true" />
              Stop contraction
            </button>
          ) : (
            <button
              type="button"
              onClick={startContraction}
              aria-label="Start timing a contraction"
              className={`${PRIMARY_BTN} flex-1 sm:flex-none sm:px-8`}
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Start contraction
            </button>
          )}
          <button
            type="button"
            onClick={undoLast}
            disabled={!ready || summary.total === 0}
            aria-label="Remove the last logged contraction"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            Undo last
          </button>
          <button
            type="button"
            onClick={clearAll}
            aria-label="Clear the whole session"
            className={GHOST_BTN}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Clear
          </button>
        </div>

        {isDemo ? (
          <p className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]">
            Showing an example session — eight contractions {DEMO_GAP_MINUTES} minutes
            apart. Press Start or Clear to begin timing your own.
          </p>
        ) : null}

        {ready && summary.sinceLastStartMinutes !== null && !running ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Time since the last contraction started:{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {formatMinutes(summary.sinceLastStartMinutes)}
            </span>
          </p>
        ) : null}
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {summary.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Average gap, start to start
            </p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-[var(--primary)]">
              {ready && summary.averageIntervalMinutes !== null
                ? formatMinutes(summary.averageIntervalMinutes)
                : DASH}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the session above to see a result."
                : ready && summary.total < 2
                  ? "Time at least two contractions to get a frequency."
                  : ready && summary.ruleMet
                    ? `The ${rule.id} pattern is met — ring your maternity unit.`
                    : `The ${rule.id} pattern is not met yet.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ready || summary.total === 0}
              aria-label="Copy the contraction summary for your maternity unit"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {checks.length > 0 ? (
          <ul className="mt-5 grid gap-2 sm:grid-cols-3">
            {checks.map(([label, ok]) => (
              <li
                key={label}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  ok
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                }`}
              >
                {ok ? "Met" : "Not yet"} · {label}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Session log
        </h2>
        {ready && summary.rows.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[26rem] text-left text-sm">
              <thead className="text-[var(--muted-foreground)]">
                <tr>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    #
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Started
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Length
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Gap from previous
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {summary.rows
                  .slice()
                  .reverse()
                  .map((row) => (
                    <tr key={row.start}>
                      <td className="py-2 pr-3 tabular-nums">{row.number}</td>
                      <td className="py-2 pr-3 tabular-nums">
                        {timeFormat.format(new Date(row.start))}
                      </td>
                      <td className="py-2 pr-3 tabular-nums">
                        {row.durationSeconds === null
                          ? "running"
                          : formatSeconds(row.durationSeconds)}
                      </td>
                      <td className="py-2 tabular-nums">
                        {row.intervalMinutes === null
                          ? DASH
                          : formatMinutes(row.intervalMinutes)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Nothing timed yet — press Start contraction when the next one begins.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Timing guidance only, not medical advice. Ring your midwife or maternity unit
        straight away — whatever the timer says — if your waters break, you bleed, the
        baby&apos;s movements change, you have a fever or constant severe pain, or you
        were told to come in early after a previous caesarean, a preterm gestation or a
        fast previous labour.
      </p>
    </main>
  );
}
