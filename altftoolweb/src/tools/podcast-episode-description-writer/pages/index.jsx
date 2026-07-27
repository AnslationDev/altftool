"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Podcast, RotateCcw } from "lucide-react";

import { PREVIEW_CHARS, analyseDescription, buildDescription } from "../lib";

const DEFAULTS = {
  showName: "The Build Log",
  episodeNumber: "42",
  topic: "pricing a solo SaaS",
  guestName: "Ana Ruiz",
  guestTitle: "founder of Ledgerly",
  audience: "indie founders",
  keyword: "solo SaaS pricing",
  takeaways: `Why cost-plus pricing caps growth
The metric that told Ana to double her prices
How to run a price change without losing customers`,
  chapterText: `0:00 Cold open
2:15 The first pricing page
18:40 Doubling the price
41:00 What broke`,
  links: `https://ledgerly.example
The Mom Test by Rob Fitzpatrick`,
  cta: "New episodes every Tuesday. Follow the show so you do not miss one.",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [showName, setShowName] = useState(DEFAULTS.showName);
  const [episodeNumber, setEpisodeNumber] = useState(DEFAULTS.episodeNumber);
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [guestName, setGuestName] = useState(DEFAULTS.guestName);
  const [guestTitle, setGuestTitle] = useState(DEFAULTS.guestTitle);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [keyword, setKeyword] = useState(DEFAULTS.keyword);
  const [takeaways, setTakeaways] = useState(DEFAULTS.takeaways);
  const [chapterText, setChapterText] = useState(DEFAULTS.chapterText);
  const [links, setLinks] = useState(DEFAULTS.links);
  const [cta, setCta] = useState(DEFAULTS.cta);
  const [copied, setCopied] = useState(false);

  const draft = useMemo(
    () =>
      buildDescription({
        showName,
        episodeNumber,
        topic,
        guestName,
        guestTitle,
        audience,
        keyword,
        takeaways,
        chapterText,
        links,
        cta,
      }),
    [showName, episodeNumber, topic, guestName, guestTitle, audience, keyword, takeaways, chapterText, links, cta],
  );

  const analysis = useMemo(() => {
    if (draft.error) return { error: draft.error };
    return analyseDescription(draft.text, { keyword });
  }, [draft, keyword]);

  const ok = !draft.error && !analysis.error;
  const error = draft.error || analysis.error;
  const dash = "—";

  const copyResult = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(draft.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setShowName(DEFAULTS.showName);
    setEpisodeNumber(DEFAULTS.episodeNumber);
    setTopic(DEFAULTS.topic);
    setGuestName(DEFAULTS.guestName);
    setGuestTitle(DEFAULTS.guestTitle);
    setAudience(DEFAULTS.audience);
    setKeyword(DEFAULTS.keyword);
    setTakeaways(DEFAULTS.takeaways);
    setChapterText(DEFAULTS.chapterText);
    setLinks(DEFAULTS.links);
    setCta(DEFAULTS.cta);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Podcast className="h-4 w-4" aria-hidden="true" />
          Episode notes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Podcast Episode Description Writer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn episode notes into a structured description, then check it against Apple, Spotify and
          YouTube character limits, YouTube chapter rules and where your focus phrase actually lands.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-show">
              Show name
            </label>
            <input
              id="pod-show"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={showName}
              onChange={(event) => setShowName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-number">
              Episode number
            </label>
            <input
              id="pod-number"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              value={episodeNumber}
              onChange={(event) => setEpisodeNumber(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pod-topic">
              What the episode is about
            </label>
            <input
              id="pod-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-guest">
              Guest name (optional)
            </label>
            <input
              id="pod-guest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-guest-title">
              Guest title (optional)
            </label>
            <input
              id="pod-guest-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={guestTitle}
              onChange={(event) => setGuestTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-audience">
              Who it is for
            </label>
            <input
              id="pod-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-keyword">
              Focus phrase
            </label>
            <input
              id="pod-keyword"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-takeaways">
              Takeaways, one per line
            </label>
            <textarea
              id="pod-takeaways"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={4}
              value={takeaways}
              onChange={(event) => setTakeaways(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-chapters">
              Chapters, one per line as &quot;0:00 Label&quot;
            </label>
            <textarea
              id="pod-chapters"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={4}
              value={chapterText}
              onChange={(event) => setChapterText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-links">
              Links and mentions, one per line
            </label>
            <textarea
              id="pod-links"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={3}
              value={links}
              onChange={(event) => setLinks(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-cta">
              Closing call to action
            </label>
            <input
              id="pod-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={cta}
              onChange={(event) => setCta(event.target.value)}
            />
          </div>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Description length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? NUM.format(analysis.characters) : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `characters · ${NUM.format(analysis.words)} words` : "Add a topic to generate a draft"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the episode description"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy description"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the episode notes" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Suggested title", ok ? draft.title : dash],
            ["Focus phrase in the preview", ok ? (analysis.keywordInPreview ? "Yes" : "No") : dash],
            ["Focus phrase mentions", ok ? String(analysis.keywordCount) : dash],
            ["Focus phrase share of words", ok ? `${analysis.density}%` : dash],
            ["Chapters parsed", ok ? String(draft.chapters.chapters.length) : dash],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Platform
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Limit
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Remaining
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.limits.map((platform) => (
                    <tr key={platform.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{platform.name}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {NUM.format(platform.limit)}
                      </td>
                      <td
                        className={`py-2 text-right font-semibold ${
                          platform.over ? "text-[var(--danger)]" : "text-[var(--success)]"
                        }`}
                      >
                        {NUM.format(platform.remaining)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold">
                What listeners see before tapping more (first {PREVIEW_CHARS} characters)
              </h3>
              <p className="mt-2 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
                {analysis.preview}
                {analysis.truncated ? "…" : ""}
              </p>
            </div>

            {analysis.issues.length > 0 || draft.chapters.issues.length > 0 ? (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                {analysis.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
                {draft.chapters.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm font-medium text-[var(--success)]">
                Nothing flagged — length, chapters and keyword placement all check out.
              </p>
            )}
          </>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Draft description</h2>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
            {draft.text}
          </pre>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Character limits reflect what the major platforms publish; individual hosting providers
        sometimes apply a lower cap of their own, so check your host before filling the ceiling.
      </p>
    </main>
  );
}
