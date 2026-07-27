"use client";

import { useMemo, useState } from "react";
import { Captions, Check, Copy, RotateCcw } from "lucide-react";

import {
  CAPTION_MAX_CHARS,
  CAPTION_PREVIEW_CHARS,
  HASHTAG_SOFT_LIMIT,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
  analyseCaption,
  checkSafeZone,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const DEFAULTS = {
  caption:
    "I tested every free video editor so you don't have to - the winner surprised me\n#videoediting #creatortips #fyp",
  hashtagLimit: String(HASHTAG_SOFT_LIMIT),
  videoWidth: String(VIDEO_WIDTH),
  videoHeight: String(VIDEO_HEIGHT),
  boxLeft: "90",
  boxTop: "1520",
  boxWidth: "900",
  boxHeight: "260",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const LEVEL_CLASS = {
  error: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  info: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [caption, setCaption] = useState(DEFAULTS.caption);
  const [hashtagLimit, setHashtagLimit] = useState(DEFAULTS.hashtagLimit);
  const [videoWidth, setVideoWidth] = useState(DEFAULTS.videoWidth);
  const [videoHeight, setVideoHeight] = useState(DEFAULTS.videoHeight);
  const [boxLeft, setBoxLeft] = useState(DEFAULTS.boxLeft);
  const [boxTop, setBoxTop] = useState(DEFAULTS.boxTop);
  const [boxWidth, setBoxWidth] = useState(DEFAULTS.boxWidth);
  const [boxHeight, setBoxHeight] = useState(DEFAULTS.boxHeight);
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () => analyseCaption({ caption, hashtagLimit: Number(hashtagLimit) }),
    [caption, hashtagLimit],
  );

  const zone = useMemo(
    () =>
      checkSafeZone({
        videoWidth: Number(videoWidth),
        videoHeight: Number(videoHeight),
        boxLeft: Number(boxLeft),
        boxTop: Number(boxTop),
        boxWidth: Number(boxWidth),
        boxHeight: Number(boxHeight),
      }),
    [videoWidth, videoHeight, boxLeft, boxTop, boxWidth, boxHeight],
  );

  const summary = useMemo(() => {
    if (report.error) return "";
    const lines = [
      "TikTok Caption Spec Checker",
      `Characters: ${NUM.format(report.charCount)} of ${NUM.format(report.limit)}`,
      `Remaining: ${NUM.format(report.remaining)}`,
      `Hashtags: ${report.hashtagCount} (${NUM.format(report.hashtagChars)} chars)`,
      `Mentions: ${report.mentionCount}`,
      `Emoji: ${report.emojiCount}`,
      `Feed preview cut: ${report.previewTruncated ? `after ${CAPTION_PREVIEW_CHARS} characters` : "no cut"}`,
      `Status: ${report.status}`,
    ];
    if (!zone.error) {
      lines.push(
        `Safe zone: ${zone.fits ? "text clears the TikTok UI" : `text overlaps the UI by ${zone.worstIntrusion}px`}`,
      );
    }
    report.issues.forEach((issue) => lines.push(`- ${issue.message}`));
    return lines.join("\n");
  }, [report, zone]);

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
    setCaption(DEFAULTS.caption);
    setHashtagLimit(DEFAULTS.hashtagLimit);
    setVideoWidth(DEFAULTS.videoWidth);
    setVideoHeight(DEFAULTS.videoHeight);
    setBoxLeft(DEFAULTS.boxLeft);
    setBoxTop(DEFAULTS.boxTop);
    setBoxWidth(DEFAULTS.boxWidth);
    setBoxHeight(DEFAULTS.boxHeight);
    setCopied(false);
  };

  const barWidth = report.error ? 0 : Math.max(0, Math.min(100, report.usedPercent));
  const barTone = report.error || report.overBy > 0 ? "bg-[var(--danger)]" : "bg-[var(--primary)]";

  const previewBox = zone.error ? null : zone.rects.box;
  const previewSafe = zone.error ? null : zone.rects.safe;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Captions className="h-4 w-4" aria-hidden="true" />
          TikTok specs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">TikTok Caption Spec Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Measure a caption against TikTok&apos;s {NUM.format(CAPTION_MAX_CHARS)} character field, see what
          survives the feed truncation, and check that burned-in text clears the app&apos;s buttons and
          caption bar.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="tt-caption">
          Caption
        </label>
        <textarea
          id="tt-caption"
          className={`mt-2 ${AREA_CLASS}`}
          rows={6}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-hashtag-limit">
              Hashtag target (soft limit)
            </label>
            <input
              id="tt-hashtag-limit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              step="1"
              value={hashtagLimit}
              onChange={(event) => setHashtagLimit(event.target.value)}
            />
          </div>
        </div>
      </section>

      {report.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Characters remaining
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {report.error ? DASH : NUM.format(report.remaining)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {report.error
                ? `Limit is ${NUM.format(CAPTION_MAX_CHARS)} characters`
                : `${NUM.format(report.charCount)} of ${NUM.format(report.limit)} used (${PCT.format(report.usedPercent)}%)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the caption spec report"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span className={`block h-full ${barTone}`} style={{ width: `${barWidth}%` }} />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Characters used", report.error ? DASH : NUM.format(report.charCount)],
            ["Hashtags", report.error ? DASH : `${report.hashtagCount} (${NUM.format(report.hashtagChars)} chars)`],
            ["Mentions", report.error ? DASH : `${report.mentionCount} (${NUM.format(report.mentionChars)} chars)`],
            ["Readable copy (non-tag characters)", report.error ? DASH : NUM.format(report.wordChars)],
            ["Emoji", report.error ? DASH : NUM.format(report.emojiCount)],
            ["Line breaks", report.error ? DASH : NUM.format(report.lineBreaks)],
            [
              "Feed preview",
              report.error
                ? DASH
                : report.previewTruncated
                  ? `Cut after ${CAPTION_PREVIEW_CHARS} characters`
                  : "Shows in full",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!report.error && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              What shows before &ldquo;more&rdquo;
            </p>
            <p className="mt-2 whitespace-pre-wrap rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
              {report.preview}
              {report.previewTruncated ? <span className="text-[var(--muted-foreground)]"> {DASH} more</span> : null}
            </p>
          </div>
        )}

        {!report.error && report.issues.length > 0 && (
          <ul className="mt-4 space-y-2">
            {report.issues.map((issue) => (
              <li
                key={issue.message}
                role={issue.level === "error" ? "alert" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium ${LEVEL_CLASS[issue.level]}`}
              >
                {issue.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">On-screen text safe zone</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Enter the position of your burned-in text block. Anything outside the shaded area can be
          covered by the like and share column or the caption bar.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["tt-vw", "Frame width (px)", videoWidth, setVideoWidth],
            ["tt-vh", "Frame height (px)", videoHeight, setVideoHeight],
            ["tt-bl", "Text box left (px)", boxLeft, setBoxLeft],
            ["tt-bt", "Text box top (px)", boxTop, setBoxTop],
            ["tt-bw", "Text box width (px)", boxWidth, setBoxWidth],
            ["tt-bh", "Text box height (px)", boxHeight, setBoxHeight],
          ].map(([id, label, value, setter]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
        </div>

        {zone.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {zone.error}
          </p>
        ) : (
          <>
            <p
              className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${
                zone.fits ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"
              }`}
              role={zone.fits ? undefined : "alert"}
            >
              {zone.fits
                ? "Text clears every TikTok UI region."
                : `Text overlaps the UI by up to ${NUM.format(zone.worstIntrusion)}px.`}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,150px)_1fr] sm:items-start">
              <div
                className="relative mx-auto w-[140px] overflow-hidden rounded-md border border-[var(--border)] bg-[var(--muted)]"
                style={{ aspectRatio: `${Number(videoWidth)} / ${Number(videoHeight)}` }}
                role="img"
                aria-label={
                  zone.fits
                    ? "Preview: the text block sits inside the safe area"
                    : "Preview: the text block extends outside the safe area"
                }
              >
                {previewSafe && (
                  <span
                    className="absolute rounded-sm border border-dashed border-[var(--primary)]"
                    style={previewSafe}
                  />
                )}
                {previewBox && (
                  <span
                    className={`absolute rounded-sm ${zone.fits ? "bg-[var(--primary)]/40" : "bg-[var(--danger)]/40"}`}
                    style={previewBox}
                  />
                )}
              </div>

              <dl className="divide-y divide-[var(--border)] text-sm">
                {[
                  ["Safe area", `${NUM.format(zone.safeWidth)} x ${NUM.format(zone.safeHeight)} px`],
                  ["Safe area share of frame", `${PCT.format(zone.safeAreaPercent)}%`],
                  ["Overlap left", `${NUM.format(zone.intrusions.left)} px`],
                  ["Overlap top", `${NUM.format(zone.intrusions.top)} px`],
                  ["Overlap right (buttons)", `${NUM.format(zone.intrusions.right)} px`],
                  ["Overlap bottom (caption bar)", `${NUM.format(zone.intrusions.bottom)} px`],
                  [
                    "Suggested position",
                    `${NUM.format(zone.suggestion.left)}, ${NUM.format(zone.suggestion.top)} at ${NUM.format(zone.suggestion.width)} x ${NUM.format(zone.suggestion.height)} px`,
                  ],
                  ["9:16 frame", zone.isPortrait916 ? "Yes" : "No - TikTok will letterbox or crop"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Safe-zone margins are the widely used creator-template values for a 1080 x 1920 frame, not a
        published TikTok API. The app redraws its interface from time to time, so leave headroom and
        preview the upload before you publish.
      </p>
    </main>
  );
}
