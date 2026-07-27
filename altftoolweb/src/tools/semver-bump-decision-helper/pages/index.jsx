"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingUp } from "lucide-react";

import { QUESTIONS, decideBump } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_VERSION = "1.4.2";
const DEFAULT_ANSWERS = { bugFix: true };
const DASH = "—";

export default function ToolHome() {
  const [currentVersion, setCurrentVersion] = useState(DEFAULT_VERSION);
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const [declareStable, setDeclareStable] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => decideBump({ currentVersion, answers, declareStable }),
    [currentVersion, answers, declareStable],
  );

  const hasError = Boolean(result.error);

  const toggleAnswer = (id) => {
    setAnswers((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Current version: ${currentVersion.trim()}`,
      `Recommended bump: ${result.bump.toUpperCase()}`,
      `Next version: ${result.nextVersion}`,
      `Rule: ${result.specRule}`,
      `Why: ${result.reason}`,
    ].join("\n");
  }, [hasError, currentVersion, result]);

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
    setCurrentVersion(DEFAULT_VERSION);
    setAnswers(DEFAULT_ANSWERS);
    setDeclareStable(false);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Recommended bump", DASH],
        ["Next version", DASH],
        ["Spec rule", DASH],
      ]
    : [
        ["Recommended bump", result.bump.toUpperCase()],
        ["Next version", result.nextVersion],
        ["Spec rule", result.specRule],
        ["Major version zero (0.x)", result.zeroMajor ? "Yes — relaxed rules apply" : "No"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Versioning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Semver Bump Decision Helper
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick what changed in this release and get the major, minor or patch answer the SemVer
          2.0.0 specification actually requires — including the special rules for 0.x packages.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="max-w-xs">
          <label className={LABEL_CLASS} htmlFor="sb-version">
            Current released version
          </label>
          <input
            id="sb-version"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            spellCheck={false}
            placeholder="1.4.2"
            value={currentVersion}
            onChange={(event) => setCurrentVersion(event.target.value)}
          />
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What does this release contain?
          </legend>
          <div className="mt-2 space-y-1">
            {QUESTIONS.map((question) => (
              <label
                key={question.id}
                htmlFor={`sb-${question.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition hover:bg-[var(--muted)]"
              >
                <input
                  id={`sb-${question.id}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={answers[question.id] === true}
                  onChange={() => toggleAnswer(question.id)}
                />
                <span className="text-sm leading-6">
                  <span className="font-medium">{question.label}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">{question.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="sb-stable"
        >
          <input
            id="sb-stable"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={declareStable}
            onChange={(event) => setDeclareStable(event.target.checked)}
          />
          This release declares the public API stable — go straight to 1.0.0 (0.x packages only)
        </label>
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
              Next version
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.nextVersion}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a recommendation." : result.reason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the version bump recommendation"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.notes.length > 0 ? (
          <ul className="mt-4 space-y-1 text-sm text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Based on Semantic Versioning 2.0.0: major for incompatible changes (item 8), minor for
        backwards-compatible features and deprecations (item 7), patch for compatible bug fixes
        (item 6). During 0.x development anything may change (item 4), so the common convention of
        minor-for-breaking is applied there.
      </p>
    </main>
  );
}
