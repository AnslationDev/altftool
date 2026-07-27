"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListTree, RotateCcw } from "lucide-react";

import {
  ANGLES,
  LIMITS,
  SEARCH_INTENTS,
  buildOutlinePrompt,
  planOutline,
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
  topic: "How to start a sourdough starter at home",
  audience: "home bakers who have never baked with wild yeast",
  angle: ANGLES[7],
  intentId: "how-to",
  keyword: "sourdough starter",
  notes: "",
  totalWords: "1500",
  sectionCount: "5",
  subsections: "0",
  faqCount: "4",
  includeKeyTakeaways: true,
};

const DASH = "—";

export default function ToolHome() {
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [angle, setAngle] = useState(DEFAULTS.angle);
  const [intentId, setIntentId] = useState(DEFAULTS.intentId);
  const [keyword, setKeyword] = useState(DEFAULTS.keyword);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [totalWords, setTotalWords] = useState(DEFAULTS.totalWords);
  const [sectionCount, setSectionCount] = useState(DEFAULTS.sectionCount);
  const [subsections, setSubsections] = useState(DEFAULTS.subsections);
  const [faqCount, setFaqCount] = useState(DEFAULTS.faqCount);
  const [includeKeyTakeaways, setIncludeKeyTakeaways] = useState(
    DEFAULTS.includeKeyTakeaways,
  );
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const plan = planOutline({
      totalWords,
      sectionCount,
      subsectionsPerSection: subsections,
      faqCount,
      includeKeyTakeaways,
    });
    if (plan.error) return plan;
    return buildOutlinePrompt({
      topic,
      audience,
      angle,
      intentId,
      keyword,
      notes,
      plan,
    });
  }, [
    topic,
    audience,
    angle,
    intentId,
    keyword,
    notes,
    totalWords,
    sectionCount,
    subsections,
    faqCount,
    includeKeyTakeaways,
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
    setTopic(DEFAULTS.topic);
    setAudience(DEFAULTS.audience);
    setAngle(DEFAULTS.angle);
    setIntentId(DEFAULTS.intentId);
    setKeyword(DEFAULTS.keyword);
    setNotes(DEFAULTS.notes);
    setTotalWords(DEFAULTS.totalWords);
    setSectionCount(DEFAULTS.sectionCount);
    setSubsections(DEFAULTS.subsections);
    setFaqCount(DEFAULTS.faqCount);
    setIncludeKeyTakeaways(DEFAULTS.includeKeyTakeaways);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Introduction budget", DASH],
        ["Body sections", DASH],
        ["FAQ block", DASH],
        ["Conclusion budget", DASH],
        ["Headings the outline will hold", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Introduction budget", `${NUM.format(plan.intro)} words`],
        [
          "Body sections",
          `${plan.sections} × ~${NUM.format(Math.round(plan.perSection))} words`,
        ],
        [
          "FAQ block",
          plan.faqBlock > 0
            ? `${plan.faqs} questions, ${NUM.format(plan.faqBlock)} words`
            : "None",
        ],
        ["Conclusion budget", `${NUM.format(plan.conclusion)} words`],
        ["Headings the outline will hold", NUM.format(plan.headingCount)],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListTree className="h-4 w-4" aria-hidden="true" />
          AI Writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Blog Outline Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Splits your target word count across the intro, H2 sections, FAQ and
          conclusion, then writes an outline prompt with that exact budget built
          in — so the model plans a piece that fits the length you asked for.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bop-topic">
              Article topic
            </label>
            <input
              id="bop-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bop-audience">
              Who is reading
            </label>
            <input
              id="bop-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bop-keyword">
              Primary search term (optional)
            </label>
            <input
              id="bop-keyword"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bop-angle">
              Angle
            </label>
            <select
              id="bop-angle"
              className={`mt-2 ${INPUT_CLASS}`}
              value={angle}
              onChange={(event) => setAngle(event.target.value)}
            >
              {ANGLES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bop-intent">
              What the reader wants
            </label>
            <select
              id="bop-intent"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="bop-words">
              Target length (words)
            </label>
            <input
              id="bop-words"
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
            <label className={LABEL_CLASS} htmlFor="bop-sections">
              Main H2 sections
            </label>
            <input
              id="bop-sections"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.sections.min}
              max={LIMITS.sections.max}
              value={sectionCount}
              onChange={(event) => setSectionCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bop-subs">
              H3 subsections per section
            </label>
            <input
              id="bop-subs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.subsections.min}
              max={LIMITS.subsections.max}
              value={subsections}
              onChange={(event) => setSubsections(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bop-faqs">
              FAQ questions
            </label>
            <input
              id="bop-faqs"
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
            <label className={LABEL_CLASS} htmlFor="bop-notes">
              Extra instruction for the model (optional)
            </label>
            <input
              id="bop-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. British English, cite only primary sources"
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="bop-takeaways"
        >
          <input
            id="bop-takeaways"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={includeKeyTakeaways}
            onChange={(event) => setIncludeKeyTakeaways(event.target.checked)}
          />
          Reserve a 90-word key-takeaways box near the top
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
              aria-label="Copy the generated outline prompt"
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
        The word budget is a planning aid: shares of 10% for the introduction and
        8% for the conclusion, a 238 words-per-minute reading rate, and roughly
        four characters per token are rules of thumb, not guarantees of what any
        model will produce.
      </p>
    </main>
  );
}
