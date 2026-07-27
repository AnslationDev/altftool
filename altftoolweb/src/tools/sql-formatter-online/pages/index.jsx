"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Database, RotateCcw } from "lucide-react";

import {
  DEFAULT_INDENT,
  KEYWORD_CASES,
  MAX_INDENT,
  MIN_INDENT,
  formatSql,
  minifySql,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE = `select o.id, c.name, sum(oi.qty*oi.price) as total
from orders o join customers c on c.id=o.customer_id
left join order_items oi on oi.order_id=o.id
where o.status='paid' and o.created_at between '2026-01-01' and '2026-03-31'
group by o.id, c.name having sum(oi.qty*oi.price) > 1000
order by total desc limit 10;`;

const CASE_LABELS = {
  upper: "UPPERCASE",
  lower: "lowercase",
  preserve: "Leave as typed",
};

const DASH = "—";
const num = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [sql, setSql] = useState(SAMPLE);
  const [indentWidth, setIndentWidth] = useState(String(DEFAULT_INDENT));
  const [keywordCase, setKeywordCase] = useState("upper");
  const [copied, setCopied] = useState(false);
  const [copiedMin, setCopiedMin] = useState(false);

  const result = useMemo(
    () => formatSql(sql, { indentWidth: Number(indentWidth), keywordCase }),
    [sql, indentWidth, keywordCase],
  );
  const minified = useMemo(() => minifySql(sql), [sql]);

  const hasError = Boolean(result.error);

  const copyFormatted = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const copyMinified = async () => {
    if (!minified.minified) return;
    try {
      await navigator.clipboard.writeText(minified.minified);
      setCopiedMin(true);
      setTimeout(() => setCopiedMin(false), 1500);
    } catch {
      setCopiedMin(false);
    }
  };

  const reset = () => {
    setSql(SAMPLE);
    setIndentWidth(String(DEFAULT_INDENT));
    setKeywordCase("upper");
    setCopied(false);
    setCopiedMin(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Database className="h-4 w-4" aria-hidden="true" />
          SQL
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">SQL Formatter Online</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Break a one-line query into clause-per-line SQL with consistent indentation. Everything
          runs in your browser — the query never leaves the page.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="sql-input">
          SQL to format
        </label>
        <textarea
          id="sql-input"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={8}
          spellCheck={false}
          value={sql}
          onChange={(event) => setSql(event.target.value)}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sql-indent">
              Indent width (spaces)
            </label>
            <input
              id="sql-indent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_INDENT}
              max={MAX_INDENT}
              step="1"
              value={indentWidth}
              onChange={(event) => setIndentWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sql-case">
              Keyword case
            </label>
            <select
              id="sql-case"
              className={`mt-2 ${INPUT_CLASS}`}
              value={keywordCase}
              onChange={(event) => setKeywordCase(event.target.value)}
            >
              {KEYWORD_CASES.map((item) => (
                <option key={item} value={item}>
                  {CASE_LABELS[item]}
                </option>
              ))}
            </select>
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Formatted lines
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
              {hasError ? DASH : num.format(result.lineCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `from ${num.format(result.inputLines)} input line(s), longest line ${num.format(result.longestLine)} chars`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyFormatted}
              aria-label="Copy the formatted SQL"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy SQL"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the sample query" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Statements", hasError ? DASH : num.format(result.statementCount)],
            ["SELECT clauses", hasError ? DASH : num.format(result.selectCount)],
            ["Tokens", hasError ? DASH : num.format(result.tokenCount)],
            ["Indent", hasError ? DASH : `${result.indentWidth} space(s)`],
            ["Keyword case", hasError ? DASH : CASE_LABELS[result.keywordCase]],
            [
              "Minified length",
              minified.error ? DASH : `${num.format(minified.characters)} chars`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Formatted</h2>
          <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre className="min-w-0 font-mono text-xs leading-5 text-[var(--foreground)]">
              {result.formatted}
            </pre>
          </div>
        </section>
      )}

      {!minified.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">One-line version</h2>
            <button
              type="button"
              onClick={copyMinified}
              aria-label="Copy the one-line SQL"
              className={GHOST_BTN}
            >
              {copiedMin ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedMin ? "Copied!" : "Copy one-line"}
            </button>
          </div>
          <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre className="min-w-0 font-mono text-xs leading-5 text-[var(--foreground)]">
              {minified.minified}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The formatter is lexical: it re-spaces tokens but never rewrites one, so string literals,
        quoted identifiers and comments come out byte-identical to what you pasted.
      </p>
    </main>
  );
}
