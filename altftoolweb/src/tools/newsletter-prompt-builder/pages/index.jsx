"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Mail, RotateCcw } from "lucide-react";

import { CADENCES, LIMITS, buildNewsletterPrompt, planNewsletter } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  newsletterName: "The Weekly Build",
  segment: "indie developers shipping side projects",
  theme: "",
  cta: "Reply with the project you're stuck on",
  notes: "",
  totalWords: "600",
  itemCount: "4",
  cadenceId: "weekly",
};

const DASH = "—";

export default function ToolHome() {
  const [newsletterName, setNewsletterName] = useState(DEFAULTS.newsletterName);
  const [segment, setSegment] = useState(DEFAULTS.segment);
  const [theme, setTheme] = useState(DEFAULTS.theme);
  const [cta, setCta] = useState(DEFAULTS.cta);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [totalWords, setTotalWords] = useState(DEFAULTS.totalWords);
  const [itemCount, setItemCount] = useState(DEFAULTS.itemCount);
  const [cadenceId, setCadenceId] = useState(DEFAULTS.cadenceId);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const result = useMemo(() => {
    const plan = planNewsletter({ totalWords, itemCount, cadenceId });
    if (plan.error) return plan;
    return buildNewsletterPrompt({ newsletterName, segment, theme, cta, notes, plan });
  }, [newsletterName, segment, theme, cta, notes, totalWords, itemCount, cadenceId]);

  const hasError = Boolean(result.error);
  const plan = hasError ? null : result.plan;

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
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Reset all fields to defaults? This clears your entered newsletter details and cannot be undone.",
      )
    ) {
      return;
    }
    setNewsletterName(DEFAULTS.newsletterName);
    setSegment(DEFAULTS.segment);
    setTheme(DEFAULTS.theme);
    setCta(DEFAULTS.cta);
    setNotes(DEFAULTS.notes);
    setTotalWords(DEFAULTS.totalWords);
    setItemCount(DEFAULTS.itemCount);
    setCadenceId(DEFAULTS.cadenceId);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Opening note", DASH],
        ["Items", DASH],
        ["Sign-off", DASH],
        ["Subject line limit", DASH],
        ["Preheader range", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Opening note", `${NUM.format(plan.intro)} words`],
        [
          "Items",
          `${plan.items} × ~${NUM.format(Math.floor(plan.perItem))} words`,
        ],
        ["Sign-off", `${NUM.format(plan.signoff)} words`],
        ["Subject line limit", "40 characters"],
        ["Preheader range", "40–100 characters"],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mail className="h-4 w-4" aria-hidden="true" />
          AI Writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Newsletter Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Builds a newsletter-drafting prompt around your audience segment,
          sending cadence and one clear CTA — with subject-line limits and a
          per-item word budget the model has to respect.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-name">
              Newsletter name
            </label>
            <input
              id="nl-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={newsletterName}
              onChange={(event) => setNewsletterName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-segment">
              Audience segment
            </label>
            <input
              id="nl-segment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={segment}
              onChange={(event) => setSegment(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-cadence">
              Cadence
            </label>
            <select
              id="nl-cadence"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cadenceId}
              onChange={(event) => setCadenceId(event.target.value)}
            >
              {CADENCES.map((cadence) => (
                <option key={cadence.id} value={cadence.id}>
                  {cadence.label} (≤ {cadence.recommendedMaxWords} words works best)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-cta">
              Primary CTA (the one ask)
            </label>
            <input
              id="nl-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={cta}
              onChange={(event) => setCta(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-words">
              Email length (words)
            </label>
            <input
              id="nl-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.totalWords.min}
              max={LIMITS.totalWords.max}
              step="50"
              value={totalWords}
              onChange={(event) => setTotalWords(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-items">
              Number of items
            </label>
            <input
              id="nl-items"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.items.min}
              max={LIMITS.items.max}
              value={itemCount}
              onChange={(event) => setItemCount(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nl-theme">
              This edition&apos;s theme (optional)
            </label>
            <input
              id="nl-theme"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
              placeholder="e.g. launch week lessons"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nl-notes">
              Extra instruction for the model (optional)
            </label>
            <input
              id="nl-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. keep the tone dry and a little funny"
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
        <ul className="mt-6 space-y-2" aria-live="polite">
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
              Planned email length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(plan.total)} words`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `About ${Math.max(1, Math.round(plan.readingMinutes * 60))} seconds of reading at 238 words per minute.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated newsletter prompt"
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
        The 40-character subject limit, 40–100 character preheader range and
        per-cadence word ceilings are deliverability and editorial rules of
        thumb — individual mail clients truncate at different widths.
      </p>
    </main>
  );
}
