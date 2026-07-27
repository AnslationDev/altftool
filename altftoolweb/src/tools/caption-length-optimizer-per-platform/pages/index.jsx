"use client";

import { useMemo, useState } from "react";
import { AlignLeft, Check, Copy, RotateCcw } from "lucide-react";

import { PLATFORMS, analyseCaption } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const DEFAULT_CAPTION =
  "Three fixes that took my cold email reply rate from 2% to 11%.\n\nOne: cut the intro paragraph entirely. Two: ask for a 10-minute call, not a meeting. Three: send the follow-up 48 hours later, in the same thread.\n\nFull breakdown and templates here: https://example.com/cold-email-guide\n\n#coldemail #sales #freelancing";

const DEFAULT_PLATFORMS = [
  "instagram-feed",
  "tiktok",
  "x-free",
  "linkedin",
  "youtube-title",
];

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [caption, setCaption] = useState(DEFAULT_CAPTION);
  const [platformIds, setPlatformIds] = useState(DEFAULT_PLATFORMS);
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () => analyseCaption({ caption, platformIds }),
    [caption, platformIds],
  );

  const hasError = Boolean(report.error);

  const togglePlatform = (id) => {
    setPlatformIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Caption check — ${report.chars} characters, ${report.words} words, ${report.hashtags.length} hashtags, ${report.urls.length} links`,
      "",
    ];
    report.results.forEach((row) => {
      lines.push(
        `${row.label}: ${row.used}/${row.maxChars} (${row.fits ? `${row.remaining} left` : `${row.overBy} over`}), ${row.truncated ? `cut at ~${row.previewChars} chars` : "fully visible"}`,
      );
    });
    return lines.join("\n");
  }, [report, hasError]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCaption(DEFAULT_CAPTION);
    setPlatformIds(DEFAULT_PLATFORMS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AlignLeft className="h-4 w-4" aria-hidden="true" />
          Caption limits
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Caption Length Optimizer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write once, check everywhere. See each platform&apos;s hard limit, where the feed collapses
          your caption, and exactly which words survive above the fold.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="caption-text">
          Your caption
        </label>
        <textarea
          id="caption-text"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={9}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Platforms to check</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PLATFORMS.map((platform) => (
              <label
                key={platform.id}
                htmlFor={`caption-platform-${platform.id}`}
                className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold"
              >
                <input
                  id={`caption-platform-${platform.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={platformIds.includes(platform.id)}
                  onChange={() => togglePlatform(platform.id)}
                />
                <span className="min-w-0">
                  {platform.label}
                  <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                    {NUM.format(platform.maxChars)} max · ~{platform.previewChars} visible
                  </span>
                </span>
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
          {report.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Caption length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(report.chars)} chars`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : report.fitsEverywhere
                  ? "Fits every selected platform"
                  : `${report.failing.length} platform(s) will reject or clip this`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the caption length report"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the caption optimizer"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Words", hasError ? DASH : NUM.format(report.words)],
            ["Lines", hasError ? DASH : NUM.format(report.lines)],
            [
              "Hashtags",
              hasError
                ? DASH
                : `${report.hashtags.length}${report.hashtags.length ? ` (${report.hashtags.slice(0, 3).join(" ")}${report.hashtags.length > 3 ? " …" : ""})` : ""}`,
            ],
            ["Links", hasError ? DASH : NUM.format(report.urls.length)],
            [
              "Tightest platform",
              hasError || !report.tightest
                ? DASH
                : `${report.tightest.label} (${report.tightest.fits ? `${NUM.format(report.tightest.remaining)} spare` : `${NUM.format(report.tightest.overBy)} over`})`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Platform by platform</h2>
          <ul className="mt-4 space-y-3">
            {report.results.map((row) => (
              <li
                key={row.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{row.label}</span>
                  <span
                    className={
                      row.fits
                        ? "rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--success)]"
                        : "rounded-md bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]"
                    }
                  >
                    {row.fits
                      ? `${NUM.format(row.remaining)} characters spare`
                      : `${NUM.format(row.overBy)} over the limit`}
                  </span>
                </div>

                <div
                  className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${row.label}: ${NUM.format(row.used)} of ${NUM.format(row.maxChars)} characters used`}
                >
                  <span
                    className={`block h-full ${row.fits ? "bg-[var(--primary)]" : "bg-[var(--danger)]"}`}
                    style={{ width: `${Math.max(0, Math.min(100, row.usedShare * 100))}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  {NUM.format(row.used)} of {NUM.format(row.maxChars)} characters
                  {row.truncated
                    ? ` · collapses at about ${row.previewChars}, hiding ${NUM.format(row.hiddenChars)}`
                    : " · shown in full"}
                </p>

                {row.hashtagsOver > 0 && (
                  <p
                    role="alert"
                    className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs font-medium text-[var(--danger)]"
                  >
                    {row.hashtagsOver} hashtag(s) over this platform&apos;s limit of {row.maxHashtags}.
                  </p>
                )}

                <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--card)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Visible before &quot;more&quot;
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">
                    {row.visible}
                    {row.truncated && <span className="text-[var(--muted-foreground)]">… more</span>}
                  </p>
                </div>

                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{row.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Hard character limits are the platforms&apos; published values. The point at which a caption
        collapses behind &quot;more&quot; is approximate — it shifts with screen width, font size and app
        updates, so treat it as a planning guide and check a real draft on your own device.
      </p>
    </main>
  );
}
