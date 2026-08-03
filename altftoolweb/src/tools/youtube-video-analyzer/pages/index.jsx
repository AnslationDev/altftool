"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Info,
  Link2,
  RotateCcw,
  XCircle,
} from "lucide-react";

import { analyzeYouTubeVideo, formatTimecode, parseTimestamp } from "../lib";

const DASH = "—";

const DEFAULTS = {
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=Kq1xR9dLm2&t=1m30s",
  title: "How I Rebuilt My Studio in a Weekend (Full Walkthrough)",
  description: [
    "Everything I changed, what it cost, and the two things I would do differently.",
    "",
    "0:00 Intro",
    "1:30 The old layout and why it failed",
    "6:00 Acoustic panels on a budget",
    "12:00 Cable management",
    "18:45 Final tour",
    "",
    "Gear list: https://example.com/studio-gear",
    "",
    "#studiotour #homestudio #diy",
  ].join("\n"),
  duration: "22:10",
  privacyEnhanced: true,
  hideRelated: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";

const STATUS_ICON = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
  info: Info,
};

const STATUS_TONE = {
  pass: "text-[var(--success)]",
  warn: "text-[var(--warning)]",
  fail: "text-[var(--danger)]",
  info: "text-[var(--muted-foreground)]",
};

function CopyButton({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button type="button" onClick={onCopy} aria-label={`${label} to clipboard`} className={GHOST_BTN}>
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {copied ? "Copied!" : label}
    </button>
  );
}

function LinkRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--border)] py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{label}</p>
        <p className="mt-0.5 break-all font-mono text-xs text-[var(--foreground)]">{value}</p>
      </div>
      <CopyButton value={value} />
    </div>
  );
}

