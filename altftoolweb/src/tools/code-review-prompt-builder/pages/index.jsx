"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SearchCode } from "lucide-react";

import {
  CAREFUL_REVIEW_LOC_PER_HOUR,
  FOCUS_AREAS,
  LIMITS,
  MAX_EFFECTIVE_REVIEW_LOC,
  assessReviewSize,
  buildReviewPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

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
  language: "TypeScript (Node.js + Express)",
  loc: "250",
  focusIds: ["correctness", "security"],
  context: "Adds a password-reset endpoint that emails a signed one-time token.",
  code: "",
};

const DASH = "—";

export default function ToolHome() {
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [loc, setLoc] = useState(DEFAULTS.loc);
  const [focusIds, setFocusIds] = useState(DEFAULTS.focusIds);
  const [context, setContext] = useState(DEFAULTS.context);
  const [code, setCode] = useState(DEFAULTS.code);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const size = assessReviewSize({ loc });
    if (size.error) return size;
    return buildReviewPrompt({ language, focusIds, context, code, size });
  }, [language, loc, focusIds, context, code]);

  const hasError = Boolean(result.error);
  const size = hasError ? null : result.size;

  const toggleFocus = (id) => {
    setFocusIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

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
    setLanguage(DEFAULTS.language);
    setLoc(DEFAULTS.loc);
    setFocusIds(DEFAULTS.focusIds);
    setContext(DEFAULTS.context);
    setCode(DEFAULTS.code);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Review passes needed", DASH],
        ["Careful-review time", DASH],
        ["Focus areas", DASH],
        ["Prompt length", DASH],
      ]
    : [
        [
          "Review passes needed",
          size.oversized
            ? `${size.chunks} (change exceeds ${MAX_EFFECTIVE_REVIEW_LOC} LOC)`
            : "1",
        ],
        [
          "Careful-review time",
          `~${NUM.format(size.minutes)} min at ${CAREFUL_REVIEW_LOC_PER_HOUR} LOC/hour`,
        ],
        ["Focus areas", result.areas.join(", ")],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SearchCode className="h-4 w-4" aria-hidden="true" />
          AI Coding
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Code Review Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Picks the right checklist for a correctness, security, performance,
          style or maintainability review, adds a four-level severity scheme,
          and warns when the change is too big to review in one pass.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="crp-lang">
              Language / stack
            </label>
            <input
              id="crp-lang"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="crp-loc">
              Change size (lines of code)
            </label>
            <input
              id="crp-loc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.loc.min}
              max={LIMITS.loc.max}
              value={loc}
              onChange={(event) => setLoc(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="crp-context">
              What the change does (optional)
            </label>
            <input
              id="crp-context"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={context}
              onChange={(event) => setContext(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="crp-code">
              Paste the diff or code (optional — otherwise the prompt says to paste it after)
            </label>
            <textarea
              id="crp-code"
              className={`mt-2 ${AREA_CLASS}`}
              rows={6}
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="diff --git a/src/auth.ts b/src/auth.ts …"
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Review focus
          </legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {FOCUS_AREAS.map((area) => (
              <label
                key={area.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 text-sm text-[var(--foreground)]"
                htmlFor={`crp-focus-${area.id}`}
              >
                <input
                  id={`crp-focus-${area.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={focusIds.includes(area.id)}
                  onChange={() => toggleFocus(area.id)}
                />
                {area.label}
              </label>
            ))}
          </div>
        </fieldset>
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
              Change under review
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(size.loc)} LOC`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : size.oversized
                  ? `Defect discovery drops sharply above ~${MAX_EFFECTIVE_REVIEW_LOC} LOC per review — the prompt asks for ${size.chunks} passes.`
                  : "Within the effective single-pass review size."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated code review prompt"
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
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

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
        The 400-LOC effective review limit and ~300 LOC/hour careful pace come
        from SmartBear's study of peer code review at Cisco. Security items
        reference OWASP Top 10 (2021) categories. An AI review assists a human
        reviewer — it does not replace one.
      </p>
    </main>
  );
}
