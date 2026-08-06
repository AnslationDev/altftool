"use client";

import { useMemo, useState } from "react";
import { Briefcase, Check, Copy, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  AUDIENCE_OPTIONS,
  FRAMEWORK_OPTIONS,
  LENGTH_OPTIONS,
  TONE_OPTIONS,
  buildCaseStudyPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  clientName: "Acme Logistics",
  industry: "third-party logistics",
  offering: "route optimisation software",
  problem:
    "Drivers were spending up to 90 minutes a day on manual route planning, and late deliveries had climbed to 12% of orders.",
  approach:
    "Rolled out automated route optimisation across 3 depots in 6 weeks, with driver training and a two-week parallel run.",
  results:
    "Late deliveries fell from 12% to 4% within one quarter and planning time dropped to under 10 minutes per driver per day.",
  metrics: "12% → 4% late deliveries; 90 min → 10 min daily planning time",
  frameworkId: FRAMEWORK_OPTIONS[0].id,
  toneId: TONE_OPTIONS[0].id,
  audienceId: AUDIENCE_OPTIONS[0].id,
  lengthId: LENGTH_OPTIONS[1].id,
  includeQuote: true,
  anonymise: false,
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const { copy: copyToClipboard, isCopied, announcement } = useCopyToClipboard();

  const set = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const setBool = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.checked }));

  const result = useMemo(() => buildCaseStudyPrompt(form), [form]);
  const hasError = Boolean(result.error);

  const copyResult = () => {
    if (hasError) return;
    copyToClipboard("result", result.prompt, { label: "the case study prompt" });
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset all case study facts and settings to the sample defaults?")
    ) {
      return;
    }
    setForm(DEFAULTS);
  };

  const rows = hasError
    ? [
        ["Framework", DASH],
        ["Sections", DASH],
        ["Target case study length", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Framework", result.frameworkLabel],
        ["Sections", NUM.format(result.sectionCount)],
        ["Target case study length", `${NUM.format(result.targetWords)} words`],
        [
          "Prompt length",
          `${NUM.format(result.promptWords)} words · ${NUM.format(result.promptChars)} characters`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          AI Writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Case Study Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn your raw facts — problem, approach and measurable results — into a structured
          prompt any AI assistant can follow, built on Problem–Solution–Result, STAR or
          Challenge–Solution–Impact frameworks.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-client">
              Client name
            </label>
            <input
              id="cs-client"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.clientName}
              onChange={set("clientName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-industry">
              Industry
            </label>
            <input
              id="cs-industry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.industry}
              onChange={set("industry")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cs-offering">
              Product or service featured
            </label>
            <input
              id="cs-offering"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.offering}
              onChange={set("offering")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cs-problem">
              The problem (required)
            </label>
            <textarea
              id="cs-problem"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.problem}
              onChange={set("problem")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cs-approach">
              The approach / solution (required)
            </label>
            <textarea
              id="cs-approach"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.approach}
              onChange={set("approach")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cs-results">
              Measurable results (required)
            </label>
            <textarea
              id="cs-results"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.results}
              onChange={set("results")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cs-metrics">
              Key metrics to quote verbatim (optional)
            </label>
            <input
              id="cs-metrics"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.metrics}
              onChange={set("metrics")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-framework">
              Framework
            </label>
            <select
              id="cs-framework"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.frameworkId}
              onChange={set("frameworkId")}
            >
              {FRAMEWORK_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-length">
              Case study length
            </label>
            <select
              id="cs-length"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.lengthId}
              onChange={set("lengthId")}
            >
              {LENGTH_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} (~{NUM.format(option.words)} words)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-tone">
              Tone
            </label>
            <select
              id="cs-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.toneId}
              onChange={set("toneId")}
            >
              {TONE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-audience">
              Audience
            </label>
            <select
              id="cs-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.audienceId}
              onChange={set("audienceId")}
            >
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-6">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="cs-quote"
          >
            <input
              id="cs-quote"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={form.includeQuote}
              onChange={setBool("includeQuote")}
            />
            Leave room for a client quote
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="cs-anon"
          >
            <input
              id="cs-anon"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={form.anonymise}
              onChange={setBool("anonymise")}
            />
            Anonymise the client
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
              Estimated prompt tokens
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.estTokens)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to generate the prompt."
                : "Rough estimate at ~4 characters per token."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={
                isCopied("result")
                  ? "Copied the generated case study prompt to clipboard"
                  : "Copy the generated case study prompt"
              }
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy prompt"}
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
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
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
          <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
            {hasError ? DASH : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The generated prompt instructs the AI to use only the facts you supply — always verify
        names, numbers and claims in the drafted case study before publishing.
      </p>
    </main>
  );
}
