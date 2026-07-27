"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Send } from "lucide-react";

import {
  ASKS,
  IDEAL_MAX_WORDS,
  IDEAL_MIN_WORDS,
  LIMITS,
  SUBJECT_MAX_CHARS,
  TRIGGERS,
  buildColdEmailPrompt,
  planColdEmail,
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
  persona: "Head of RevOps at a 200-person B2B SaaS company",
  senderContext: "founder of a two-person data tooling startup",
  valueProp: "cut CRM data cleanup from a day a week to about an hour",
  triggerId: "funding",
  triggerDetail: "announced a Series B last month",
  askId: "interest",
  notes: "",
  totalWords: "100",
};

const DASH = "—";

export default function ToolHome() {
  const [persona, setPersona] = useState(DEFAULTS.persona);
  const [senderContext, setSenderContext] = useState(DEFAULTS.senderContext);
  const [valueProp, setValueProp] = useState(DEFAULTS.valueProp);
  const [triggerId, setTriggerId] = useState(DEFAULTS.triggerId);
  const [triggerDetail, setTriggerDetail] = useState(DEFAULTS.triggerDetail);
  const [askId, setAskId] = useState(DEFAULTS.askId);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [totalWords, setTotalWords] = useState(DEFAULTS.totalWords);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const plan = planColdEmail({ totalWords });
    if (plan.error) return plan;
    return buildColdEmailPrompt({
      persona,
      senderContext,
      valueProp,
      triggerId,
      triggerDetail,
      askId,
      notes,
      plan,
    });
  }, [
    persona,
    senderContext,
    valueProp,
    triggerId,
    triggerDetail,
    askId,
    notes,
    totalWords,
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
    setPersona(DEFAULTS.persona);
    setSenderContext(DEFAULTS.senderContext);
    setValueProp(DEFAULTS.valueProp);
    setTriggerId(DEFAULTS.triggerId);
    setTriggerDetail(DEFAULTS.triggerDetail);
    setAskId(DEFAULTS.askId);
    setNotes(DEFAULTS.notes);
    setTotalWords(DEFAULTS.totalWords);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Opener budget", DASH],
        ["Value section budget", DASH],
        ["Ask budget", DASH],
        ["Estimated reading time", DASH],
        ["Subject line cap", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Opener budget", `${NUM.format(plan.opener)} words`],
        ["Value section budget", `${NUM.format(plan.body)} words`],
        ["Ask budget", `${NUM.format(plan.ask)} words`],
        ["Estimated reading time", `~${plan.readingSeconds} seconds`],
        ["Subject line cap", `${SUBJECT_MAX_CHARS} characters`],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Send className="h-4 w-4" aria-hidden="true" />
          AI Writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cold Email Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Splits your word budget across opener, value and ask, keeps the email
          inside the {IDEAL_MIN_WORDS}–{IDEAL_MAX_WORDS} word band that gets the
          best reply rates, and writes a drafting prompt built around one
          persona, one trigger event and exactly one ask.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ce-persona">
              Who the email is to (role and company type)
            </label>
            <input
              id="ce-persona"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={persona}
              onChange={(event) => setPersona(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ce-sender">
              Who you are
            </label>
            <input
              id="ce-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={senderContext}
              onChange={(event) => setSenderContext(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ce-value">
              Concrete outcome you deliver
            </label>
            <input
              id="ce-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={valueProp}
              onChange={(event) => setValueProp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ce-trigger">
              Trigger — why write today
            </label>
            <select
              id="ce-trigger"
              className={`mt-2 ${INPUT_CLASS}`}
              value={triggerId}
              onChange={(event) => setTriggerId(event.target.value)}
            >
              {TRIGGERS.map((trigger) => (
                <option key={trigger.id} value={trigger.id}>
                  {trigger.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ce-trigger-detail">
              Trigger detail (optional)
            </label>
            <input
              id="ce-trigger-detail"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={triggerDetail}
              onChange={(event) => setTriggerDetail(event.target.value)}
              placeholder="e.g. announced a Series B last month"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ce-ask">
              The one ask
            </label>
            <select
              id="ce-ask"
              className={`mt-2 ${INPUT_CLASS}`}
              value={askId}
              onChange={(event) => setAskId(event.target.value)}
            >
              {ASKS.map((ask) => (
                <option key={ask.id} value={ask.id}>
                  {ask.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ce-words">
              Email length (words)
            </label>
            <input
              id="ce-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.totalWords.min}
              max={LIMITS.totalWords.max}
              step="5"
              value={totalWords}
              onChange={(event) => setTotalWords(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ce-notes">
              Extra instruction for the model (optional)
            </label>
            <input
              id="ce-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. sign off as Nikhil, no company name in the subject"
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
              Planned email length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(plan.total)} words`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : plan.inIdealRange
                  ? `Inside the ${IDEAL_MIN_WORDS}–${IDEAL_MAX_WORDS} word band associated with the best reply rates.`
                  : `Outside the ${IDEAL_MIN_WORDS}–${IDEAL_MAX_WORDS} word band associated with the best reply rates.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated cold email prompt"
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
        The {IDEAL_MIN_WORDS}–{IDEAL_MAX_WORDS} word band and the ~
        {SUBJECT_MAX_CHARS}-character subject cap are observed reply-rate
        patterns and client truncation behaviour, not guarantees. Commercial
        outreach is regulated differently in each country — check the rules that
        apply to your recipients before sending at scale.
      </p>
    </main>
  );
}
