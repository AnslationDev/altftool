"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Linkedin, RotateCcw } from "lucide-react";

import {
  HOOK_STYLES,
  LIMITS,
  LINKEDIN_POST_MAX_CHARS,
  buildLinkedInPrompt,
  planLinkedInPost,
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
  topic: "how we cut our AWS bill 40% by deleting three services nobody used",
  audience: "engineering leads at startups watching their cloud spend",
  hookStyleId: "result",
  takeawayGoal: "audit your own unused services this week",
  notes: "",
  targetChars: "1200",
};

const DASH = "—";

export default function ToolHome() {
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [hookStyleId, setHookStyleId] = useState(DEFAULTS.hookStyleId);
  const [takeawayGoal, setTakeawayGoal] = useState(DEFAULTS.takeawayGoal);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [targetChars, setTargetChars] = useState(DEFAULTS.targetChars);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const plan = planLinkedInPost({ targetChars });
    if (plan.error) return plan;
    return buildLinkedInPrompt({
      topic,
      audience,
      hookStyleId,
      takeawayGoal,
      notes,
      plan,
    });
  }, [topic, audience, hookStyleId, takeawayGoal, notes, targetChars]);

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
    setHookStyleId(DEFAULTS.hookStyleId);
    setTakeawayGoal(DEFAULTS.takeawayGoal);
    setNotes(DEFAULTS.notes);
    setTargetChars(DEFAULTS.targetChars);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Hook budget (before the fold)", DASH],
        ["Story budget", DASH],
        ["Takeaway budget", DASH],
        ["Headroom under the 3,000 limit", DASH],
        ["Estimated reading time", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Hook budget (before the fold)", `${NUM.format(plan.hook)} characters`],
        ["Story budget", `${NUM.format(plan.story)} characters`],
        ["Takeaway budget", `${NUM.format(plan.takeaway)} characters`],
        [
          "Headroom under the 3,000 limit",
          `${NUM.format(plan.charsLeftOfLimit)} characters`,
        ],
        ["Estimated reading time", `~${plan.readingSeconds} seconds`],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Linkedin className="h-4 w-4" aria-hidden="true" />
          AI Writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          LinkedIn Post Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sizes a hook–story–takeaway post to your target length inside
          LinkedIn&apos;s {NUM.format(LINKEDIN_POST_MAX_CHARS)}-character limit,
          keeps the hook inside the mobile see-more fold, and writes the
          drafting prompt with those budgets built in.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="li-topic">
              What the post is about
            </label>
            <input
              id="li-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="li-audience">
              Who should stop scrolling
            </label>
            <input
              id="li-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="li-hook">
              Hook style
            </label>
            <select
              id="li-hook"
              className={`mt-2 ${INPUT_CLASS}`}
              value={hookStyleId}
              onChange={(event) => setHookStyleId(event.target.value)}
            >
              {HOOK_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="li-chars">
              Target post length (characters)
            </label>
            <input
              id="li-chars"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.targetChars.min}
              max={LIMITS.targetChars.max}
              step="100"
              value={targetChars}
              onChange={(event) => setTargetChars(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="li-takeaway">
              What the reader should do next (optional)
            </label>
            <input
              id="li-takeaway"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={takeawayGoal}
              onChange={(event) => setTakeawayGoal(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="li-notes">
              Extra instruction for the model (optional)
            </label>
            <input
              id="li-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. mention this happened at a 10-person startup"
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
              Planned post length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(plan.target)} chars`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Roughly ${NUM.format(plan.approxWords)} words at ~6 characters per word.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated LinkedIn post prompt"
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
        The 3,000-character post limit is LinkedIn&apos;s; the ~140-character
        mobile fold, ~210-character desktop fold and 3–5 hashtag range are
        observed behaviour and practitioner rules of thumb that LinkedIn can
        change without notice.
      </p>
    </main>
  );
}
