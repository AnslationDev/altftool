"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Smile } from "lucide-react";

import {
  MAX_COMFORTABLE_EMOJI,
  MAX_DENSITY_PER_100_WORDS,
  MAX_RUN_LENGTH,
  MIN_WORDS_FOR_DENSITY,
  analyseCaption,
  stripEmoji,
} from "../lib";

const DEFAULT_CAPTION = `🔥🔥🔥 HUGE news 🎉 we just 🚀 shipped the new onboarding flow 💯

Three months of work, and the sign-up drop-off is down by a third 👀 full write-up on the blog 👇`;

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SEVERITY_CLASS = {
  blocker: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--danger-soft)] text-[var(--danger)]",
  note: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const SEVERITY_LABEL = { blocker: "Fix", warning: "Watch", note: "Note" };

export default function ToolHome() {
  const [caption, setCaption] = useState(DEFAULT_CAPTION);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyseCaption(caption), [caption]);
  const cleaned = useMemo(() => stripEmoji(caption), [caption]);

  const ok = !result.error;
  const dash = "—";

  const copyResult = async () => {
    if (!cleaned) return;
    try {
      await navigator.clipboard.writeText(cleaned);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCaption(DEFAULT_CAPTION);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Smile className="h-4 w-4" aria-hidden="true" />
          Caption accessibility
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Caption Emoji Density Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A screen reader announces every emoji by name, in the position it appears. This counts
          them, measures density, and flags the placements that make a caption hard to follow.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="emoji-caption">
          Caption
        </label>
        <textarea
          id="emoji-caption"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={7}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Nothing leaves your browser — the caption is analysed on this page.
        </p>
      </section>

      {result.error ? (
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
              Emoji in this caption
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.emojiCount : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${result.verdict} · ${result.words} words` : "Paste a caption to check it"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the caption with emoji removed"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy without emoji"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the caption" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Unique emoji", ok ? String(result.uniqueEmoji) : dash],
            [
              "Per 100 words",
              ok
                ? result.densityPer100Words === null
                  ? "no words to measure against"
                  : `${result.densityPer100Words}`
                : dash,
            ],
            ["Longest run in a row", ok ? String(result.longestRun) : dash],
            ["Emoji inside a sentence", ok ? String(result.midSentence) : dash],
            ["Opens with an emoji", ok ? (result.leading ? "Yes" : "No") : dash],
            ["Skin-tone modifiers", ok ? String(result.skinTones) : dash],
            ["Joined sequences", ok ? String(result.joined) : dash],
            ["Characters", ok ? String(result.characters) : dash],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          result.issues.length > 0 ? (
            <ul className="mt-5 space-y-2">
              {result.issues.map((issue) => (
                <li
                  key={issue.id}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6"
                >
                  <span
                    className={`mr-2 inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${SEVERITY_CLASS[issue.severity]}`}
                  >
                    {SEVERITY_LABEL[issue.severity]}
                  </span>
                  {issue.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm font-medium text-[var(--success)]">
              Nothing flagged — the count, placement and density all read comfortably.
            </p>
          )
        ) : null}
      </section>

      {ok && result.runs.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Runs found</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Emoji separated only by spaces are announced back to back as one stretch.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {result.runs.map((run, index) => (
              <li
                key={`${run.text}-${index}`}
                className={`rounded-md border px-3 py-2 text-sm ${
                  run.length > MAX_RUN_LENGTH
                    ? "border-[var(--danger)] text-[var(--danger)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                <span className="text-lg" aria-hidden="true">
                  {run.text}
                </span>
                <span className="ml-2">{run.length} in a row</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Caption with the emoji removed</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          If this still says everything the post needs to say, the emoji were decoration — which is
          exactly what they should be.
        </p>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
          {cleaned || "—"}
        </pre>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Thresholds used</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-[var(--muted-foreground)]">
          <li>More than {MAX_COMFORTABLE_EMOJI} emoji in one caption is flagged.</li>
          <li>More than {MAX_RUN_LENGTH} emoji in a row is flagged.</li>
          <li>
            Above {MAX_DENSITY_PER_100_WORDS} emoji per 100 words is flagged, once the caption has
            at least {MIN_WORDS_FOR_DENSITY} words.
          </li>
          <li>Any emoji sitting inside a sentence rather than after it is flagged.</li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Exact announcements differ between screen readers and platforms. The reliable rules are the
        same everywhere: keep the count low, place emoji after the sentence, and never let one carry
        meaning the words do not.
      </p>
    </main>
  );
}
