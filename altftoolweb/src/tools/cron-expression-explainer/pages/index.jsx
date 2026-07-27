"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import { nextOccurrences, parseCron } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const EXAMPLES = [
  ["*/15 9-17 * * MON-FRI", "Every 15 min, office hours"],
  ["0 3 * * *", "Daily at 03:00"],
  ["0 0 1 * *", "Monthly on the 1st"],
  ["@weekly", "Weekly macro"],
];

const isoNowMinute = () => new Date().toISOString().slice(0, 16);

const DASH = "—";

export default function ToolHome() {
  const [expression, setExpression] = useState("*/15 9-17 * * MON-FRI");
  const [fromIso, setFromIso] = useState(() => isoNowMinute());
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseCron(expression), [expression]);
  const hasError = Boolean(parsed.error);

  const runs = useMemo(() => {
    if (hasError) return null;
    return nextOccurrences(parsed, fromIso, 5);
  }, [parsed, hasError, fromIso]);

  const runsError = runs && !Array.isArray(runs) ? runs.error : null;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Cron: ${parsed.normalized}`,
      parsed.macroExpansion ?? "",
      parsed.sentence,
      "",
      ...parsed.breakdown.map((row) => `${row.field} = "${row.raw}" -> ${row.meaning}`),
      "",
      Array.isArray(runs) ? `Next runs (from ${fromIso} UTC):` : "",
      ...(Array.isArray(runs) ? runs : []),
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, parsed, runs, fromIso]);

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
    setExpression("*/15 9-17 * * MON-FRI");
    setFromIso(isoNowMinute());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Scheduling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cron Expression Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste any 5-field crontab expression (or an @macro) to get a plain-English translation, a
          field-by-field breakdown, and the next five run times in UTC — including the Vixie
          either/or rule when both day fields are set.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cr-expr">
              Cron expression
            </label>
            <input
              id="cr-expr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="minute hour day-of-month month day-of-week"
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cr-from">
              Predict next runs from (UTC)
            </label>
            <input
              id="cr-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="datetime-local"
              value={fromIso}
              onChange={(event) => setFromIso(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map(([value, labelText]) => (
            <button
              key={value}
              type="button"
              onClick={() => setExpression(value)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              aria-label={`Use example: ${labelText}`}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {parsed.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              In plain English
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : parsed.sentence}
            </p>
            {!hasError && parsed.macroExpansion ? (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{parsed.macroExpansion}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the cron explanation"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset to the example expression"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <h2 className="mt-5 text-base font-semibold">Field-by-field breakdown</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Field
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Value
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Allowed
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : parsed.breakdown).map((row) => (
                <tr key={row.field} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{row.field}</td>
                  <td className="py-2 pr-3 font-mono font-semibold">{row.raw}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.allowed}</td>
                  <td className="py-2">{row.meaning}</td>
                </tr>
              ))}
              {hasError ? (
                <tr>
                  <td colSpan={4} className="py-2 text-[var(--muted-foreground)]">
                    {DASH}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <h2 className="mt-5 text-base font-semibold">Next 5 runs (UTC)</h2>
        {runsError ? (
          <p
            role="alert"
            className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {runsError}
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-[var(--border)] text-sm">
            {(Array.isArray(runs) ? runs : []).map((run) => (
              <li key={run} className="py-2 font-mono">
                {run}
              </li>
            ))}
            {hasError ? <li className="py-2">{DASH}</li> : null}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Predictions assume the crontab(5) grammar and UTC. Your cron daemon runs in the server&apos;s
        local timezone unless CRON_TZ is set, and some runners (Quartz, AWS EventBridge) use 6 or 7
        fields with different day-of-week numbering — check their docs before porting an expression.
      </p>
    </main>
  );
}
