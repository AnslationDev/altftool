"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Youtube } from "lucide-react";

import {
  ABOVE_FOLD_CHARS,
  DESCRIPTION_MAX_CHARS,
  DISCLOSURES,
  HASHTAGS_ABOVE_TITLE,
  MAX_HASHTAGS,
  SEARCH_SNIPPET_CHARS,
  buildDescription,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const DEFAULTS = {
  summary:
    "A 12-minute walkthrough of the cold email sequence that took my reply rate from 2% to 11%, with the exact templates and the sending schedule.",
  cta: "Subscribe if you want one teardown like this every Thursday.",
  chaptersRaw: "0:00 What most sequences get wrong\n1:45 The three-email structure\n6:20 Sending schedule\n10:05 Results and what I would change",
  linksRaw: "Free template pack | https://example.com/templates\nNewsletter | https://example.com/news",
  credits: "Shot on a Sony ZV-E10. Music from Epidemic Sound.",
  hashtagsRaw: "#coldemail #sales #freelancing",
  disclosureIds: ["affiliate"],
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [summary, setSummary] = useState(DEFAULTS.summary);
  const [cta, setCta] = useState(DEFAULTS.cta);
  const [chaptersRaw, setChaptersRaw] = useState(DEFAULTS.chaptersRaw);
  const [linksRaw, setLinksRaw] = useState(DEFAULTS.linksRaw);
  const [credits, setCredits] = useState(DEFAULTS.credits);
  const [hashtagsRaw, setHashtagsRaw] = useState(DEFAULTS.hashtagsRaw);
  const [disclosureIds, setDisclosureIds] = useState(DEFAULTS.disclosureIds);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildDescription({
        summary,
        cta,
        chaptersRaw,
        linksRaw,
        credits,
        hashtagsRaw,
        disclosureIds,
      }),
    [summary, cta, chaptersRaw, linksRaw, credits, hashtagsRaw, disclosureIds],
  );

  const hasError = Boolean(result.error);

  const toggleDisclosure = (id) => {
    setDisclosureIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyResult = async () => {
    if (hasError || !result.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every field? This will replace your summary, chapters, links, credits and hashtags with the demo example values and cannot be undone.",
      )
    ) {
      return;
    }
    setSummary(DEFAULTS.summary);
    setCta(DEFAULTS.cta);
    setChaptersRaw(DEFAULTS.chaptersRaw);
    setLinksRaw(DEFAULTS.linksRaw);
    setCredits(DEFAULTS.credits);
    setHashtagsRaw(DEFAULTS.hashtagsRaw);
    setDisclosureIds(DEFAULTS.disclosureIds);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Youtube className="h-4 w-4" aria-hidden="true" />
          YouTube descriptions
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          YouTube Description Template Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build one reusable description block — summary, chapters, links, disclosures and hashtags —
          with YouTube&apos;s own chapter and hashtag rules checked as you type.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-summary">
              Opening summary (first {SEARCH_SNIPPET_CHARS} characters show in search)
            </label>
            <textarea
              id="yt-summary"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={3}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-cta">
              Call to action
            </label>
            <input
              id="yt-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={cta}
              onChange={(event) => setCta(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-chapters">
              Chapters — one per line, &quot;0:00 Title&quot;
            </label>
            <textarea
              id="yt-chapters"
              className={`mt-2 ${TEXTAREA_CLASS} font-mono`}
              rows={5}
              value={chaptersRaw}
              onChange={(event) => setChaptersRaw(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-links">
              Links — one per line, &quot;Label | https://...&quot;
            </label>
            <textarea
              id="yt-links"
              className={`mt-2 ${TEXTAREA_CLASS} font-mono`}
              rows={3}
              value={linksRaw}
              onChange={(event) => setLinksRaw(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-credits">
              Gear, credits or extra notes
            </label>
            <textarea
              id="yt-credits"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={credits}
              onChange={(event) => setCredits(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-hashtags">
              Hashtags (max {MAX_HASHTAGS}; first {HASHTAGS_ABOVE_TITLE} appear above the title)
            </label>
            <input
              id="yt-hashtags"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={hashtagsRaw}
              onChange={(event) => setHashtagsRaw(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Disclosures</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {DISCLOSURES.map((item) => (
              <label
                key={item.id}
                htmlFor={`yt-disclosure-${item.id}`}
                className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold"
              >
                <input
                  id={`yt-disclosure-${item.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={disclosureIds.includes(item.id)}
                  onChange={() => toggleDisclosure(item.id)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
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
              Description length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.length)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${NUM.format(result.remaining)} characters left of ${NUM.format(DESCRIPTION_MAX_CHARS)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the assembled YouTube description"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy description"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the description builder"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div
            className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`${Math.round(result.usedShare * 100)} percent of the character limit used`}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${Math.max(0, Math.min(100, result.usedShare * 100))}%` }}
            />
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Summary length",
              hasError
                ? DASH
                : `${result.summaryLength} chars (${result.summaryFitsSnippet ? "fits" : "exceeds"} the ${SEARCH_SNIPPET_CHARS}-char search snippet)`,
            ],
            ["Chapters", hasError ? DASH : String(result.chapters.length)],
            [
              "Chapter bar will appear",
              hasError ? DASH : result.chaptersValid ? "Yes" : "No — see the checks below",
            ],
            ["Links", hasError ? DASH : String(result.links.length)],
            [
              "Hashtags",
              hasError
                ? DASH
                : `${result.hashtags.length} (${result.hashtagsAboveTitle.join(" ") || "none"} above the title)`,
            ],
            ["Disclosures added", hasError ? DASH : String(result.disclosures.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.issues.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Checks to fix</h2>
          <ul className="mt-3 space-y-2">
            {result.issues.map((issue) => (
              <li
                key={issue}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {issue}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Visible before &quot;...more&quot;</h2>
            <p className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
              {result.aboveFold}
              {result.length > ABOVE_FOLD_CHARS ? "…" : ""}
            </p>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Roughly the first {ABOVE_FOLD_CHARS} characters on the watch page. Put the point of the
              video here, not links.
            </p>
          </section>

          {result.disclosures.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Disclosure notes</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {result.disclosures.map((item) => (
                  <li key={item.id} className="text-[var(--muted-foreground)]">
                    <span className="font-semibold text-[var(--foreground)]">{item.label}:</span>{" "}
                    {item.note}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Assembled description</h2>
            <div className="mt-3 overflow-x-auto">
              <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
                {result.text}
              </pre>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Disclosure wording here is a starting point, not legal advice. Sponsorship and affiliate
        rules differ by country and by programme — check the requirements that apply to you, and
        tick the paid promotion box in YouTube Studio as well as writing it in the description.
      </p>
    </main>
  );
}
