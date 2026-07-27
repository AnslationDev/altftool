"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Microscope, RotateCcw } from "lucide-react";

import {
  AUDIENCES,
  MAX_TOTAL_WORDS,
  MIN_TOTAL_WORDS,
  SECTIONS,
  buildResearchSummaryPrompt,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const DEFAULTS = {
  field: "clinical psychology",
  totalWords: "400",
  sectionIds: SECTIONS.map((section) => section.id),
  audienceId: "student",
  requireQuotes: true,
  glossary: false,
};

export default function ToolHome() {
  const [field, setField] = useState(DEFAULTS.field);
  const [totalWords, setTotalWords] = useState(DEFAULTS.totalWords);
  const [sectionIds, setSectionIds] = useState(DEFAULTS.sectionIds);
  const [audienceId, setAudienceId] = useState(DEFAULTS.audienceId);
  const [requireQuotes, setRequireQuotes] = useState(DEFAULTS.requireQuotes);
  const [glossary, setGlossary] = useState(DEFAULTS.glossary);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildResearchSummaryPrompt({
        field,
        totalWords: totalWords.trim() === "" ? Number.NaN : Number(totalWords),
        sectionIds,
        audienceId,
        requireQuotes,
        glossary,
      }),
    [field, totalWords, sectionIds, audienceId, requireQuotes, glossary],
  );

  const hasError = Boolean(result.error);

  const toggleSection = (id) => {
    setSectionIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
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
    setField(DEFAULTS.field);
    setTotalWords(DEFAULTS.totalWords);
    setSectionIds(DEFAULTS.sectionIds);
    setAudienceId(DEFAULTS.audienceId);
    setRequireQuotes(DEFAULTS.requireQuotes);
    setGlossary(DEFAULTS.glossary);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Sections requested", DASH],
        ["Written for", DASH],
        ["Source references", DASH],
      ]
    : [
        ["Sections requested", NUM.format(result.sectionCount)],
        ["Written for", result.audience],
        ["Source references", requireQuotes ? "Required after each key claim" : "Not requested"],
        ["Glossary", glossary ? "Up to 8 terms, after the summary" : "Not requested"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Microscope className="h-4 w-4" aria-hidden="true" />
          AI for learning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Research Summary Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a prompt that makes an AI summarise a paper into structured-abstract sections —
          method and limitations included — with a word budget for each section and a rule that
          anything the paper does not state must be marked &ldquo;not reported&rdquo;.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rs-field">
              Research field (optional)
            </label>
            <input
              id="rs-field"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="e.g. materials science"
              value={field}
              onChange={(event) => setField(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rs-words">
              Summary length in words ({MIN_TOTAL_WORDS}&ndash;{MAX_TOTAL_WORDS})
            </label>
            <input
              id="rs-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_TOTAL_WORDS}
              max={MAX_TOTAL_WORDS}
              step="50"
              value={totalWords}
              onChange={(event) => setTotalWords(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rs-audience">
              Who is the summary for?
            </label>
            <select
              id="rs-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              value={audienceId}
              onChange={(event) => setAudienceId(event.target.value)}
            >
              {AUDIENCES.map((audience) => (
                <option key={audience.id} value={audience.id}>
                  {audience.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Sections to include
          </legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {SECTIONS.map((section) => (
              <label
                key={section.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`rs-section-${section.id}`}
              >
                <input
                  id={`rs-section-${section.id}`}
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={sectionIds.includes(section.id)}
                  onChange={() => toggleSection(section.id)}
                />
                {section.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-1 sm:grid-cols-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="rs-quotes">
            <input
              id="rs-quotes"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={requireQuotes}
              onChange={(event) => setRequireQuotes(event.target.checked)}
            />
            Cite the section or page for each claim
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="rs-glossary">
            <input
              id="rs-glossary"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={glossary}
              onChange={(event) => setGlossary(event.target.checked)}
            />
            Add a jargon glossary
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
              Total word budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.totalWords)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to generate the prompt."
                : "Split across the chosen sections so the parts sum exactly to the total."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated research summary prompt"
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
          <h2 className="text-base font-semibold">Word budget by section</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Section
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Words
                  </th>
                </tr>
              </thead>
              <tbody>
                {hasError ? (
                  <tr>
                    <td className="py-2 pr-3">{DASH}</td>
                    <td className="py-2 text-right font-semibold">{DASH}</td>
                  </tr>
                ) : (
                  result.budgets.map((budget) => (
                    <tr key={budget.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{budget.label}</td>
                      <td className="py-2 text-right font-semibold">{NUM.format(budget.words)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5">
          <h2 className="text-base font-semibold">Generated prompt</h2>
          <pre className="mt-2 max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
            {hasError ? "Fix the input above to generate the prompt." : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The prompt is assembled locally in your browser. AI summaries can still misread a table or
        drop a caveat, so check every number and every limitation against the paper before you cite
        it.
      </p>
    </main>
  );
}
