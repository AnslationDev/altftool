"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FlaskConical, RotateCcw } from "lucide-react";

import {
  EDGE_CASE_CLASSES,
  LANGUAGES,
  LIMITS,
  buildTestPrompt,
  estimateTestPlan,
  getLanguage,
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
  languageId: "javascript",
  frameworkId: "vitest",
  functionCount: "3",
  coverageTarget: "85",
  edgeCaseIds: ["empty", "boundary", "error"],
  code: "",
  notes: "",
};

const DASH = "—";

export default function ToolHome() {
  const [languageId, setLanguageId] = useState(DEFAULTS.languageId);
  const [frameworkId, setFrameworkId] = useState(DEFAULTS.frameworkId);
  const [functionCount, setFunctionCount] = useState(DEFAULTS.functionCount);
  const [coverageTarget, setCoverageTarget] = useState(DEFAULTS.coverageTarget);
  const [edgeCaseIds, setEdgeCaseIds] = useState(DEFAULTS.edgeCaseIds);
  const [code, setCode] = useState(DEFAULTS.code);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [copied, setCopied] = useState(false);

  const frameworks = getLanguage(languageId)?.frameworks ?? [];

  const result = useMemo(() => {
    const plan = estimateTestPlan({ functionCount, edgeCaseIds, coverageTarget });
    if (plan.error) return plan;
    return buildTestPrompt({ languageId, frameworkId, code, notes, plan });
  }, [languageId, frameworkId, functionCount, coverageTarget, edgeCaseIds, code, notes]);

  const hasError = Boolean(result.error);
  const plan = hasError ? null : result.plan;

  const changeLanguage = (id) => {
    setLanguageId(id);
    const first = getLanguage(id)?.frameworks[0]?.id ?? "";
    setFrameworkId(first);
  };

  const toggleEdgeCase = (id) => {
    setEdgeCaseIds((current) =>
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
    setLanguageId(DEFAULTS.languageId);
    setFrameworkId(DEFAULTS.frameworkId);
    setFunctionCount(DEFAULTS.functionCount);
    setCoverageTarget(DEFAULTS.coverageTarget);
    setEdgeCaseIds(DEFAULTS.edgeCaseIds);
    setCode(DEFAULTS.code);
    setNotes(DEFAULTS.notes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Tests per function", DASH],
        ["Coverage target", DASH],
        ["Framework", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Tests per function", `${plan.perFunction} (1 happy path + ${plan.classes.length} edge classes)`],
        ["Coverage target", `${plan.coverage}% branch — ${plan.coverageBand}`],
        ["Framework", result.framework.label],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          AI Coding
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Unit Test Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Choose your framework, coverage target and edge-case classes, and get
          a test-generation prompt that demands real assertions, isolated tests
          and an honest list of uncoverable branches.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="utp-lang">
              Language
            </label>
            <select
              id="utp-lang"
              className={`mt-2 ${INPUT_CLASS}`}
              value={languageId}
              onChange={(event) => changeLanguage(event.target.value)}
            >
              {LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="utp-framework">
              Test framework
            </label>
            <select
              id="utp-framework"
              className={`mt-2 ${INPUT_CLASS}`}
              value={frameworkId}
              onChange={(event) => setFrameworkId(event.target.value)}
            >
              {frameworks.map((framework) => (
                <option key={framework.id} value={framework.id}>
                  {framework.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="utp-functions">
              Public functions under test
            </label>
            <input
              id="utp-functions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.functionCount.min}
              max={LIMITS.functionCount.max}
              value={functionCount}
              onChange={(event) => setFunctionCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="utp-coverage">
              Branch coverage target (%)
            </label>
            <input
              id="utp-coverage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.coverage.min}
              max={LIMITS.coverage.max}
              value={coverageTarget}
              onChange={(event) => setCoverageTarget(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="utp-code">
              Paste the code under test (optional)
            </label>
            <textarea
              id="utp-code"
              className={`mt-2 ${AREA_CLASS}`}
              rows={5}
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="export function parseDuration(input) { … }"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="utp-notes">
              Extra instruction (optional)
            </label>
            <input
              id="utp-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. use the existing test/factories.ts helpers"
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Edge-case classes to cover
          </legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {EDGE_CASE_CLASSES.map((edgeClass) => (
              <label
                key={edgeClass.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 text-sm text-[var(--foreground)]"
                htmlFor={`utp-edge-${edgeClass.id}`}
              >
                <input
                  id={`utp-edge-${edgeClass.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={edgeCaseIds.includes(edgeClass.id)}
                  onChange={() => toggleEdgeCase(edgeClass.id)}
                />
                {edgeClass.label}
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
              Baseline test count
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(plan.totalTests)} tests`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${plan.functions} function${plan.functions > 1 ? "s" : ""} × ${plan.perFunction} tests each, before parameterisation merges any.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated unit test prompt"
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
        The edge-case classes follow classic boundary-value analysis; the
        60/75/90% coverage bands follow Google's published code-coverage
        guidance. Coverage measures execution, not correctness — review the
        generated assertions before trusting them.
      </p>
    </main>
  );
}
