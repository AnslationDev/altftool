"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, RotateCcw, Wrench } from "lucide-react";

import {
  CONSTRAINTS,
  GOALS,
  LIMITS,
  MCCABE_COMPLEXITY_LIMIT,
  assessComplexity,
  buildRefactorPrompt,
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
  language: "Python",
  goalIds: ["extract-function", "guard-clauses"],
  constraintIds: ["behaviour", "api", "tests"],
  currentComplexity: "18",
  targetComplexity: "8",
  context: "A 300-line order-pricing function grown over four years of discount rules.",
  code: "",
};

const DASH = "—";

export default function ToolHome() {
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [goalIds, setGoalIds] = useState(DEFAULTS.goalIds);
  const [constraintIds, setConstraintIds] = useState(DEFAULTS.constraintIds);
  const [currentComplexity, setCurrentComplexity] = useState(DEFAULTS.currentComplexity);
  const [targetComplexity, setTargetComplexity] = useState(DEFAULTS.targetComplexity);
  const [context, setContext] = useState(DEFAULTS.context);
  const [code, setCode] = useState(DEFAULTS.code);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const result = useMemo(() => {
    const complexity = assessComplexity({ currentComplexity, targetComplexity });
    if (complexity.error) return complexity;
    return buildRefactorPrompt({ language, goalIds, constraintIds, complexity, context, code });
  }, [language, goalIds, constraintIds, currentComplexity, targetComplexity, context, code]);

  const hasError = Boolean(result.error);

  const toggle = (setter) => (id) => {
    setter((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };
  const toggleGoal = toggle(setGoalIds);
  const toggleConstraint = toggle(setConstraintIds);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setLanguage(DEFAULTS.language);
    setGoalIds(DEFAULTS.goalIds);
    setConstraintIds(DEFAULTS.constraintIds);
    setCurrentComplexity(DEFAULTS.currentComplexity);
    setTargetComplexity(DEFAULTS.targetComplexity);
    setContext(DEFAULTS.context);
    setCode(DEFAULTS.code);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Goals", DASH],
        ["Hard constraints", DASH],
        ["Complexity target", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Goals", String(result.goals.length)],
        ["Hard constraints", String(result.constraints.length)],
        [
          "Complexity target",
          result.complexity.enabled
            ? `${result.complexity.current} → ${result.complexity.target} (limit ${MCCABE_COMPLEXITY_LIMIT})`
            : "Not set",
        ],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wrench className="h-4 w-4" aria-hidden="true" />
          AI Coding
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Refactor Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Names the exact refactorings to apply (from Fowler's catalogue), the
          constraints that keep behaviour unchanged, and an optional
          cyclomatic-complexity target — so the model restructures instead of
          rewriting.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rfp-lang">
              Language
            </label>
            <input
              id="rfp-lang"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rfp-context">
              What this code is (optional)
            </label>
            <input
              id="rfp-context"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={context}
              onChange={(event) => setContext(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rfp-current">
              Current cyclomatic complexity (optional)
            </label>
            <input
              id="rfp-current"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.complexity.min}
              max={LIMITS.complexity.max}
              value={currentComplexity}
              onChange={(event) => setCurrentComplexity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rfp-target">
              Target complexity (optional)
            </label>
            <input
              id="rfp-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.complexity.min}
              max={LIMITS.complexity.max}
              value={targetComplexity}
              onChange={(event) => setTargetComplexity(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rfp-code">
              Paste the code (optional)
            </label>
            <textarea
              id="rfp-code"
              className={`mt-2 ${AREA_CLASS}`}
              rows={5}
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="def price_order(order, customer, promos): …"
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Refactoring goals
          </legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {GOALS.map((goal) => (
              <label
                key={goal.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 text-sm text-[var(--foreground)]"
                htmlFor={`rfp-goal-${goal.id}`}
              >
                <input
                  id={`rfp-goal-${goal.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={goalIds.includes(goal.id)}
                  onChange={() => toggleGoal(goal.id)}
                />
                {goal.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Hard constraints
          </legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {CONSTRAINTS.map((constraint) => (
              <label
                key={constraint.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 text-sm text-[var(--foreground)]"
                htmlFor={`rfp-con-${constraint.id}`}
              >
                <input
                  id={`rfp-con-${constraint.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={constraintIds.includes(constraint.id)}
                  onChange={() => toggleConstraint(constraint.id)}
                />
                {constraint.label}
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Refactor plan
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : `${result.goals.length} goal${result.goals.length > 1 ? "s" : ""}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.goals.join(" · ")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated refactoring prompt"
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
        Refactoring names follow Fowler's catalogue (2nd edition); the
        complexity limit of {MCCABE_COMPLEXITY_LIMIT} comes from McCabe's 1976
        paper and is the default in most linters. Always run your test suite
        after applying an AI refactor.
      </p>
    </main>
  );
}
