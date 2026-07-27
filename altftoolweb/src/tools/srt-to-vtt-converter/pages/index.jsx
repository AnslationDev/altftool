"use client";

import { useMemo, useRef, useState } from "react";
import { Captions, Check, Copy, Download, RotateCcw, Upload } from "lucide-react";
import { srtToVtt } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const SAMPLE_SRT = `1
00:00:01,000 --> 00:00:04,000
Welcome back to the show.

2
00:00:04,500 --> 00:00:08,200
{\\an8}This week: subtitles & caption formats.

3
00:00:08,400 --> 00:00:12,000
<i>Everything runs in your browser.</i>
`;

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
  const [fileName, setFileName] = useState("subtitles");
  const [offset, setOffset] = useState("0");
  const [keepCueNumbers, setKeepCueNumbers] = useState(true);
  const [convertAlignTags, setConvertAlignTags] = useState(true);
  const [stripFontTags, setStripFontTags] = useState(true);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef(null);

  const result = useMemo(
    () =>
      srtToVtt(source, {
        offsetMs: offset.trim() === "" ? 0 : Number(offset),
        keepCueNumbers,
        convertAlignTags,
        stripFontTags,
      }),
    [source, offset, keepCueNumbers, convertAlignTags, stripFontTags],
  );

  const failed = Boolean(result.error);

  const onFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const text = await file.text();
    setSource(text);
    setFileName(file.name.replace(/\.[^.]+$/, "") || "subtitles");
  };

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.vtt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    if (failed) return;
    const blob = new Blob([result.vtt], { type: "text/vtt;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName || "subtitles"}.vtt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setSource(SAMPLE_SRT);
    setFileName("subtitles");
    setOffset("0");
    setKeepCueNumbers(true);
    setConvertAlignTags(true);
    setStripFontTags(true);
    setCopied(false);
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Captions className="h-4 w-4" aria-hidden="true" />
          Subtitle formats
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">SRT To VTT Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a SubRip file into a WebVTT file that HTML5 <code>&lt;track&gt;</code> accepts:
          comma timestamps become full stops, the WEBVTT header is added, and stray SubRip
          coordinates or font tags are cleaned up. Nothing leaves your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className={LABEL_CLASS} htmlFor="srt-source">
            SubRip (.srt) input
          </label>
          <button type="button" className={GHOST_BTN} onClick={() => fileInput.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Load .srt file
          </button>
          <input
            ref={fileInput}
            id="srt-file"
            className="sr-only"
            type="file"
            accept=".srt,.txt,text/plain"
            onChange={onFile}
            aria-label="Load a SubRip file"
          />
        </div>
        <textarea
          id="srt-source"
          className={`mt-2 ${AREA_CLASS}`}
          rows={10}
          spellCheck={false}
          value={source}
          onChange={(event) => setSource(event.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="srt-offset">
              Timing offset (milliseconds)
            </label>
            <input
              id="srt-offset"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              step="100"
              value={offset}
              onChange={(event) => setOffset(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Negative values pull captions earlier. 1000 ms = 1 second.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="srt-name">
              Download file name
            </label>
            <input
              id="srt-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Conversion options</legend>
          <div className="mt-2 grid gap-2">
            {[
              ["srt-opt-numbers", "Keep cue numbers as WebVTT cue identifiers", keepCueNumbers, setKeepCueNumbers],
              ["srt-opt-align", "Convert {\\anN} alignment tags to cue settings", convertAlignTags, setConvertAlignTags],
              ["srt-opt-font", "Remove <font> tags (not valid in WebVTT)", stripFontTags, setStripFontTags],
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
              Cues converted
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : NUM.format(result.cueCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Nothing converted yet." : `${NUM.format(result.lineCount)} caption lines`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the WebVTT output"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy VTT"}
            </button>
            <button
              type="button"
              onClick={download}
              aria-label="Download the WebVTT file"
              className={PRIMARY_BTN}
              disabled={failed}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download .vtt
            </button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["First cue starts", failed ? "—" : result.firstStart],
            ["Last cue ends", failed ? "—" : result.lastEnd],
            ["Caption lines", failed ? "—" : NUM.format(result.lineCount)],
            ["Output size", failed ? "—" : `${NUM.format(result.vtt.length)} characters`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="srt-output">
            WebVTT output
          </label>
          <textarea
            id="srt-output"
            className={`mt-2 ${AREA_CLASS}`}
            rows={12}
            readOnly
            spellCheck={false}
            value={failed ? "" : result.vtt}
          />
        </div>

        {!failed && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-1 text-xs text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Files are parsed locally with JavaScript — nothing is uploaded. Save the output as UTF-8 and
        serve it with the <code>text/vtt</code> content type, or browsers will refuse the track.
      </p>
    </main>
  );
}
