"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SearchCheck } from "lucide-react";

import {
  LIMITS,
  SEARCH_INTENTS,
  buildSeoArticlePrompt,
  planSeoArticle,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  query: "how to compress a pdf without losing quality",
  audience: "office workers emailing large PDF files",
  intentId: "informational",
  secondaryKeywords: "reduce pdf file size, pdf compressor online",
  notes: "",
  totalWords: "2000",
  h2Count: "6",
  h3PerH2: "0",
  faqCount: "5",
};

const DASH = "—";

export default function ToolHome() {
  const [query, setQuery] = useState(DEFAULTS.query);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [intentId, setIntentId] = useState(DEFAULTS.intentId);
  const [secondaryKeywords, setSecondaryKeywords] = useState(
    DEFAULTS.secondaryKeywords,
  );
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [totalWords, setTotalWords] = useState(DEFAULTS.totalWords);
  const [h2Count, setH2Count] = useState(DEFAULTS.h2Count);
  const [h3PerH2, setH3PerH2] = useState(DEFAULTS.h3PerH2);
  const [faqCount, setFaqCount] = useState(DEFAULTS.faqCount);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const plan = planSeoArticle({ totalWords, h2Count, h3PerH2, faqCount });
    if (plan.error) return plan;
    return buildSeoArticlePrompt({
      query,
      audience,
      intentId,
      secondaryKeywords,
      notes,
      plan,
    });
  }, [
    query,
    audience,
    intentId,
    secondaryKeywords,
    notes,
    totalWords,
    h2Count,
    h3PerH2,
    faqCount,
  ]);

  const hasError = Boolean(result.error);
  const plan = hasError ? null : result.plan;

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
    setQuery(DEFAULTS.query);
    setAudience(DEFAULTS.audience);
    setIntentId(DEFAULTS.intentId);
    setSecondaryKeywords(DEFAULTS.secondaryKeywords);
    setNotes(DEFAULTS.notes);
    setTotalWords(DEFAULTS.totalWords);
    setH2Count(DEFAULTS.h2Count);
    setH3PerH2(DEFAULTS.h3PerH2);
    setFaqCount(DEFAULTS.faqCount);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Opening block", DASH],
        ["Body H2 sections", DASH],
        ["FAQ block", DASH],
        ["Conclusion", DASH],
        ["Max exact-query mentions", DASH],
        ["Headings on the page", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Opening block", `${NUM.format(plan.intro)} words, answer first`],
        [
          "Body H2 sections",
          `${plan.h2Count} × ~${NUM.format(Math.round(plan.perH2))} words`,
        ],
        [
          "FAQ block",
          plan.faqBlock > 0
            ? `${plan.faqs} questions, ${NUM.format(plan.faqBlock)} words`
            : "None",
        ],
        ["Conclusion", `${NUM.format(plan.conclusion)} words`],
        ["Max exact-query mentions", `${plan.maxQueryMentions} (~1% density cap)`],
        ["Headings on the page", NUM.format(plan.headingCount)],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SearchCheck className="h-4 w-4" aria-hidden="true" />
          AI Writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          SEO Article Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turns a target query, its search intent and your heading structure into
          an article prompt with the word budget, title-tag and meta-description
          limits, and a keyword-stuffing cap written in.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sap-query">
              Target search query
            </label>
            <input
              id="sap-query"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sap-audience">
              Who is searching
            </label>
            <input
              id="sap-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sap-intent">
              Search intent
            </label>
            <select
              id="sap-intent"
              className={`mt-2 ${INPUT_CLASS}`}
              value={intentId}
              onChange={(event) => setIntentId(event.target.value)}
            >
              {SEARCH_INTENTS.map((intent) => (
                <option key={intent.id} value={intent.id}>
                  {intent.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sap-secondary">
              Secondary terms (comma-separated, optional)
            </label>
            <input
              id="sap-secondary"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={secondaryKeywords}
              onChange={(event) => setSecondaryKeywords(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sap-words">
              Target length (words)
            </label>
            <input
              id="sap-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.totalWords.min}
              max={LIMITS.totalWords.max}
              step="100"
              value={totalWords}
              onChange={(event) => setTotalWords(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sap-h2">
              H2 sections
            </label>
            <input
              id="sap-h2"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.h2.min}
              max={LIMITS.h2.max}
              value={h2Count}
              onChange={(event) => setH2Count(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sap-h3">
              H3s per H2
            </label>
            <input
              id="sap-h3"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.h3PerH2.min}
              max={LIMITS.h3PerH2.max}
              value={h3PerH2}
              onChange={(event) => setH3PerH2(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sap-faqs">
              FAQ questions
            </label>
            <input
              id="sap-faqs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.faqs.min}
              max={LIMITS.faqs.max}
              value={faqCount}
              onChange={(event) => setFaqCount(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sap-notes">
              Extra instruction for the model (optional)
            </label>
            <input
              id="sap-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. Indian English, mention our free tool once"
            />
          </div>
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

      {!hasError && plan.warnings.length > 0 ? (
        <ul className="mt-6 space-y-2">
          {plan.warnings.map((warning) => (
            <li
              key={warning}
              className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {warning}
            </li>
          ))}
        </ul>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Planned article length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(plan.total)} words`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `About ${plan.readingMinutes.toFixed(1)} minutes of reading at 238 words per minute.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated SEO article prompt"
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
            <div
              key={label}
              className="flex items-center justify-between gap-4 py-2.5"
            >
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
        The 60-character title tag, 70–160 character meta description and ~1%
        query-density cap are practitioner rules of thumb, not published Google
        limits — Google truncates by pixels and names no numeric density
        threshold.
      </p>
    </main>
  );
}