export default function ToolHome() {
  const [url, setUrl] = useState(DEFAULTS.url);
  const [title, setTitle] = useState(DEFAULTS.title);
  const [description, setDescription] = useState(DEFAULTS.description);
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [privacyEnhanced, setPrivacyEnhanced] = useState(DEFAULTS.privacyEnhanced);
  const [hideRelated, setHideRelated] = useState(DEFAULTS.hideRelated);

  const durationSeconds = useMemo(() => parseTimestamp(duration), [duration]);

  const result = useMemo(
    () =>
      analyzeYouTubeVideo({
        url,
        title,
        description,
        videoDurationSeconds: durationSeconds,
        embedOptions: { privacyEnhanced, hideRelated },
      }),
    [url, title, description, durationSeconds, privacyEnhanced, hideRelated],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const { parsed, idCheck, links, metadata } = result;
    return [
      "YouTube link analysis (offline)",
      `Input: ${parsed.input}`,
      `Link type: ${parsed.kindLabel}`,
      `Video id: ${parsed.videoId} — ${idCheck.wellFormed ? "well formed" : "suspect"}`,
      parsed.startSeconds !== null ? `Starts at: ${formatTimecode(parsed.startSeconds)}` : null,
      parsed.playlistId ? `Playlist: ${parsed.playlistId}` : null,
      `Tracking parameters: ${parsed.trackingParams.length ? parsed.trackingParams.map((p) => p.key).join(", ") : "none"}`,
      `Clean watch link: ${links.canonicalWatch}`,
      `Share link: ${links.shortShare}`,
      `Privacy embed: ${links.embedNoCookie}`,
      "",
      "Metadata audit",
      ...metadata.checks.map((check) => `[${check.status.toUpperCase()}] ${check.label}: ${check.detail}`),
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result]);

  const reset = () => {
    if (
      !window.confirm(
        "Reset the URL, title and description back to the demo example? This cannot be undone.",
      )
    ) {
      return;
    }
    setUrl(DEFAULTS.url);
    setTitle(DEFAULTS.title);
    setDescription(DEFAULTS.description);
    setDuration(DEFAULTS.duration);
    setPrivacyEnhanced(DEFAULTS.privacyEnhanced);
    setHideRelated(DEFAULTS.hideRelated);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Link2 className="h-4 w-4" aria-hidden="true" />
          Runs entirely in your browser
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">YouTube Video Analyzer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Takes a YouTube link apart — video id, start time, playlist, tracking parameters — and rebuilds
          clean, canonical and privacy-enhanced versions. Paste the title and description too and they are
          checked against YouTube&rsquo;s own limits: 100-character title, 5000-character description, 15
          hashtags, and the three chapter rules.
        </p>
        <p className="mt-2 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
          <strong className="font-semibold text-[var(--foreground)]">No network calls.</strong> Nothing here
          contacts YouTube, so this page cannot show real view counts, durations, channel names or publish
          dates. Everything below is derived from what you paste.
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="yt-url">
          YouTube URL
        </label>
        <input
          id="yt-url"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          inputMode="url"
          spellCheck="false"
          autoComplete="off"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://youtu.be/dQw4w9WgXcQ"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-duration">
              Video length (optional, m:ss)
            </label>
            <input
              id="yt-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              placeholder="22:10"
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Only used to measure the final chapter.
            </p>
          </div>
          <fieldset className="rounded-md border border-[var(--border)] p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Embed options
            </legend>
            <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="yt-nocookie">
              <input
                id="yt-nocookie"
                type="checkbox"
                checked={privacyEnhanced}
                onChange={(event) => setPrivacyEnhanced(event.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Privacy-enhanced host
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="yt-rel">
              <input
                id="yt-rel"
                type="checkbox"
                checked={hideRelated}
                onChange={(event) => setHideRelated(event.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Limit end-screen suggestions (rel=0)
            </label>
          </fieldset>
        </div>

        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-title">
              Video title (paste it to have it checked)
            </label>
            <input
              id="yt-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-description">
              Video description
            </label>
            <textarea
              id="yt-description"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={10}
              spellCheck="false"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton value={summary} label="Copy report" />
          <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
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

      {!hasError && (
        <>
          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">What the link says</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Link type", result.parsed.kindLabel],
                ["Host", result.parsed.hostname],
                ["Video id", result.parsed.videoId],
                [
                  "Id structure",
                  result.idCheck.wellFormed
                    ? `11 base64url characters, ends in "${result.idCheck.finalChar}" — valid`
                    : "Suspect (see below)",
                ],
                ["Starts at", result.startTimecode || DASH],
                ["Ends at", result.endTimecode || DASH],
                ["Playlist", result.parsed.playlistId || DASH],
                ["Position in playlist", result.parsed.listIndex === null ? DASH : String(result.parsed.listIndex)],
                [
                  "Tracking parameters",
                  result.parsed.trackingParams.length
                    ? result.parsed.trackingParams.map((p) => `${p.key}=${p.value}`).join(", ")
                    : "none",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="break-all text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {result.idCheck.notes.length > 0 && (
              <p
                role="alert"
                className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {result.idCheck.notes.join(" ")}
              </p>
            )}

            <ul className="mt-3 space-y-1 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.privacyNotes.map((note) => (
                <li key={note}>· {note}</li>
              ))}
            </ul>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Clean links</h2>
            <div className="mt-2">
              <LinkRow label="Canonical watch" value={result.links.canonicalWatch} />
              <LinkRow label="Short share" value={result.links.shortShare} />
              <LinkRow label="Timestamped watch" value={result.links.timestamped} />
              <LinkRow label="Timestamped share" value={result.links.shortTimestamped} />
              <LinkRow label="Inside the playlist" value={result.links.inPlaylist} />
              <LinkRow label="Privacy-enhanced embed" value={result.links.embedNoCookie} />
              <LinkRow label="oEmbed endpoint (for your own server)" value={result.links.oembedEndpoint} />
            </div>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Embed code</h2>
              <CopyButton value={result.embed.code} label="Copy embed" />
            </div>
            <pre className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]">
              {result.embed.code}
            </pre>
            <ul className="mt-3 space-y-1 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.embed.notes.map((note) => (
                <li key={note}>· {note}</li>
              ))}
            </ul>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Metadata audit</h2>
            <ul className="mt-3 space-y-3">
              {result.metadata.checks.map((check) => {
                const Icon = STATUS_ICON[check.status] || Info;
                return (
                  <li key={check.id} className="flex gap-3">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${STATUS_TONE[check.status]}`} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {check.label}{" "}
                        <span className={`text-xs uppercase ${STATUS_TONE[check.status]}`}>{check.status}</span>
                      </p>
                      <p className="mt-0.5 break-words text-sm text-[var(--muted-foreground)]">{check.detail}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Rule: {check.rule}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {result.metadata.chapters.enabled && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">
                Chapters ({result.metadata.chapters.chapters.length})
              </h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">Start</th>
                      <th scope="col" className="py-2 pr-3 font-semibold">Title</th>
                      <th scope="col" className="py-2 text-right font-semibold">Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.metadata.chapters.chapters.map((chapter) => (
                      <tr
                        key={`${chapter.line}-${chapter.seconds}`}
                        className="border-b border-[var(--border)] last:border-0"
                      >
                        <td className="py-2 pr-3 font-mono">{chapter.timecode}</td>
                        <td className="py-2 pr-3">
                          {chapter.label || <span className="text-[var(--danger)]">no title</span>}
                        </td>
                        <td className="py-2 text-right text-[var(--muted-foreground)]">
                          {chapter.lengthSeconds === null ? DASH : formatTimecode(chapter.lengthSeconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.metadata.chapters.notes.length > 0 && (
                <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                  {result.metadata.chapters.notes.join(" ")}
                </p>
              )}
            </section>
          )}

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Thumbnail URLs</h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Fixed i.ytimg.com paths and their published pixel sizes. Nothing is loaded here — copy a URL or
              open it yourself.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Variant</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Size</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">URL</th>
                    <th scope="col" className="py-2 font-semibold">Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {result.thumbnails.map((thumb) => (
                    <tr key={thumb.file} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{thumb.name}</td>
                      <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                        {thumb.width}×{thumb.height}
                      </td>
                      <td className="py-2 pr-3 break-all font-mono text-xs">{thumb.url}</td>
                      <td className="py-2 text-xs text-[var(--muted-foreground)]">{thumb.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {result.metadata.keywords.length > 0 && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Words repeated in your title and description</h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                A plain count of every non-trivial word used more than once. No score, no ranking claim.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {result.metadata.keywords.map((item) => (
                  <li
                    key={item.word}
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--foreground)]"
                  >
                    {item.word} <span className="text-[var(--muted-foreground)]">×{item.count}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">What this tool does not do</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.limitations.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
