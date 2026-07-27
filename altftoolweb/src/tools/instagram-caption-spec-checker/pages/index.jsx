"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Instagram, RotateCcw, Wand } from "lucide-react";

import {
  analyseCaption,
  CAPTION_LIMIT,
  cleanCaption,
  FEED_TRUNCATION_CHARS,
  HASHTAG_LIMIT,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULT_CAPTION = `Six months of 5am starts for eleven seconds of footage.

Shot on the old 50mm because the new one was still in the bag. Full breakdown of the setup is on the blog.

#filmmaking #behindthescenes #cinematography #Kolkata #kolkata #50mm`;

const SEVERITY_CLASS = {
  error: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warn: "bg-[var(--muted)] text-[var(--foreground)]",
  info: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const TEXTAREA_CLASS =
  "min-h-[11rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [caption, setCaption] = useState(DEFAULT_CAPTION);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyseCaption(caption), [caption]);
  const error = result.error || null;

  const tidied = useMemo(() => cleanCaption(caption), [caption]);
  const canTidy = !tidied.error && tidied.caption !== caption;

  const copyCaption = async () => {
    if (error) return;
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const applyTidy = () => {
    if (!canTidy) return;
    setCaption(tidied.caption);
    setCopied(false);
  };

  const reset = () => {
    setCaption(DEFAULT_CAPTION);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Instagram className="h-4 w-4" aria-hidden="true" />
          Caption compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Instagram Caption Spec Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Check a caption against the {NUM.format(CAPTION_LIMIT)}-character limit and the{" "}
          {HASHTAG_LIMIT}-hashtag cap, see exactly where the feed cuts it off, and catch the
          duplicate tags and dead links that quietly cost you reach.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="icsc-caption">
          Your caption
        </label>
        <textarea
          id="icsc-caption"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Nothing is uploaded — the caption stays in your browser.
        </p>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Characters used
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? "—" : `${NUM.format(result.chars)} / ${NUM.format(CAPTION_LIMIT)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? "Paste a caption to check it." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyCaption}
              aria-label="Copy the caption"
              className={GHOST_BTN}
              disabled={Boolean(error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy caption"}
            </button>
            <button
              type="button"
              onClick={applyTidy}
              aria-label="Remove duplicate hashtags and tidy the spacing"
              className={GHOST_BTN}
              disabled={!canTidy}
            >
              <Wand className="h-4 w-4" aria-hidden="true" />
              Tidy
            </button>
            <button type="button" onClick={reset} aria-label="Reset the caption" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Characters left", error ? "—" : NUM.format(result.charsRemaining)],
            [
              "Hashtags",
              error
                ? "—"
                : `${NUM.format(result.hashtagCount)} of ${HASHTAG_LIMIT} (${NUM.format(result.uniqueHashtags)} unique)`,
            ],
            ["Hashtag share of the caption", error ? "—" : `${NUM1.format(result.hashtagDensityPct)}%`],
            ["Mentions", error ? "—" : NUM.format(result.mentionCount)],
            ["Emoji", error ? "—" : NUM.format(result.emojiCount)],
            ["Words · lines", error ? "—" : `${NUM.format(result.words)} · ${NUM.format(result.lineCount)}`],
            [
              "Hidden behind “more”",
              error ? "—" : result.truncated ? `${NUM.format(result.hiddenChars)} characters` : "nothing",
            ],
            ["First line length", error ? "—" : `${NUM.format(result.firstLineLength)} characters`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Caption limit
              </p>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${NUM1.format(result.captionUsedPct)} percent of the caption limit used`}
              >
                <span
                  className={`block h-full ${result.chars > CAPTION_LIMIT ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                  style={{ width: `${Math.max(0, Math.min(100, result.captionUsedPct))}%` }}
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Hashtag cap
              </p>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${NUM.format(result.hashtagCount)} of ${HASHTAG_LIMIT} hashtags used`}
              >
                <span
                  className={`block h-full ${result.hashtagCount > HASHTAG_LIMIT ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                  style={{
                    width: `${Math.max(0, Math.min(100, (result.hashtagCount / HASHTAG_LIMIT) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}

        {!error && result.issues.length > 0 ? (
          <ul className="mt-5 space-y-2 text-sm">
            {result.issues.map((issue) => (
              <li key={issue.id} className={`rounded-md px-3 py-2 ${SEVERITY_CLASS[issue.severity]}`}>
                <span className="font-semibold">{issue.message}</span>{" "}
                <span className="opacity-80">{issue.fix}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {!error && result.passes.length > 0 ? (
          <ul className="mt-3 space-y-1 text-sm text-[var(--success)]">
            {result.passes.map((pass) => (
              <li key={pass} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {pass}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {error ? null : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What the feed shows</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Roughly the first {FEED_TRUNCATION_CHARS} characters appear before the &ldquo;... more&rdquo;
            link. The exact point moves with screen width.
          </p>
          <div className="mt-3 rounded-md bg-[var(--muted)] px-3 py-3 text-sm leading-6">
            <span className="whitespace-pre-wrap font-medium">{result.visibleText}</span>
            {result.truncated ? (
              <>
                <span className="font-semibold text-[var(--primary)]">… more</span>
                <span className="whitespace-pre-wrap text-[var(--muted-foreground)] opacity-60">
                  {result.hiddenText}
                </span>
              </>
            ) : null}
          </div>

          {result.hashtags.length > 0 ? (
            <div className="mt-5">
              <h3 className="text-sm font-semibold">Hashtags found</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.hashtags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                      result.duplicateTags.includes(tag.toLowerCase()) ||
                      result.numericTags.includes(tag)
                        ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Limits reflect Instagram&apos;s published caption and hashtag rules. The truncation point is
        a practical guideline rather than a fixed value, and platform behaviour changes — check a
        real post if the caption sits right on a boundary.
      </p>
    </main>
  );
}
