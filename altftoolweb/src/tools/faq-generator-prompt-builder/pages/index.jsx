"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageCircleQuestion, RotateCcw } from "lucide-react";

import {
  ANSWER_LENGTHS,
  INTENT_CATEGORIES,
  LIMITS,
  TONES,
  buildFaqPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  productName: "PayrollBox",
  description:
    "PayrollBox is a payroll app for Indian small businesses. It runs monthly payroll, files TDS and PF returns, and emails payslips for up to 200 employees. Plans start at INR 1,999 a month and setup takes about a day with a spreadsheet import.",
  audience: "HR and finance leads at 20 to 200 person companies",
  questionCount: "10",
  categoryIds: ["basics", "pricing", "setup", "trust"],
  lengthId: "snippet",
  toneId: "plain",
  includeSchema: true,
  notes: "",
};

export default function ToolHome() {
  const [productName, setProductName] = useState(DEFAULTS.productName);
  const [description, setDescription] = useState(DEFAULTS.description);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [questionCount, setQuestionCount] = useState(DEFAULTS.questionCount);
  const [categoryIds, setCategoryIds] = useState(DEFAULTS.categoryIds);
  const [lengthId, setLengthId] = useState(DEFAULTS.lengthId);
  const [toneId, setToneId] = useState(DEFAULTS.toneId);
  const [includeSchema, setIncludeSchema] = useState(DEFAULTS.includeSchema);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildFaqPrompt({
        productName,
        description,
        audience,
        questionCount: Number(questionCount),
        categoryIds,
        lengthId,
        toneId,
        includeSchema,
        notes,
      }),
    [
      productName,
      description,
      audience,
      questionCount,
      categoryIds,
      lengthId,
      toneId,
      includeSchema,
      notes,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleCategory = (id) => {
    setCategoryIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
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
    setProductName(DEFAULTS.productName);
    setDescription(DEFAULTS.description);
    setAudience(DEFAULTS.audience);
    setQuestionCount(DEFAULTS.questionCount);
    setCategoryIds(DEFAULTS.categoryIds);
    setLengthId(DEFAULTS.lengthId);
    setToneId(DEFAULTS.toneId);
    setIncludeSchema(DEFAULTS.includeSchema);
    setNotes(DEFAULTS.notes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Coverage plan", DASH],
        ["Answer length", DASH],
        ["Estimated FAQ body", DASH],
        ["Recurring terms found", DASH],
        ["Prompt length", DASH],
      ]
    : [
        [
          "Coverage plan",
          result.plan.map((item) => `${item.count} × ${item.label}`).join(" · "),
        ],
        ["Answer length", `${result.length.min}–${result.length.max} words each`],
        ["Estimated FAQ body", `~${NUM.format(result.estimatedWords)} words`],
        [
          "Recurring terms found",
          result.terms.length === 0
            ? "none"
            : result.terms.map((item) => item.term).join(", "),
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
          <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
          FAQ content
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          FAQ Generator Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a product description, pick how many questions and which buyer
          concerns to cover, and get a prompt that returns customer-worded
          questions, snippet-length answers and matching FAQPage schema.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="faq-name">
              Product or service name
            </label>
            <input
              id="faq-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="faq-count">
              How many questions ({LIMITS.questions.min}–{LIMITS.questions.max})
            </label>
            <input
              id="faq-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.questions.min}
              max={LIMITS.questions.max}
              step="1"
              value={questionCount}
              onChange={(event) => setQuestionCount(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="faq-desc">
              Product description — the only facts the model may use
            </label>
            <textarea
              id="faq-desc"
              className={`mt-2 ${AREA_CLASS}`}
              rows={6}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="faq-audience">
              Audience (optional)
            </label>
            <input
              id="faq-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="faq-length">
              Answer length
            </label>
            <select
              id="faq-length"
              className={`mt-2 ${INPUT_CLASS}`}
              value={lengthId}
              onChange={(event) => setLengthId(event.target.value)}
            >
              {ANSWER_LENGTHS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="faq-tone">
              Tone
            </label>
            <select
              id="faq-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={toneId}
              onChange={(event) => setToneId(event.target.value)}
            >
              {TONES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-semibold text-[var(--foreground)]">
              Question categories to cover
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {INTENT_CATEGORIES.map((category) => (
                <label
                  key={category.id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  htmlFor={`faq-cat-${category.id}`}
                >
                  <input
                    id={`faq-cat-${category.id}`}
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--primary)]"
                    checked={categoryIds.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                  />
                  <span>{category.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              htmlFor="faq-schema"
            >
              <input
                id="faq-schema"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={includeSchema}
                onChange={(event) => setIncludeSchema(event.target.checked)}
              />
              <span>Also ask for schema.org FAQPage JSON-LD</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="faq-notes">
              Extra instruction (optional)
            </label>
            <input
              id="faq-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. mention the 14-day trial once; British spelling"
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Questions planned
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.questionCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Spread evenly across the categories you ticked, in buyer order."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated FAQ prompt"
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
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
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
        The 40 to 60 word target matches the length search engines typically
        show in a featured snippet. Adding FAQPage JSON-LD keeps your markup
        machine-readable, but Google has limited FAQ rich results to well-known
        government and health sites since August 2023 — do not expect the
        markup alone to change how the page is displayed.
      </p>
    </main>
  );
}
