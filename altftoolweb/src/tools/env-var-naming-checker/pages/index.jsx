"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SpellCheck } from "lucide-react";

import { checkEnvVarNames, formatNameReport } from "../lib";

const TEXTAREA_CLASS =
  "min-h-48 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_NAMES = `DATABASE_URL
NEXT_PUBLIC_API_KEY
GITHUB_DEPLOY_TARGET
my-service-port
PATH`;

const DASH = "—";

export default function ToolHome() {
  const [source, setSource] = useState(DEFAULT_NAMES);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => checkEnvVarNames(source), [source]);
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(formatNameReport(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSource(DEFAULT_NAMES);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Names checked", DASH],
        ["Errors", DASH],
        ["Warnings", DASH],
        ["Clean", DASH],
      ]
    : [
        ["Names checked", result.summary.names],
        ["Errors", result.summary.errors],
        ["Warnings", result.summary.warnings],
        ["Clean", result.summary.clean],
      ];

  const headline = hasError
    ? DASH
    : result.summary.errors > 0
      ? `${result.summary.errors} error${result.summary.errors === 1 ? "" : "s"}`
      : result.summary.warnings > 0
        ? "Warnings only"
        : "All clean";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SpellCheck className="h-4 w-4" aria-hidden="true" />
          Environment config
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Env Var Naming Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Validate environment variable names against the POSIX rule
          ([A-Za-z_][A-Za-z0-9_]*), UPPER_SNAKE_CASE convention, reserved system names like PATH
          and IFS, platform prefixes like GITHUB_ and LD_, and browser-exposing prefixes like
          NEXT_PUBLIC_.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="envname-src">
          Variable names — one per line, comma separated, or pasted .env lines
        </label>
        <textarea
          id="envname-src"
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
                !hasError && result.summary.errors > 0 ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {headline}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the naming report"
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
              aria-label="Reset to the example names"
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

        {!hasError ? (
          <ul className="mt-4 space-y-2">
            {result.results.map((r, index) => (
              <li
                key={`${r.name}-${index}`}
                className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono font-semibold">{r.name}</span>
                  {r.issues.length === 0 ? (
                    <span className="text-xs font-bold uppercase text-[var(--success)]">OK</span>
                  ) : r.issues.some((i) => i.severity === "error") ? (
                    <span className="text-xs font-bold uppercase text-[var(--danger)]">Error</span>
                  ) : (
                    <span className="text-xs font-bold uppercase text-[var(--primary)]">Warning</span>
                  )}
                </div>
                {r.issues.map((issue, j) => (
                  <p
                    key={j}
                    className={`mt-1 text-xs leading-5 ${
                      issue.severity === "error" ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {issue.message}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Checks run entirely in your browser. Reserved-prefix rules reflect each platform&apos;s
        documentation (GitHub Actions, glibc, macOS dyld, npm, Kubernetes) as of 2026.
      </p>
    </main>
  );
}
