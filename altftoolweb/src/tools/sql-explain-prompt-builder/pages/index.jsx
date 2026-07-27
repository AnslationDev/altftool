"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Database, RotateCcw } from "lucide-react";

import { ENGINES, LEVELS, buildSqlExplainPrompt } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sql: `SELECT *
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN refunds r ON r.order_id = o.id
WHERE LOWER(c.email) LIKE '%gmail.com'
  AND o.status <> 'void'
ORDER BY o.created_at DESC`,
  planText: "",
  engineId: "postgres",
  levelId: "developer",
  tableSizes: "orders 12M rows, customers 400k rows, index on orders(status, created_at)",
  wantRewrite: true,
  notes: "",
};

export default function ToolHome() {
  const [sql, setSql] = useState(DEFAULTS.sql);
  const [planText, setPlanText] = useState(DEFAULTS.planText);
  const [engineId, setEngineId] = useState(DEFAULTS.engineId);
  const [levelId, setLevelId] = useState(DEFAULTS.levelId);
  const [tableSizes, setTableSizes] = useState(DEFAULTS.tableSizes);
  const [wantRewrite, setWantRewrite] = useState(DEFAULTS.wantRewrite);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildSqlExplainPrompt({
        sql,
        planText,
        engineId,
        levelId,
        tableSizes,
        wantRewrite,
        notes,
      }),
    [sql, planText, engineId, levelId, tableSizes, wantRewrite, notes],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSql(DEFAULTS.sql);
    setPlanText(DEFAULTS.planText);
    setEngineId(DEFAULTS.engineId);
    setLevelId(DEFAULTS.levelId);
    setTableSizes(DEFAULTS.tableSizes);
    setWantRewrite(DEFAULTS.wantRewrite);
    setNotes(DEFAULTS.notes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Joins in the query", DASH],
        ["Plan supplied", DASH],
        ["Costly nodes in the plan", DASH],
        ["How to capture a plan", DASH],
        ["Prompt length", DASH],
      ]
    : [
        [
          "Joins in the query",
          `${NUM.format(result.shape.joins)}${result.shape.ctes > 0 ? ` · ${NUM.format(result.shape.ctes)} CTE` : ""}${result.shape.windowed ? " · window function" : ""}`,
        ],
        [
          "Plan supplied",
          result.hasPlan
            ? `${NUM.format(result.planLines)} line${result.planLines === 1 ? "" : "s"}`
            : "no — the prompt asks for one",
        ],
        [
          "Costly nodes in the plan",
          result.planNodes.length === 0 ? "none spotted" : result.planNodes.join(", "),
        ],
        ["How to capture a plan", result.engine.command],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Database className="h-4 w-4" aria-hidden="true" />
          Query performance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          SQL Explain Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a query and, if you have it, the EXPLAIN output. Non-sargable
          predicates and your engine&apos;s expensive plan nodes are flagged and
          written into a prompt that asks for a node-by-node explanation and
          costed fixes.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sq-engine">
              Database engine
            </label>
            <select
              id="sq-engine"
              className={`mt-2 ${INPUT_CLASS}`}
              value={engineId}
              onChange={(event) => setEngineId(event.target.value)}
            >
              {ENGINES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sq-level">
              Explanation aimed at
            </label>
            <select
              id="sq-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={levelId}
              onChange={(event) => setLevelId(event.target.value)}
            >
              {LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sq-sql">
              SQL statement
            </label>
            <textarea
              id="sq-sql"
              className={`mt-2 ${AREA_CLASS}`}
              rows={9}
              spellCheck={false}
              value={sql}
              onChange={(event) => setSql(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sq-plan">
              EXPLAIN output (optional)
            </label>
            <textarea
              id="sq-plan"
              className={`mt-2 ${AREA_CLASS}`}
              rows={6}
              spellCheck={false}
              value={planText}
              onChange={(event) => setPlanText(event.target.value)}
              placeholder="Paste the plan here, or leave it blank and the prompt will tell you how to capture one."
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sq-sizes">
              Table sizes and existing indexes (optional)
            </label>
            <input
              id="sq-sizes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={tableSizes}
              onChange={(event) => setTableSizes(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              htmlFor="sq-rewrite"
            >
              <input
                id="sq-rewrite"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={wantRewrite}
                onChange={(event) => setWantRewrite(event.target.checked)}
              />
              <span>Also ask for a rewritten query with comments</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sq-notes">
              Extra instruction (optional)
            </label>
            <input
              id="sq-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. we cannot add indexes this quarter — query-only fixes"
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Patterns flagged in the SQL
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.findingCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.findingCount === 0
                  ? "Nothing obvious — the prompt still checks join order and selectivity."
                  : "Each one is written into the prompt with the question it should answer."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated SQL explanation prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-words text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.findings.length > 0 ? (
          <ul className="mt-5 space-y-2 text-sm">
            {result.findings.map((finding) => (
              <li
                key={finding.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                <span className="font-semibold">{finding.label}</span>
                <span className="block text-[var(--muted-foreground)]">{finding.finding}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Generated prompt
          </h2>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {hasError ? DASH : result.text}
            </pre>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Detection is pattern based, not a parser, so treat every flag as a
        prompt for investigation rather than a verdict. Strip real customer data
        out of the query before sending the prompt to any model.
      </p>
    </main>
  );
}
