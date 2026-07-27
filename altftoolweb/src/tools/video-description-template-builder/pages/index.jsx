"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, FileText, RotateCcw } from "lucide-react";

import {
  ABOVE_FOLD_CHARS,
  buildDescription,
  HASHTAGS_ABOVE_TITLE,
  MAX_DESCRIPTION_CHARS,
  MAX_HASHTAGS,
  MIN_CHAPTER_SECONDS,
  MIN_CHAPTERS,
  templatePlaceholders,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  hook: "{{episode_title}} — everything you need in {{minutes}} minutes.",
  summary:
    "In this episode we cover the whole workflow start to finish, with the exact settings on screen so you can follow along.",
  cta: "New episodes every Tuesday and Friday — subscribe so you do not miss the next one.",
  chapterText: `0:00 What we are building
0:45 The three settings that matter
4:10 Full walkthrough
9:30 Common mistakes
12:00 Recap and next steps`,
  linkText: `Free checklist | https://example.com/checklist
Full course | https://example.com/course
Gear I use | https://example.com/gear`,
  hashtagText: "#videoediting #tutorial #creatortips",
  disclosure: "Some links above are affiliate links; buying through them supports the channel at no extra cost to you.",
};

const DASH = "—";

export default function ToolHome() {
  const [hook, setHook] = useState(DEFAULTS.hook);
  const [summary, setSummary] = useState(DEFAULTS.summary);
  const [cta, setCta] = useState(DEFAULTS.cta);
  const [chapterText, setChapterText] = useState(DEFAULTS.chapterText);
  const [linkText, setLinkText] = useState(DEFAULTS.linkText);
  const [hashtagText, setHashtagText] = useState(DEFAULTS.hashtagText);
  const [disclosure, setDisclosure] = useState(DEFAULTS.disclosure);
  const [values, setValues] = useState({ episode_title: "Colour grading in 12 minutes", minutes: "12" });
  const [copied, setCopied] = useState(false);

  const placeholders = useMemo(
    () => templatePlaceholders([hook, summary, cta, chapterText, linkText, hashtagText, disclosure].join("\n")),
    [hook, summary, cta, chapterText, linkText, hashtagText, disclosure],
  );

  const result = useMemo(
    () =>
      buildDescription({
        hook,
        summary,
        cta,
        chapterText,
        linkText,
        hashtagText,
        disclosure,
        values,
      }),
    [hook, summary, cta, chapterText, linkText, hashtagText, disclosure, values],
  );

  const hasError = Boolean(result.error);

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
    setHook(DEFAULTS.hook);
    setSummary(DEFAULTS.summary);
    setCta(DEFAULTS.cta);
    setChapterText(DEFAULTS.chapterText);
    setLinkText(DEFAULTS.linkText);
    setHashtagText(DEFAULTS.hashtagText);
    setDisclosure(DEFAULTS.disclosure);
    setValues({ episode_title: "Colour grading in 12 minutes", minutes: "12" });
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Video marketing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Video Description Template Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Assembles a reusable description from a hook, summary, chapters, links and hashtags, then
          checks it against the {MAX_DESCRIPTION_CHARS.toLocaleString("en-US")}-character limit, the
          chapter rules and the {MAX_HASHTAGS}-hashtag cut-off. Use {"{{placeholders}}"} for the
          parts that change each episode.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="desc-hook">
              Opening line (first {ABOVE_FOLD_CHARS} characters show before &quot;Show more&quot;)
            </label>
            <input
              id="desc-hook"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={hook}
              onChange={(event) => setHook(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="desc-summary">
              Summary
            </label>
            <textarea
              id="desc-summary"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="desc-cta">
              Call to action
            </label>
            <input
              id="desc-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={cta}
              onChange={(event) => setCta(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="desc-chapters">
              Chapters, one per line — &quot;0:00 Title&quot;
            </label>
            <textarea
              id="desc-chapters"
              className={`mt-2 ${AREA_CLASS} font-mono`}
              rows={6}
              value={chapterText}
              onChange={(event) => setChapterText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="desc-links">
              Links, one per line — &quot;Label | https://...&quot;
            </label>
            <textarea
              id="desc-links"
              className={`mt-2 ${AREA_CLASS}`}
              rows={4}
              value={linkText}
              onChange={(event) => setLinkText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="desc-hashtags">
              Hashtags
            </label>
            <input
              id="desc-hashtags"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={hashtagText}
              onChange={(event) => setHashtagText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="desc-disclosure">
              Disclosure or legal line
            </label>
            <input
              id="desc-disclosure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={disclosure}
              onChange={(event) => setDisclosure(event.target.value)}
            />
          </div>
        </div>

        {placeholders.length > 0 && (
          <div className="mt-4 rounded-lg border border-[var(--border)] p-3">
            <p className="text-sm font-semibold">Fill the placeholders</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {placeholders.map((name) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`desc-ph-${name}`}>
                    {`{{${name}}}`}
                  </label>
                  <input
                    id={`desc-ph-${name}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="text"
                    value={values[name] || ""}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [name]: event.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Characters used
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)] tabular-nums">
              {hasError ? DASH : result.length.toLocaleString("en-US")}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Add a hook or summary to build the description."
                : `${result.remaining.toLocaleString("en-US")} of ${MAX_DESCRIPTION_CHARS.toLocaleString("en-US")} left`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the finished description" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy description"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the template" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Chapters detected", hasError ? DASH : `${result.chapterCount} (need ${MIN_CHAPTERS}+)`],
            [
              "Chapters valid",
              hasError ? DASH : result.chapterCheck.valid ? "Yes" : "No — see the notes below",
            ],
            ["Links", hasError ? DASH : String(result.linkCount)],
            ["Hashtags", hasError ? DASH : `${result.hashtagCount} of ${MAX_HASHTAGS} allowed`],
            [
              `Shown above the title (first ${HASHTAGS_ABOVE_TITLE})`,
              hasError || result.pinnedHashtags.length === 0 ? DASH : result.pinnedHashtags.join(" "),
            ],
            [
              "Unfilled placeholders",
              hasError ? DASH : result.missingPlaceholders.length === 0 ? "None" : result.missingPlaceholders.join(", "),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (result.warnings.length > 0 || result.chapterCheck.problems.length > 0) && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Fix before publishing</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {[...result.warnings, ...result.chapterCheck.problems].map((note) => (
              <li key={note} className="flex gap-2 text-[var(--danger)]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Preview</h2>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Everything after the highlighted opening sits behind &quot;Show more&quot;.
          </p>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-max whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-xs leading-6">
              <span className="bg-[var(--muted)]">{result.aboveFold}</span>
              {result.text.slice(ABOVE_FOLD_CHARS)}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Chapter rules follow YouTube's requirements: the first timestamp must be 0:00, there must be
        at least {MIN_CHAPTERS} of them in order, and each chapter must run for at least{" "}
        {MIN_CHAPTER_SECONDS} seconds. If you use affiliate or sponsored links, disclose it here and
        in the video itself as your local advertising rules require.
      </p>
    </main>
  );
}
