"use client";

import { useMemo, useState } from "react";
import { Captions, Check, Copy, Download, RotateCcw } from "lucide-react";

import {
  MAX_PARAGRAPH_GAP_SECONDS,
  MIN_PARAGRAPH_GAP_SECONDS,
  DEFAULT_PARAGRAPH_GAP_SECONDS,
  READING_WPM,
  generateTranscript,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

const FORMAT_LABEL = {
  srt: "SubRip (.srt)",
  vtt: "WebVTT (.vtt)",
  json3: "YouTube json3",
  panel: "Transcript panel text",
  plain: "Plain text (no timings)",
};

const SAMPLE_CAPTIONS = `1
00:00:00,320 --> 00:00:03,120
Welcome back to the channel, and thanks

2
00:00:03,120 --> 00:00:06,480
for all the questions on the last video about captions.

3
00:00:09,000 --> 00:00:12,640
Today we are turning a caption file into a readable transcript,

4
00:00:12,640 --> 00:00:15,200
paragraph by paragraph, with timestamps kept.

5
00:00:15,200 --> 00:00:17,000
[Music]

6
00:00:21,400 --> 00:00:25,000
Let's start with where the caption file actually comes from.`;

const DEFAULT_STATE = {
  captions: SAMPLE_CAPTIONS,
  url: "",
  gap: String(DEFAULT_PARAGRAPH_GAP_SECONDS),
  removeSoundTags: true,
  dedupe: true,
  withTimestamps: true,
};

export default function ToolHome() {
  const [captions, setCaptions] = useState(DEFAULT_STATE.captions);
  const [url, setUrl] = useState(DEFAULT_STATE.url);
  const [gap, setGap] = useState(DEFAULT_STATE.gap);
  const [removeSoundTags, setRemoveSoundTags] = useState(DEFAULT_STATE.removeSoundTags);
  const [dedupe, setDedupe] = useState(DEFAULT_STATE.dedupe);
  const [withTimestamps, setWithTimestamps] = useState(DEFAULT_STATE.withTimestamps);
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      generateTranscript({
        text: captions,
        paragraphGapSeconds: Number(gap),
        removeSoundTags,
        dedupeRollingCaptions: dedupe,
        url,
      }),
    [captions, gap, removeSoundTags, dedupe, url],
  );

  const hasError = Boolean(result.error);
  const output = hasError ? "" : withTimestamps ? result.timestampedText : result.plainText;

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setCaptions(text);
    setCopied(false);
  };

  const copyResult = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const downloadTranscript = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `${result.videoId ? `${result.videoId}-` : ""}transcript.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  };

  const reset = () => {
    setCaptions(DEFAULT_STATE.captions);
    setUrl(DEFAULT_STATE.url);
    setGap(DEFAULT_STATE.gap);
    setRemoveSoundTags(DEFAULT_STATE.removeSoundTags);
    setDedupe(DEFAULT_STATE.dedupe);
    setWithTimestamps(DEFAULT_STATE.withTimestamps);
    setFileName("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Captions className="h-4 w-4" aria-hidden="true" />
          Captions to transcript
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          YouTube Transcript Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Open a video, choose <strong>Show transcript</strong>, copy the panel and paste it
          below — or upload a <code>.srt</code>, <code>.vtt</code> or <code>.json3</code>{" "}
          caption file. Everything is parsed in your browser; nothing is uploaded.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="yt-captions">
          Caption text
        </label>
        <textarea
          id="yt-captions"
          rows={10}
          className={`mt-2 ${TEXTAREA_CLASS}`}
          value={captions}
          onChange={(event) => {
            setCaptions(event.target.value);
            setCopied(false);
          }}
          placeholder="Paste the transcript panel text, or the contents of a .srt / .vtt / .json3 file"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-file">
              Or upload a caption file
            </label>
            <input
              id="yt-file"
              type="file"
              accept=".srt,.vtt,.json,.json3,.txt,text/plain"
              onChange={handleFile}
              className="mt-2 block w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-2 text-sm text-[var(--muted-foreground)] file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]"
            />
            {fileName ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Loaded {fileName}</p>
            ) : null}
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="yt-url">
              Video URL (optional, used to name the download)
            </label>
            <input
              id="yt-url"
              type="url"
              inputMode="url"
              className={`mt-2 ${INPUT_CLASS}`}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="yt-gap">
              New paragraph after a pause of (seconds)
            </label>
            <input
              id="yt-gap"
              type="number"
              inputMode="decimal"
              step="0.5"
              min={MIN_PARAGRAPH_GAP_SECONDS}
              max={MAX_PARAGRAPH_GAP_SECONDS}
              className={`mt-2 ${INPUT_CLASS}`}
              value={gap}
              onChange={(event) => setGap(event.target.value)}
            />
          </div>

          <fieldset className="grid content-end gap-2">
            <legend className={`${LABEL_CLASS} mb-1`}>Clean-up options</legend>
            <label
              className="flex min-h-11 items-center gap-3 text-sm text-[var(--foreground)]"
              htmlFor="yt-sound"
            >
              <input
                id="yt-sound"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={removeSoundTags}
                onChange={(event) => setRemoveSoundTags(event.target.checked)}
              />
              Remove [Music] style sound labels
            </label>
            <label
              className="flex min-h-11 items-center gap-3 text-sm text-[var(--foreground)]"
              htmlFor="yt-dedupe"
            >
              <input
                id="yt-dedupe"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={dedupe}
                onChange={(event) => setDedupe(event.target.checked)}
              />
              De-duplicate rolling auto-captions
            </label>
            <label
              className="flex min-h-11 items-center gap-3 text-sm text-[var(--foreground)]"
              htmlFor="yt-stamps"
            >
              <input
                id="yt-stamps"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={withTimestamps}
                onChange={(event) => setWithTimestamps(event.target.checked)}
              />
              Keep a timestamp on each paragraph
            </label>
          </fieldset>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Transcript words
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.words)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the caption input above to see the transcript."
                : `${NUM.format(result.paragraphCount)} paragraphs from ${NUM.format(result.cueCount)} caption cues, read in about ${result.readingTimeMinutes} min at ${READING_WPM} wpm.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated transcript"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy transcript"}
            </button>
            <button
              type="button"
              onClick={downloadTranscript}
              disabled={hasError}
              aria-label="Download the transcript as a text file"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the tool to the sample captions"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Detected format</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : (FORMAT_LABEL[result.format] ?? result.format)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Caption span</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : (result.durationLabel ?? "No timings")}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Speaking rate</dt>
            <dd className="text-sm font-semibold">
              {hasError || result.speakingRateWpm === null
                ? DASH
                : `${NUM.format(result.speakingRateWpm)} wpm`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Characters</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : NUM.format(result.characters)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Reading time</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${result.readingTimeMinutes} min`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Video ID</dt>
            <dd className="text-sm font-semibold">
              {hasError || !result.videoId ? DASH : result.videoId}
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <h2 className="text-sm font-semibold">Transcript</h2>
          <div className="mt-2 max-h-96 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
            {hasError ? (
              <p className="text-sm text-[var(--muted-foreground)]">{DASH}</p>
            ) : (
              result.paragraphs.map((paragraph, index) => (
                <p
                  key={`${paragraph.startLabel ?? "p"}-${index}`}
                  className="mb-3 text-sm leading-6 last:mb-0"
                >
                  {withTimestamps && paragraph.startLabel ? (
                    <span className="mr-2 font-mono text-xs font-semibold text-[var(--primary)]">
                      [{paragraph.startLabel}]
                    </span>
                  ) : null}
                  {paragraph.text}
                </p>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
