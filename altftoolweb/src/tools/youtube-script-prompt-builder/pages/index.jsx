"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Youtube } from "lucide-react";

import {
  LIMITS,
  SPEAKING_WORDS_PER_MINUTE,
  VIDEO_STYLES,
  buildScriptPrompt,
  planScript,
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
  topic: "Git basics every new developer actually uses day to day",
  audience: "developers in their first job who copy-paste git commands",
  styleId: "tutorial",
  cta: "Download the free command cheat sheet linked below",
  notes: "",
  runtimeMinutes: "10",
  chapterCount: "5",
};

const DASH = "—";

export default function ToolHome() {
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [styleId, setStyleId] = useState(DEFAULTS.styleId);
  const [cta, setCta] = useState(DEFAULTS.cta);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [runtimeMinutes, setRuntimeMinutes] = useState(DEFAULTS.runtimeMinutes);
  const [chapterCount, setChapterCount] = useState(DEFAULTS.chapterCount);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const plan = planScript({ runtimeMinutes, chapterCount });
    if (plan.error) return plan;
    return buildScriptPrompt({ topic, audience, styleId, cta, notes, plan });
  }, [topic, audience, styleId, cta, notes, runtimeMinutes, chapterCount]);

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
    setStyleId(DEFAULTS.styleId);
    setCta(DEFAULTS.cta);
    setNotes(DEFAULTS.notes);
    setRuntimeMinutes(DEFAULTS.runtimeMinutes);
    setChapterCount(DEFAULTS.chapterCount);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Hook", DASH],
        ["Setup block", DASH],
        ["Chapters", DASH],
        ["Outro", DASH],
        ["Retention beats", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Hook", `15 s · ~${NUM.format(plan.hookWords)} words`],
        [
          "Setup block",
          plan.setupSeconds > 0
            ? `${plan.setupSeconds} s · ~${NUM.format(plan.setupWords)} words`
            : "Skipped (under 4 minutes)",
        ],
        [
          "Chapters",
          `${plan.chapters} × ~${Math.round(plan.chapterSecondsEach)} s (~${NUM.format(Math.round(plan.bodyWords / plan.chapters))} words each)`,
        ],
        ["Outro", `20 s · ~${NUM.format(plan.outroWords)} words`],
        ["Retention beats", `${plan.retentionBeats} (one every ~45 s)`],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Youtube className="h-4 w-4" aria-hidden="true" />
          AI Writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          YouTube Script Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Converts your runtime into a word count at {SPEAKING_WORDS_PER_MINUTE}{" "}
          words per minute spoken, plans a 15-second hook, timed chapters and
          retention beats every ~45 seconds, and writes the script prompt around
          that plan.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="yt-topic">
              What the video is about
            </label>
            <input
              id="yt-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-audience">
              Who is watching
            </label>
            <input
              id="yt-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-style">
              Video style
            </label>
            <select
              id="yt-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={styleId}
              onChange={(event) => setStyleId(event.target.value)}
            >
              {VIDEO_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-runtime">
              Runtime (minutes)
            </label>
            <input
              id="yt-runtime"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.runtimeMinutes.min}
              max={LIMITS.runtimeMinutes.max}
              value={runtimeMinutes}
              onChange={(event) => setRuntimeMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-chapters">
              Chapters
            </label>
            <input
              id="yt-chapters"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.chapters.min}
              max={LIMITS.chapters.max}
              value={chapterCount}
              onChange={(event) => setChapterCount(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="yt-cta">
              CTA for the outro (optional)
            </label>
            <input
              id="yt-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={cta}
              onChange={(event) => setCta(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="yt-notes">
              Extra instruction for the model (optional)
            </label>
            <input
              id="yt-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. screen recording only, no talking head"
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
              Script length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `~${NUM.format(plan.totalWords)} words`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${plan.minutes} minutes spoken at ${SPEAKING_WORDS_PER_MINUTE} words per minute.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated script prompt"
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
        150 words per minute is a typical conversational narration pace and the
        45-second beat interval is a retention rule of thumb; the 100-character
        title cap is YouTube&apos;s actual limit. Real delivery pace varies by
        speaker.
      </p>
    </main>
  );
}
