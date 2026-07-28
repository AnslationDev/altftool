"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Youtube } from "lucide-react";

import {
  buildDescription,
  DESCRIPTION_LIMIT,
  HASHTAGS_ABOVE_TITLE,
  HASHTAG_LIMIT,
  MIN_CHAPTERS,
  MIN_CHAPTER_SECONDS,
  SAMPLE_INPUT,
  TITLE_LIMIT,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-relaxed text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [form, setForm] = useState(SAMPLE_INPUT);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => buildDescription(form), [form]);
  const error = result.error || null;

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const setField = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setForm(SAMPLE_INPUT);
    setCopied(false);
  };

  const copy = async () => {
    if (error) return;
    try {
      await navigator.clipboard.writeText(result.description);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const overLimit = !error && result.characters > DESCRIPTION_LIMIT;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Youtube className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          YouTube Description Generator
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Build a description in the order viewers read it, and check it against YouTube&apos;s real
          limits: {NUM.format(DESCRIPTION_LIMIT)} characters, {HASHTAG_LIMIT} hashtags, and the
          chapter rules.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="ydg-hook">
            Opening line (the part shown before &ldquo;…more&rdquo;)
          </label>
          <input
            id="ydg-hook"
            type="text"
            className={`${INPUT_CLASS} mt-1`}
            value={form.hook}
            onChange={setField("hook")}
            placeholder="The one sentence that makes someone keep watching"
          />
          <p className={HINT_CLASS}>
            Only the first three lines are visible on the watch page. Video titles cap at{" "}
            {TITLE_LIMIT} characters, so put the searchable phrase here too.
          </p>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="ydg-summary">
            Summary
          </label>
          <textarea
            id="ydg-summary"
            className={`${TEXTAREA_CLASS} mt-1 min-h-28`}
            value={form.summary}
            onChange={setField("summary")}
            placeholder="Two or three sentences on what the video covers and who it is for."
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="ydg-chapters">
            Chapters — one per line, as &ldquo;0:00 Title&rdquo;
          </label>
          <textarea
            id="ydg-chapters"
            className={`${TEXTAREA_CLASS} mt-1 min-h-32 font-mono text-xs`}
            value={form.chapters}
            onChange={setField("chapters")}
            spellCheck={false}
            placeholder={"0:00 Intro\n1:15 The problem\n4:30 The fix"}
          />
          <p className={HINT_CLASS}>
            YouTube only builds chapters when the list starts at 0:00, has at least {MIN_CHAPTERS}{" "}
            timestamps, and every chapter runs {MIN_CHAPTER_SECONDS} seconds or more.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ydg-links">
              Links mentioned — one per line
            </label>
            <textarea
              id="ydg-links"
              className={`${TEXTAREA_CLASS} mt-1 min-h-24`}
              value={form.links}
              onChange={setField("links")}
              placeholder={"Free checklist: https://…"}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ydg-resources">
              Gear and resources — one per line
            </label>
            <textarea
              id="ydg-resources"
              className={`${TEXTAREA_CLASS} mt-1 min-h-24`}
              value={form.resources}
              onChange={setField("resources")}
              placeholder={"Camera: https://…"}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ydg-cta">
              Call to action
            </label>
            <textarea
              id="ydg-cta"
              className={`${TEXTAREA_CLASS} mt-1 min-h-24`}
              value={form.callToAction}
              onChange={setField("callToAction")}
              placeholder="Subscribe for a new video every Thursday."
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ydg-socials">
              Social links — one per line
            </label>
            <textarea
              id="ydg-socials"
              className={`${TEXTAREA_CLASS} mt-1 min-h-24`}
              value={form.socials}
              onChange={setField("socials")}
              placeholder={"Instagram: https://…"}
            />
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="ydg-hashtags">
            Hashtags — words or #tags, separated by spaces
          </label>
          <input
            id="ydg-hashtags"
            type="text"
            className={`${INPUT_CLASS} mt-1`}
            value={form.hashtags}
            onChange={setField("hashtags")}
            placeholder="sourdough baking breadmaking"
          />
          <p className={HINT_CLASS}>
            Only the first {HASHTAGS_ABOVE_TITLE} appear above the video title. Spaces and
            punctuation are stripped, because a hashtag ends at the first space.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="ydg-affiliate">
            <input
              id="ydg-affiliate"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={Boolean(form.affiliate)}
              onChange={setField("affiliate")}
            />
            Add an affiliate-link disclosure
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="ydg-headings">
            <input
              id="ydg-headings"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={Boolean(form.includeHeadings)}
              onChange={setField("includeHeadings")}
            />
            Add section headings
          </label>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className={PRIMARY_BTN} onClick={copy} disabled={Boolean(error)} aria-label="Copy the finished description to the clipboard">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy description"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset every field to the worked example">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Characters used</p>
        <p
          className={`mt-1 text-4xl font-bold tabular-nums ${
            overLimit ? "text-[var(--danger)]" : "text-[var(--foreground)]"
          }`}
        >
          {error ? DASH : `${NUM.format(result.characters)} / ${NUM.format(DESCRIPTION_LIMIT)}`}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Characters left</dt>
            <dd
              className={`text-sm font-semibold ${
                !error && result.remaining < 0 ? "text-[var(--danger)]" : "text-[var(--foreground)]"
              }`}
            >
              {error ? DASH : NUM.format(result.remaining)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Chapters</dt>
            <dd
              className={`text-sm font-semibold ${
                !error && result.chapters.length > 0 && result.chapterCheck.valid
                  ? "text-[var(--success)]"
                  : "text-[var(--foreground)]"
              }`}
            >
              {error
                ? DASH
                : result.chapters.length === 0
                  ? "None"
                  : `${NUM.format(result.chapters.length)} · ${result.chapterCheck.valid ? "valid" : "not valid"}`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Hashtags</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : NUM.format(result.hashtags.length)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Shown above the title</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : result.shownHashtags.length > 0 ? result.shownHashtags.join(" ") : "None"}
            </dd>
          </div>
        </dl>
      </section>

      {!error && result.warnings.length > 0 ? (
        <div role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          <ul className="list-disc space-y-1 pl-5">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {!error ? (
        <>
          <section className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">
              What viewers see before &ldquo;…more&rdquo;
            </h2>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-[var(--card)] p-4 text-sm leading-relaxed text-[var(--foreground)] ring-1 ring-[var(--border)]">
              {result.aboveFold}
            </pre>
          </section>

          <section className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Full description</h2>
            <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-xl bg-[var(--card)] p-4 text-sm leading-relaxed text-[var(--foreground)] ring-1 ring-[var(--border)]">
              {result.description}
            </pre>
          </section>
        </>
      ) : null}
    </div>
  );
}
