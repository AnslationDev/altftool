"use client";

import { useMemo, useRef, useState } from "react";
import { AlignLeft, Check, Copy, Download, RotateCcw, Upload } from "lucide-react";
import { srtToTranscript } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const SAMPLE_SRT = `1
00:00:01,000 --> 00:00:04,000
Welcome back to the show.

2
00:00:04,500 --> 00:00:08,200
<i>This week we are looking at</i>
caption formats.

3
00:00:08,400 --> 00:00:10,000
[APPLAUSE]

4
00:00:14,000 --> 00:00:17,500
>> Everything here runs in your browser.
`;

const GAP_PRESETS = [
  ["Tight", 1000],
  ["Natural", 2000],
  ["Loose", 4000],
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [source, setSource] = useState(SAMPLE_SRT);
  const [fileName, setFileName] = useState("transcript");
  const [gap, setGap] = useState("2000");
  const [removeSoundCues, setRemoveSoundCues] = useState(true);
  const [dedupeLines, setDedupeLines] = useState(true);
  const [keepSpeakerMarkers, setKeepSpeakerMarkers] = useState(false);
  const [includeTimestamps, setIncludeTimestamps] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef(null);

  const result = useMemo(
    () =>
      srtToTranscript(source, {
        paragraphGapMs: gap.trim() === "" ? 0 : Number(gap),
        removeSoundCues,
        dedupeLines,
        keepSpeakerMarkers,
        includeTimestamps,
      }),
    [source, gap, removeSoundCues, dedupeLines, keepSpeakerMarkers, includeTimestamps],
  );

  const failed = Boolean(result.error);

  const onFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const text = await file.text();
    setSource(text);
    setFileName(`${file.name.replace(/\.[^.]+$/, "") || "transcript"}-transcript`);
  };

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    if (failed) return;
    const blob = new Blob([result.transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName || "transcript"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setSource(SAMPLE_SRT);
    setFileName("transcript");
    setGap("2000");
    setRemoveSoundCues(true);
    setDedupeLines(true);
    setKeepSpeakerMarkers(false);
    setIncludeTimestamps(false);
    setCopied(false);
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AlignLeft className="h-4 w-4" aria-hidden="true" />
          Subtitle formats
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">SRT To Plain Transcript</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Drop the cue numbers, timecodes and caption markup and get readable prose. Lines are
          re-flowed into paragraphs wherever the speaker paused, so the result reads like a
          transcript rather than a wall of caption fragments.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className={LABEL_CLASS} htmlFor="txt-source">
            SubRip (.srt) input
          </label>
          <button type="button" className={GHOST_BTN} onClick={() => fileInput.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Load .srt file
          </button>
          <input
            ref={fileInput}
            id="txt-file"
            className="sr-only"
            type="file"
            accept=".srt,.txt,text/plain"
            onChange={onFile}
            aria-label="Load a SubRip file"
          />
        </div>
        <textarea
          id="txt-source"
          className={`mt-2 ${AREA_CLASS}`}
          rows={10}
          spellCheck={false}
          value={source}
          onChange={(event) => setSource(event.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="txt-gap">
              New paragraph after a pause of (ms)
            </label>
            <input
              id="txt-gap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60000"
              step="250"
              value={gap}
              onChange={(event) => setGap(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {GAP_PRESETS.map(([label, value]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setGap(String(value))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="txt-name">
              Download file name
            </label>
            <input
              id="txt-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Clean-up options</legend>
          <div className="mt-2 grid gap-2">
            {[
              ["txt-opt-sound", "Remove [MUSIC], ♪ and other non-speech captions", removeSoundCues, setRemoveSoundCues],
              ["txt-opt-dupe", "Collapse repeated roll-up caption lines", dedupeLines, setDedupeLines],
              ["txt-opt-speaker", "Keep >> speaker-change markers", keepSpeakerMarkers, setKeepSpeakerMarkers],
              ["txt-opt-stamp", "Prefix each paragraph with [hh:mm:ss]", includeTimestamps, setIncludeTimestamps],
            ].map(([id, label, value, setter]) => (
              <label key={id} className="flex min-h-11 items-center gap-3 text-sm" htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  className={CHECK_CLASS}
                  checked={value}
                  onChange={(event) => setter(event.target.checked)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Words in the transcript
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : NUM.format(result.wordCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Nothing converted yet."
                : `${NUM.format(result.paragraphCount)} paragraphs from ${NUM.format(result.cueCount)} cues`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the transcript"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy text"}
            </button>
            <button
              type="button"
              onClick={download}
              aria-label="Download the transcript as a text file"
              className={PRIMARY_BTN}
              disabled={failed}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download .txt
            </button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Characters", failed ? "—" : NUM.format(result.charCount)],
            ["Speaking rate", failed ? "—" : `${NUM.format(result.speakingRateWpm)} words per minute`],
            ["Reading time at 238 wpm", failed ? "—" : `${DEC.format(result.readingTimeMinutes)} min`],
            ["Non-speech captions removed", failed ? "—" : NUM.format(result.soundCuesRemoved)],
            ["Duplicate lines collapsed", failed ? "—" : NUM.format(result.duplicatesRemoved)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="txt-output">
            Transcript
          </label>
          <textarea
            id="txt-output"
            className={`mt-2 ${AREA_CLASS}`}
            rows={12}
            readOnly
            spellCheck={false}
            value={failed ? "" : result.transcript}
          />
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Files are parsed locally in your browser and never uploaded. Captions are written to be read
        in sync with speech, so proofread the result before publishing it as a transcript.
      </p>
    </main>
  );
}
