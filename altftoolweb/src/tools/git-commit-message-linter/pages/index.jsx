"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import { HEADER_LIMIT_OPTIONS, lintCommitMessage } from "../lib";

const INPUT_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_MESSAGE = "feat(auth): add passwordless login\n\nUses a one-time magic link sent by email.";

const DEFAULTS = {
  message: DEFAULT_MESSAGE,
  limitId: "commitlint",
  requireScope: false,
};

export default function ToolHome() {
  const [message, setMessage] = useState(DEFAULTS.message);
  const [limitId, setLimitId] = useState(DEFAULTS.limitId);
  const [requireScope, setRequireScope] = useState(DEFAULTS.requireScope);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(copiedTimeoutRef.current), []);

  const limit =
    HEADER_LIMIT_OPTIONS.find((o) => o.id === limitId) ?? HEADER_LIMIT_OPTIONS[0];

  const result = useMemo(
    () => lintCommitMessage({ message, headerMax: limit.max, requireScope }),
    [message, limit.max, requireScope],
  );

  const hasError = Boolean(result.error);
  const verdict = hasError ? DASH : result.valid ? "Passes" : "Fails";

  const copyResult = async () => {
    if (hasError || !result.fixed) return;
    try {
      await navigator.clipboard.writeText(result.fixed);
      setCopied(true);
      clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMessage(DEFAULTS.message);
    setLimitId(DEFAULTS.limitId);
    setRequireScope(DEFAULTS.requireScope);
    setCopied(false);
  };

  const findings = hasError ? [] : [...result.errors, ...result.warnings.map((w) => ({ ...w, warning: true }))];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Git workflow
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Git Commit Message Linter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a commit message and lint it against the Conventional Commits v1.0.0 spec and
          commitlint's config-conventional rules — with a suggested fixed message.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="cl-message">
            Commit message
          </label>
          <textarea
            id="cl-message"
            className={`mt-2 min-h-32 py-2 font-mono text-sm ${INPUT_CLASS}`}
            value={message}
            spellCheck={false}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-limit">
              Header length limit
            </label>
            <select
              id="cl-limit"
              className={`mt-2 h-11 ${INPUT_CLASS}`}
              value={limitId}
              onChange={(event) => setLimitId(event.target.value)}
            >
              {HEADER_LIMIT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 self-end text-sm"
            htmlFor="cl-scope"
          >
            <input
              id="cl-scope"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={requireScope}
              onChange={(event) => setRequireScope(event.target.checked)}
            />
            Require a scope, e.g. feat(api): …
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Lint verdict
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError
                  ? "text-[var(--primary)]"
                  : result.valid
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError || !result.fixed}
              aria-label="Copy the suggested fixed commit message"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy fixed message"}
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
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Errors / warnings</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : `${result.errors.length} / ${result.warnings.length}`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Header length</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : `${result.headerLength} / ${result.headerMax}`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Parsed type / scope</dt>
            <dd className="text-right font-mono text-xs font-semibold">
              {hasError || !result.parsed
                ? DASH
                : `${result.parsed.type}${result.parsed.scope ? `(${result.parsed.scope})` : ""}${
                    result.parsed.breaking ? " — BREAKING" : ""
                  }`}
            </dd>
          </div>
        </dl>

        {!hasError && findings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {findings.map((f) => (
              <li
                key={`${f.rule}-${f.text}`}
                className={`rounded-md px-3 py-2 text-sm ${
                  f.warning
                    ? "bg-[var(--muted)] text-[var(--foreground)]"
                    : "bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
              >
                <span className="font-mono text-xs font-semibold">
                  {f.warning ? "warn" : "error"} · {f.rule}
                </span>
                <span className="ml-2">{f.text}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {!hasError && result.valid ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            Message satisfies every checked rule.
          </p>
        ) : null}

        {!hasError && result.fixed && !result.valid ? (
          <>
            <h2 className="mt-5 text-sm font-semibold">Suggested fix</h2>
            <pre className="mt-2 overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]">
              <code>{result.fixed}</code>
            </pre>
          </>
        ) : null}

        <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
          Checked rules: {hasError ? DASH : result.checkedRules.join(", ")}. Based on Conventional
          Commits v1.0.0 and commitlint config-conventional defaults.
        </p>
      </section>
    </main>
  );
}
