"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Info,
  RotateCcw,
  Share2,
  XCircle,
} from "lucide-react";

import {
  PLATFORMS,
  analyseAllPlatforms,
  analysePost,
  buildReport,
  initials,
  tokenizePost,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";

const WARN_CLASS = {
  error: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warn: "bg-[var(--warning-soft)] text-[var(--warning)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
};

const WARN_ICON = {
  error: XCircle,
  warn: AlertTriangle,
  info: Info,
};

const DEFAULTS = {
  text:
    "We rebuilt the whole checkout on the edge and shaved 380 ms off the median.\n\nThe write-up covers what broke, what we measured and the two things we would not do again: https://altftool.com/blog/edge-checkout\n\n#webperf #engineering",
  platformId: "linkedin",
  authorName: "Priya Raghavan",
  authorHandle: "priyabuilds",
  authorMeta: "Staff Engineer · Platform",
  timestamp: "2h",
};

function Token({ token }) {
  if (token.type === "text") return <>{token.value}</>;
  return <span className="text-[var(--primary)]">{token.value}</span>;
}

function Body({ text, className }) {
  const tokens = tokenizePost(text);
  return (
    <span className={className}>
      {tokens.map((token, index) => (
        <Token key={`${index}-${token.value}`} token={token} />
      ))}
    </span>
  );
}

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [platformId, setPlatformId] = useState(DEFAULTS.platformId);
  const [authorName, setAuthorName] = useState(DEFAULTS.authorName);
  const [authorHandle, setAuthorHandle] = useState(DEFAULTS.authorHandle);
  const [authorMeta, setAuthorMeta] = useState(DEFAULTS.authorMeta);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analysePost({ text, platformId }), [text, platformId]);
  const table = useMemo(() => analyseAllPlatforms(text), [text]);
  const report = useMemo(() => (result.error ? "" : buildReport(result)), [result]);

  const copyResult = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset the composer? This will clear your post text and author details.")
    ) {
      return;
    }
    setText(DEFAULTS.text);
    setPlatformId(DEFAULTS.platformId);
    setAuthorName(DEFAULTS.authorName);
    setAuthorHandle(DEFAULTS.authorHandle);
    setAuthorMeta(DEFAULTS.authorMeta);
    setExpanded(false);
    setCopied(false);
  };

  const meterWidth = result.error
    ? 0
    : Math.max(0, Math.min(100, (result.counted / result.limit) * 100));
  const isResultOver = !result.error && Boolean(result.over || result.overBytes);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Feed preview
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Social Media Simulator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type a post once and see how each network will actually render it — where the feed crops
          the body, which link disappears behind &ldquo;more&rdquo;, and how many units it costs under
          that platform&rsquo;s own counting rules. X&rsquo;s weighted algorithm, Bluesky&rsquo;s
          grapheme and byte caps and Mastodon&rsquo;s flat 23-per-link are all implemented properly,
          so the numbers match what the composer will show you.
        </p>
      </header>

      {/* ------------------------------------------------------------------ */}
      <section className={`${CARD} mb-6`} aria-labelledby="compose">
        <h2 id="compose" className="mb-4 text-lg font-semibold">
          Compose
        </h2>

        <label className={LABEL_CLASS} htmlFor="sms-text">
          Post body
        </label>
        <textarea
          id="sms-text"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={7}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write the post here…"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="sms-name">
              Display name
            </label>
            <input
              id="sms-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sms-handle">
              Handle
            </label>
            <input
              id="sms-handle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={authorHandle}
              onChange={(event) => setAuthorHandle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sms-meta">
              Headline or subtitle
            </label>
            <input
              id="sms-meta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={authorMeta}
              onChange={(event) => setAuthorMeta(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Preview as</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {PLATFORMS.map((platform) => {
              const active = platform.id === platformId;
              return (
                <button
                  key={platform.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setPlatformId(platform.id);
                    setExpanded(false);
                  }}
                  className={
                    active
                      ? "inline-flex min-h-11 items-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
                      : "inline-flex min-h-11 items-center rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--primary)]"
                  }
                >
                  {platform.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      </section>

      {/* ------------------------------------------------------------------ */}
      {result.error ? (
        <div
          role="alert"
          className="rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </div>
      ) : (
        <>
          <section className={`${CARD} mb-6`} aria-labelledby="preview">
            <div aria-live="polite" role="status">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 id="preview" className="text-lg font-semibold">
                  {result.platform.name} feed
                </h2>
                <span
                  className={
                    isResultOver
                      ? "rounded px-2 py-1 text-sm font-semibold bg-[var(--danger-soft)] text-[var(--danger)]"
                      : "rounded px-2 py-1 text-sm font-semibold bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }
                >
                  {result.counted} / {result.limit} {result.platform.unit}
                </span>
              </div>

              <div
                className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${result.counted} of ${result.limit} ${result.platform.unit} used`}
              >
                <div
                  className={
                    isResultOver
                      ? "h-full rounded-full bg-[var(--danger)]"
                      : "h-full rounded-full bg-[var(--primary)]"
                  }
                  style={{ width: `${meterWidth}%` }}
                />
              </div>
            </div>

            {/* ---- the mock feed card ---- */}
            <article className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="flex items-start gap-3">
                <div
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-sm font-semibold text-[var(--muted-foreground)]"
                >
                  {initials(authorName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold">{authorName || "Your name"}</span>
                    {result.platform.handleStyle.includes("@") && (
                      <span className="text-sm text-[var(--muted-foreground)]">
                        @{authorHandle || "handle"}
                        {result.platform.id === "bluesky" ? ".bsky.social" : ""}
                        {result.platform.id === "mastodon" ? "@mastodon.social" : ""}
                      </span>
                    )}
                    <span className="text-sm text-[var(--muted-foreground)]">
                      · {DEFAULTS.timestamp}
                    </span>
                  </div>
                  {result.platform.id === "linkedin" && authorMeta ? (
                    <p className="text-xs text-[var(--muted-foreground)]">{authorMeta}</p>
                  ) : null}

                  <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
                    <Body text={result.preview.visible} />
                    {result.preview.truncated && !expanded ? (
                      <>
                        <span className="text-[var(--muted-foreground)]">… </span>
                        <button
                          type="button"
                          className="min-h-11 align-baseline text-sm font-semibold text-[var(--primary)] underline"
                          onClick={() => setExpanded(true)}
                        >
                          see more
                        </button>
                      </>
                    ) : null}
                    {result.preview.truncated && expanded ? (
                      <span className="rounded bg-[var(--warning-soft)] text-[var(--warning)]">
                        <Body text={result.preview.hidden} />
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--border)] pt-3 text-xs font-medium text-[var(--muted-foreground)]">
                    {result.platform.engagement.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {result.preview.truncated ? (
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                Highlighted text is what sits behind the crop.{" "}
                {expanded ? (
                  <button
                    type="button"
                    className="font-semibold text-[var(--primary)] underline"
                    onClick={() => setExpanded(false)}
                  >
                    Collapse it again
                  </button>
                ) : null}
              </p>
            ) : (
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                {result.platform.name} shows this post in full — there is no feed crop at this
                length.
              </p>
            )}
          </section>

          {/* ---- counts ---- */}
          <section className={`${CARD} mb-6`} aria-labelledby="counts">
            <h2 id="counts" className="mb-4 text-lg font-semibold">
              What is in the post
            </h2>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                ["Graphemes", result.graphemes],
                ["Code points", result.codePoints],
                ["UTF-8 bytes", result.bytes],
                ["Lines", result.entities.lineCount],
                ["Links", result.entities.urls.length],
                ["Hashtags", result.entities.hashtags.length],
                ["Mentions", result.entities.mentions.length],
                ["Emoji", result.entities.emojiCount],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-[var(--muted)] p-3">
                  <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    {label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {result.entities.firstLine ? (
              <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
                First line, which is the part every feed shows before anything else:{" "}
                <span className="text-[var(--foreground)]">
                  &ldquo;{result.entities.firstLine}&rdquo;
                </span>
              </p>
            ) : null}
          </section>

          {/* ---- warnings ---- */}
          {result.warnings.length > 0 && (
            <section className={`${CARD} mb-6`} aria-labelledby="notes">
              <h2 id="notes" className="mb-4 text-lg font-semibold">
                Notes for {result.platform.name}
              </h2>
              <ul className="space-y-2">
                {result.warnings.map((item) => {
                  const Icon = WARN_ICON[item.level];
                  return (
                    <li
                      key={item.message}
                      role={item.level === "error" ? "alert" : undefined}
                      className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm leading-6 ${WARN_CLASS[item.level]}`}
                    >
                      <Icon className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{item.message}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* ---- all platforms ---- */}
          <section className={`${CARD} mb-6`} aria-labelledby="all">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="all" className="text-lg font-semibold">
                The same post everywhere
              </h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={GHOST_BTN} onClick={copyResult}>
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy report"}
                </button>
                <button type="button" className={PRIMARY_BTN} onClick={reset}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Platform
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Counted
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Left
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Feed crop
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(table.rows || []).map((row) => {
                    const isOver = row.over || row.overBytes;
                    return (
                      <tr key={row.id} className="border-b border-[var(--border)]">
                        <td className="py-3 pr-3 font-medium whitespace-nowrap">{row.name}</td>
                        <td className="py-3 pr-3 whitespace-nowrap">
                          {row.counted} / {row.limit}
                        </td>
                        <td
                          className={`py-3 pr-3 whitespace-nowrap ${isOver ? "font-semibold text-[var(--danger)]" : "text-[var(--muted-foreground)]"}`}
                        >
                          {row.over
                            ? `${Math.abs(row.remaining)} over`
                            : row.overBytes
                              ? `${row.remaining} (over byte cap)`
                              : row.remaining}
                        </td>
                        <td className="py-3 text-[var(--muted-foreground)]">
                          {row.truncated ? `${row.hiddenCount} characters hidden` : "shown in full"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* ---- platform rules ---- */}
          <section className={CARD} aria-labelledby="rules">
            <h2 id="rules" className="mb-3 text-lg font-semibold">
              How {result.platform.name} counts
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.platform.docs.map((item) => (
                <li key={item}>{item}</li>
              ))}
              {result.platform.previewCharsMobile ? (
                <li>
                  Mobile crops earlier than desktop — about{" "}
                  {result.platform.previewCharsMobile} characters instead of{" "}
                  {result.platform.previewChars}.
                </li>
              ) : null}
            </ul>
            <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
              Character caps come from each platform&rsquo;s published limits. Feed crop points are
              rendering behaviour rather than documented API values, so they are shown as
              approximate. Nothing here calls a social API, signs you in or uploads your draft — the
              whole page runs on the text in the box.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
