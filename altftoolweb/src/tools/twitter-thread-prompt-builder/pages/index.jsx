"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Twitter } from "lucide-react";

import {
  HOOK_STYLES,
  LIMITS,
  TWEET_MAX_CHARS,
  buildThreadPrompt,
  planThread,
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
  topic: "7 pricing mistakes indie hackers make in their first year",
  audience: "solo founders selling software subscriptions",
  hookStyleId: "number",
  cta: "Reply with your pricing page for a free teardown",
  notes: "",
  postCount: "9",
  includeLink: false,
};

const DASH = "—";

export default function ToolHome() {
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [hookStyleId, setHookStyleId] = useState(DEFAULTS.hookStyleId);
  const [cta, setCta] = useState(DEFAULTS.cta);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [postCount, setPostCount] = useState(DEFAULTS.postCount);
  const [includeLink, setIncludeLink] = useState(DEFAULTS.includeLink);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const plan = planThread({ postCount, includeLink });
    if (plan.error) return plan;
    return buildThreadPrompt({ topic, audience, hookStyleId, cta, notes, plan });
  }, [topic, audience, hookStyleId, cta, notes, postCount, includeLink]);

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
    setCta(DEFAULTS.cta);
    setNotes(DEFAULTS.notes);
    setPostCount(DEFAULTS.postCount);
    setIncludeLink(DEFAULTS.includeLink);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Numbering overhead per post", DASH],
        ["Content budget per post", DASH],
        ["Body posts (between hook and close)", DASH],
        ["Final-post budget", DASH],
        ["Whole-thread capacity", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Numbering overhead per post", `${plan.overhead} characters`],
        [
          "Content budget per post",
          `${NUM.format(plan.perPost)} of ${TWEET_MAX_CHARS} characters`,
        ],
        ["Body posts (between hook and close)", NUM.format(plan.bodyPosts)],
        [
          "Final-post budget",
          plan.includeLink
            ? `${NUM.format(plan.finalPostChars)} characters + 23-character link`
            : `${NUM.format(plan.finalPostChars)} characters`,
        ],
        [
          "Whole-thread capacity",
          `${NUM.format(plan.maxThreadChars)} characters · ~${NUM.format(plan.approxMaxWords)} words`,
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
          <Twitter className="h-4 w-4" aria-hidden="true" />
          AI Writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Twitter Thread Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Works out the real per-post budget — 280 characters minus the
          &quot;n/{"{total}"}&quot; numbering, minus 23 for any t.co link — and
          writes a thread prompt with hook style, body structure and one CTA
          built in.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tt-topic">
              What the thread teaches or argues
            </label>
            <input
              id="tt-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-audience">
              Target reader
            </label>
            <input
              id="tt-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-hook">
              Hook style
            </label>
            <select
              id="tt-hook"
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
            <label className={LABEL_CLASS} htmlFor="tt-posts">
              Number of posts
            </label>
            <input
              id="tt-posts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.posts.min}
              max={LIMITS.posts.max}
              value={postCount}
              onChange={(event) => setPostCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-cta">
              CTA for the final post
            </label>
            <input
              id="tt-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={cta}
              onChange={(event) => setCta(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="tt-link"
        >
          <input
            id="tt-link"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={includeLink}
            onChange={(event) => setIncludeLink(event.target.checked)}
          />
          Final post includes a link (costs a flat 23 characters via t.co)
        </label>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="tt-notes">
            Extra instruction for the model (optional)
          </label>
          <input
            id="tt-notes"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="e.g. cite my own numbers, keep it non-preachy"
          />
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
              Thread plan
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${plan.posts} posts`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Hook, ${plan.bodyPosts} body posts, and a closing post carrying the CTA.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated thread prompt"
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
        280 characters is the standard non-premium limit on X and t.co counts
        every link as 23 characters; premium accounts can post longer, but a
        thread budgeted to 280 works for everyone.
      </p>
    </main>
  );
}
