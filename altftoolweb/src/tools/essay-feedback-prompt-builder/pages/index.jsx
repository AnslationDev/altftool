"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FilePenLine, RotateCcw } from "lucide-react";

import {
  FEEDBACK_DIMENSIONS,
  MAX_WORDS,
  MIN_WORDS,
  buildEssayFeedbackPrompt,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const DEFAULTS = {
  essayType: "Argumentative essay",
  assignmentBrief: "Argue for or against a four-day school week, using at least three sources",
  wordCount: "1500",
  dimensionIds: ["structure", "evidence", "clarity"],
  audience: "High school senior",
  includeSummary: true,
  noRewriting: true,
};

export default function ToolHome() {
  const [essayType, setEssayType] = useState(DEFAULTS.essayType);
  const [assignmentBrief, setAssignmentBrief] = useState(DEFAULTS.assignmentBrief);
  const [wordCount, setWordCount] = useState(DEFAULTS.wordCount);
  const [dimensionIds, setDimensionIds] = useState(DEFAULTS.dimensionIds);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [includeSummary, setIncludeSummary] = useState(DEFAULTS.includeSummary);
  const [noRewriting, setNoRewriting] = useState(DEFAULTS.noRewriting);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildEssayFeedbackPrompt({
        essayType,
        assignmentBrief,
        wordCount: wordCount.trim() === "" ? Number.NaN : Number(wordCount),
        dimensionIds,
        audience,
        includeSummary,
        noRewriting,
      }),
    [essayType, assignmentBrief, wordCount, dimensionIds, audience, includeSummary, noRewriting],
  );

  const hasError = Boolean(result.error);

  const toggleDimension = (id) => {
    setDimensionIds((current) =>
      current.includes(id) ? current.filter((dimensionId) => dimensionId !== id) : [...current, id],
    );
  };

  const copyPrompt = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setEssayType(DEFAULTS.essayType);
    setAssignmentBrief(DEFAULTS.assignmentBrief);
    setWordCount(DEFAULTS.wordCount);
    setDimensionIds(DEFAULTS.dimensionIds);
    setAudience(DEFAULTS.audience);
    setIncludeSummary(DEFAULTS.includeSummary);
    setNoRewriting(DEFAULTS.noRewriting);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Essay length", DASH],
        ["Dimensions reviewed", DASH],
        ["Rewriting", DASH],
      ]
    : [
        ["Essay length", `${NUM.format(result.wordCount)} words`],
        ["Dimensions reviewed", result.dimensions.join(", ")],
        ["Rewriting by the AI", noRewriting ? "Forbidden" : "Allowed"],
        ["Priorities summary", includeSummary ? "Included" : "Not included"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FilePenLine className="h-4 w-4" aria-hidden="true" />
          AI for learning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Essay Feedback Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a reviewer prompt that gives quote-anchored, actionable feedback on structure,
          evidence and clarity — with a comment budget scaled to your essay&apos;s length so the
          feedback is dense enough to use but never a wall of nitpicks.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ef-type">
              Type of essay
            </label>
            <input
              id="ef-type"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={essayType}
              onChange={(event) => setEssayType(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ef-words">
              Approximate length in words ({MIN_WORDS}–{NUM.format(MAX_WORDS)})
            </label>
            <input
              id="ef-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_WORDS}
              max={MAX_WORDS}
              step="50"
              value={wordCount}
              onChange={(event) => setWordCount(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ef-brief">
              Assignment brief (optional)
            </label>
            <input
              id="ef-brief"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={assignmentBrief}
              onChange={(event) => setAssignmentBrief(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ef-audience">
              Writer&apos;s level (optional)
            </label>
            <input
              id="ef-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Feedback dimensions</legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FEEDBACK_DIMENSIONS.map((dimension) => (
              <label
                key={dimension.id}
                htmlFor={`ef-dim-${dimension.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              >
                <input
                  id={`ef-dim-${dimension.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={dimensionIds.includes(dimension.id)}
                  onChange={() => toggleDimension(dimension.id)}
                />
                {dimension.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="ef-norewrite"
          >
            <input
              id="ef-norewrite"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={noRewriting}
              onChange={(event) => setNoRewriting(event.target.checked)}
            />
            Forbid the AI from rewriting passages itself
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="ef-summary"
          >
            <input
              id="ef-summary"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={includeSummary}
              onChange={(event) => setIncludeSummary(event.target.checked)}
            />
            End with a top-3 &quot;next draft priorities&quot; list
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Comment budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.commentBudget)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Substantive, quote-anchored comments the AI must give — about one per 150 words."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated essay feedback prompt"
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
          <h2 className="text-base font-semibold">Generated prompt</h2>
          <pre className="mt-2 max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
            {hasError ? "Fix the input above to generate the prompt." : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Paste the prompt first, wait for &quot;Ready&quot;, then paste the essay. If the essay is
        someone else&apos;s work, get their permission before sharing it with an AI service, and
        check your institution&apos;s policy on AI-assisted feedback.
      </p>
    </main>
  );
}
