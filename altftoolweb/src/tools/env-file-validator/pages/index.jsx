"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCheck, RotateCcw } from "lucide-react";

import { formatValidationReport, validateEnv } from "../lib";

const TEXTAREA_CLASS =
  "min-h-56 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ENV = `NODE_ENV=production
PORT = 3000
DATABASE_URL=postgres://app:pw@db:5432/app
DATABASE_URL=postgres://app:pw@db-replica:5432/app
MESSAGE=hello # greeting
SECRET="unclosed`;

const DASH = "—";

export default function ToolHome() {
  const [source, setSource] = useState(DEFAULT_ENV);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => validateEnv(source), [source]);
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(formatValidationReport(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSource(DEFAULT_ENV);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Errors", DASH],
        ["Warnings", DASH],
        ["Variables", DASH],
        ["Lines", DASH],
      ]
    : [
        ["Errors", result.summary.errors],
        ["Warnings", result.summary.warnings],
        ["Variables", result.summary.variables],
        ["Lines", result.summary.lines],
      ];

  const headline = hasError
    ? DASH
    : result.ok
      ? result.summary.warnings === 0
        ? "Valid"
        : "Valid, with warnings"
      : `${result.summary.errors} error${result.summary.errors === 1 ? "" : "s"}`;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCheck className="h-4 w-4" aria-hidden="true" />
          Environment config
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Env File Validator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lint a .env before it ships: syntax errors, unclosed quotes, duplicate keys, multiline
          values, and the places where dotenv, a POSIX shell and docker --env-file silently
          disagree. Everything runs locally in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="envval-src">
          .env contents
        </label>
        <textarea
          id="envval-src"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          spellCheck={false}
          value={source}
          onChange={(event) => setSource(event.target.value)}
        />
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
              Verdict
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !hasError && !result.ok ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {headline}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.issues.length === 0
                  ? "No problems found — every line parses cleanly and consistently."
                  : "Issues are listed below with line numbers, most serious first."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the validation report"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset to the example file"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-6 text-sm sm:grid-cols-4">
          {rows.map(([label, value]) => (
            <div key={label} className="py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-lg font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.issues.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {[...result.issues]
              .sort((a, b) => (a.severity === b.severity ? a.line - b.line : a.severity === "error" ? -1 : 1))
              .map((issue, index) => (
                <li
                  key={`${issue.line}-${index}`}
                  className={`rounded-md px-3 py-2 text-sm ${
                    issue.severity === "error"
                      ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                      : "bg-[var(--muted)] text-[var(--foreground)]"
                  }`}
                >
                  <span className="font-mono text-xs font-bold uppercase">
                    {issue.severity} · line {issue.line}
                    {issue.key ? ` · ${issue.key}` : ""}
                  </span>
                  <span className="mt-0.5 block">{issue.message}</span>
                </li>
              ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Warnings mark constructs that parse differently across dotenv, POSIX shells and docker
        --env-file — the classic source of &quot;works locally, breaks in the container&quot; bugs.
      </p>
    </main>
  );
}
