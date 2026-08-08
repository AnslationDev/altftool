"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileKey, RotateCcw } from "lucide-react";

import { PLACEHOLDER_STYLES, generateEnvExample } from "../lib";

const TEXTAREA_CLASS =
  "min-h-52 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ENV = `# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgres://admin:s3cret@db.internal:5432/app

# Third-party
STRIPE_API_KEY=<stripe_live_key_here>
SENTRY_DSN=https://abc123@o0.ingest.sentry.io/1`;

const DASH = "—";

export default function ToolHome() {
  const [source, setSource] = useState(DEFAULT_ENV);
  const [style, setStyle] = useState("empty");
  const [keepComments, setKeepComments] = useState(true);
  const [keepBlankLines, setKeepBlankLines] = useState(true);
  const [keepSafeValues, setKeepSafeValues] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      generateEnvExample(source, {
        placeholderStyle: style,
        keepComments,
        keepBlankLines,
        keepSafeValues,
      }),
    [source, style, keepComments, keepBlankLines, keepSafeValues],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      source !== DEFAULT_ENV &&
      typeof window !== "undefined" &&
      !window.confirm("Discard your pasted .env and restore the example?")
    ) {
      return;
    }
    setSource(DEFAULT_ENV);
    setStyle("empty");
    setKeepComments(true);
    setKeepBlankLines(true);
    setKeepSafeValues(true);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Variables found", DASH],
        ["Values stripped", DASH],
        ["Values kept (non-secret)", DASH],
      ]
    : [
        ["Variables found", result.totalVars],
        ["Values stripped", result.strippedCount],
        [
          "Values kept (non-secret)",
          result.keptCount === 0 ? "0" : `${result.keptCount} — ${result.keptKeys.join(", ")}`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileKey className="h-4 w-4" aria-hidden="true" />
          Environment config
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Env to Example Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a real .env and get a commit-safe .env.example: every value is blanked by
          default — you can opt in to keep well-known non-secret values like NODE_ENV or PORT —
          and keys that look like credentials (SECRET, TOKEN, API_KEY, PASSWORD…) are always
          stripped regardless. Comments and blank lines are kept. Runs entirely in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="envex-src">
            Your .env file
          </label>
          <textarea
            id="envex-src"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            spellCheck={false}
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="envex-style">
              Placeholder style
            </label>
            <select
              id="envex-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style}
              onChange={(event) => setStyle(event.target.value)}
            >
              {PLACEHOLDER_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-end gap-1">
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="envex-safe">
              <input
                id="envex-safe"
                type="checkbox"
                className={CHECK_CLASS}
                checked={keepSafeValues}
                onChange={(event) => setKeepSafeValues(event.target.checked)}
              />
              Keep non-secret values (NODE_ENV, PORT, true/false…)
            </label>
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="envex-comments">
            <input
              id="envex-comments"
              type="checkbox"
              className={CHECK_CLASS}
              checked={keepComments}
              onChange={(event) => setKeepComments(event.target.checked)}
            />
            Keep comment lines
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="envex-blank">
            <input
              id="envex-blank"
              type="checkbox"
              className={CHECK_CLASS}
              checked={keepBlankLines}
              onChange={(event) => setKeepBlankLines(event.target.checked)}
            />
            Keep blank lines
          </label>
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

      {!hasError && result.warning ? (
        <p
          role="status"
          className="mt-6 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
        >
          {result.warning}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Generated .env.example
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.strippedCount} stripped`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Values removed from the file below; secret-looking keys are always blanked."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated .env.example"
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
              aria-label="Reset input and options to the example"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
          <pre className="font-mono text-sm leading-6 text-[var(--foreground)]">
            {hasError ? DASH : result.output}
          </pre>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-words text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Double-check the output before committing — the secret-key detection is heuristic, and a
        value can be sensitive even when its key name looks harmless.
      </p>
    </main>
  );
}
