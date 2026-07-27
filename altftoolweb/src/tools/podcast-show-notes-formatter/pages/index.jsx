"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mic, RotateCcw } from "lucide-react";

import { buildShowNotes } from "../lib";

const SAMPLE_NOTES = `00:00 Cold open and housekeeping
02:15 - Why we rebuilt the publishing pipeline
14:40 Guest joins: hiring for taste
The hiring guide we mentioned at https://example.com/hiring-guide
38:05 What we would do differently
1:05:30 | Listener questions
- Burnout on teams of fewer than ten people
- Why we stopped doing weekly releases`;

const DEFAULTS = {
  title: "Hiring for taste",
  episodeNumber: "42",
  showName: "The Build Log",
  summary: "How a four-person team rebuilt its publishing pipeline, and what hiring for taste really means in practice.",
  guests: "Ana Rivera",
  notes: SAMPLE_NOTES,
};

const OUTPUTS = [
  { key: "markdown", label: "Markdown" },
  { key: "plain", label: "Plain text" },
  { key: "youtubeDescription", label: "YouTube description" },
  { key: "chaptersJson", label: "Chapters JSON" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

export default function ToolHome() {
  const [title, setTitle] = useState(DEFAULTS.title);
  const [episodeNumber, setEpisodeNumber] = useState(DEFAULTS.episodeNumber);
  const [showName, setShowName] = useState(DEFAULTS.showName);
  const [summary, setSummary] = useState(DEFAULTS.summary);
  const [guests, setGuests] = useState(DEFAULTS.guests);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [output, setOutput] = useState("markdown");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildShowNotes({ title, episodeNumber, showName, summary, guests, notes }),
    [title, episodeNumber, showName, summary, guests, notes],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result[output]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTitle(DEFAULTS.title);
    setEpisodeNumber(DEFAULTS.episodeNumber);
    setShowName(DEFAULTS.showName);
    setSummary(DEFAULTS.summary);
    setGuests(DEFAULTS.guests);
    setNotes(DEFAULTS.notes);
    setOutput("markdown");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mic className="h-4 w-4" aria-hidden="true" />
          Podcast production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Podcast Show Notes Formatter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the notes you scribbled during the edit. Timestamps are normalised and sorted, links
          are pulled into their own list, and the chapters are checked against YouTube&apos;s rules.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="notes-title">
              Episode title
            </label>
            <input
              id="notes-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="notes-number">
              Episode number
            </label>
            <input
              id="notes-number"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              value={episodeNumber}
              onChange={(event) => setEpisodeNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="notes-show">
              Show name
            </label>
            <input
              id="notes-show"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={showName}
              onChange={(event) => setShowName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="notes-guests">
              Guests (comma separated)
            </label>
            <input
              id="notes-guests"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={guests}
              onChange={(event) => setGuests(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="notes-summary">
            One-paragraph summary
          </label>
          <textarea
            id="notes-summary"
            className={`mt-2 min-h-20 ${AREA_CLASS}`}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="notes-raw">
            Rough notes (timestamps, bullets and links, one per line)
          </label>
          <textarea
            id="notes-raw"
            className={`mt-2 min-h-56 ${AREA_CLASS}`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
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
              Chapters found
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : result.stats.chapterCount}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${result.stats.linkCount} links · ${result.stats.bulletCount} bullets · last timestamp ${result.stats.lastTimestamp}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the formatted show notes"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy output"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["YouTube chapters", dash],
                ["Apple Podcasts description", dash],
                ["Spotify description", dash],
                ["YouTube description", dash],
              ]
            : [
                [
                  "YouTube chapters",
                  result.youtube.ok ? "Valid — YouTube will build chapters" : "Will not build chapters",
                ],
                ...result.limits.map((row) => [
                  `${row.platform} description`,
                  `${row.used.toLocaleString()} / ${row.limit.toLocaleString()} characters`,
                ]),
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.youtube.issues.length > 0 && (
          <ul className="mt-4 space-y-2">
            {result.youtube.issues.map((issue) => (
              <li
                key={issue}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {issue}
              </li>
            ))}
          </ul>
        )}
        {!hasError && result.parseErrors.length > 0 && (
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.parseErrors.map((issue) => (
              <li key={issue} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {issue}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap gap-2">
              {OUTPUTS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setOutput(item.key)}
                  aria-pressed={output === item.key}
                  className={`min-h-11 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    output === item.key
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border border-[var(--border)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-[var(--muted)] p-4 font-mono text-sm">
              {result[output]}
            </pre>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Chapters</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Start
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Title
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Seconds
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.chapters.map((chapter) => (
                    <tr
                      key={`${chapter.seconds}-${chapter.label}`}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-2 pr-3 font-mono">{chapter.display}</td>
                      <td className="py-2 pr-3">{chapter.label}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">
                        {chapter.seconds}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.links.length > 0 && (
              <>
                <h2 className="mt-6 text-base font-semibold">Links mentioned</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {result.links.map((link) => (
                    <li key={link.url} className="break-all">
                      <span className="font-semibold">{link.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{link.url}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Character limits are the published caps for Apple Podcasts and Spotify (4,000) and YouTube
        (5,000) episode descriptions. Platforms occasionally change them, so check before a big
        back-catalogue update.
      </p>
    </main>
  );
}
