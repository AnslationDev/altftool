"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Database, RotateCcw } from "lucide-react";

import { formatSqlite } from "../lib";

const INPUT_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SQL = `select id, name, count(*) as order_count from users u left join orders o on o.user_id = u.id where u.active = 1 and u.city = 'Delhi' group by u.id having order_count > 2 order by name limit 20;
pragma foreign_keys = on;`;

const DEFAULTS = {
  sql: DEFAULT_SQL,
  keywordCase: "upper",
  indentWidth: "2",
};

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [sql, setSql] = useState(DEFAULTS.sql);
  const [keywordCase, setKeywordCase] = useState(DEFAULTS.keywordCase);
  const [indentWidth, setIndentWidth] = useState(DEFAULTS.indentWidth);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => formatSqlite({ sql, keywordCase, indentWidth: Number(indentWidth) }),
    [sql, keywordCase, indentWidth],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSql(DEFAULTS.sql);
    setKeywordCase(DEFAULTS.keywordCase);
    setIndentWidth(DEFAULTS.indentWidth);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Database className="h-4 w-4" aria-hidden="true" />
          SQL formatting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">SQLite Query Formatter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste messy SQLite SQL and get clause-aligned, consistently cased output. PRAGMA
          statements, doubled-quote string escapes, [bracket] identifiers and bind parameters are
          all understood.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="sqf-sql">
            SQLite SQL to format
          </label>
          <textarea
            id="sqf-sql"
            className={`mt-2 min-h-40 py-2 font-mono text-sm ${INPUT_CLASS}`}
            value={sql}
            onChange={(event) => setSql(event.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sqf-case">
              Keyword case
            </label>
            <select
              id="sqf-case"
              className={`mt-2 h-11 ${INPUT_CLASS}`}
              value={keywordCase}
              onChange={(event) => setKeywordCase(event.target.value)}
            >
              <option value="upper">UPPERCASE keywords</option>
              <option value="lower">lowercase keywords</option>
              <option value="preserve">Keep as typed</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sqf-indent">
              Indent width (spaces)
            </label>
            <select
              id="sqf-indent"
              className={`mt-2 h-11 ${INPUT_CLASS}`}
              value={indentWidth}
              onChange={(event) => setIndentWidth(event.target.value)}
            >
              {["2", "4", "8"].map((option) => (
                <option key={option} value={option}>
                  {option}
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Formatted SQL
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the formatted SQL"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy SQL"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the input to the sample query"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
          <pre className="whitespace-pre font-mono text-sm leading-6 text-[var(--foreground)]">
            {hasError ? DASH : result.formatted}
          </pre>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Statements", hasError ? DASH : NUM.format(result.statementCount)],
            ["Tokens parsed", hasError ? DASH : NUM.format(result.tokenCount)],
            ["Semantics", "Unchanged — only whitespace and keyword case are touched"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The formatter is purely lexical: strings, identifiers, comments and bind parameters are
        preserved byte for byte, so the formatted statement executes identically to the original.
      </p>
    </main>
  );
}
