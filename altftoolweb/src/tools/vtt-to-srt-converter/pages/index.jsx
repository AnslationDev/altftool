"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, RotateCcw, Subtitles, Upload } from "lucide-react";
import { vttToSrt } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const SAMPLE_VTT = `WEBVTT
Kind: captions

NOTE Recorded on set, revision 3

intro
00:00:01.000 --> 00:00:04.000 line:0 align:center
<v Ada>Hello &amp; welcome back.</v>

00:00:04.500 --> 00:00:08.200
<c.loud>This week:</c> <i>caption formats</i>

00:00:08.400 --> 00:00:12.000
Everything runs in your browser.
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
  const [source, setSource] = useState(SAMPLE_VTT);
  const [fileName, setFileName] = useState("captions");
  const [offset, setOffset] = useState("0");
  const [speakerLabels, setSpeakerLabels] = useState(true);
  const [keepStyling, setKeepStyling] = useState(true);
  const [preserveAlignment, setPreserveAlignment] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef(null);

  const result = useMemo(
    () =>
      vttToSrt(source, {
        offsetMs: offset.trim() === "" ? 0 : Number(offset),
        speakerLabels,
        keepStyling,
        preserveAlignment,
      }),
    [source, offset, speakerLabels, keepStyling, preserveAlignment],
  );

  const failed = Boolean(result.error);

  const onFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const text = await file.text();
    setSource(text);
    setFileName(file.name.replace(/\.[^.]+$/, "") || "captions");
  };

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.srt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    if (failed) return;
    const blob = new Blob([result.srt], { type: "application/x-subrip;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName || "captions"}.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setSource(SAMPLE_VTT);
    setFileName("captions");
    setOffset("0");
    setSpeakerLabels(true);
    setKeepStyling(true);
    setPreserveAlignment(false);
    setCopied(false);
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Subtitles className="h-4 w-4" aria-hidden="true" />
          Subtitle formats
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">VTT To SRT Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert WebVTT captions to SubRip for editors and players that will not read .vtt. The
          WEBVTT header, NOTE, STYLE and REGION blocks and all cue settings are removed, entities
          are decoded and cues are renumbered from 1.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className={LABEL_CLASS} htmlFor="vtt-source">
            WebVTT (.vtt) input
          </label>
          <button type="button" className={GHOST_BTN} onClick={() => fileInput.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Load .vtt file
          </button>
          <input
            ref={fileInput}
            id="vtt-file"
            className="sr-only"
            type="file"
            accept=".vtt,.txt,text/vtt,text/plain"
            onChange={onFile}
            aria-label="Load a WebVTT file"
          />
        </div>
        <textarea
          id="vtt-source"
          className={`mt-2 ${AREA_CLASS}`}
          rows={10}
          spellCheck={false}
          value={source}
          onChange={(event) => setSource(event.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vtt-offset">
              Timing offset (milliseconds)
            </label>
            <input
              id="vtt-offset"
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
            <label className={LABEL_CLASS} htmlFor="vtt-name">
              Download file name
            </label>
            <input
              id="vtt-name"
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
              ["vtt-opt-voice", "Turn <v Name> voice spans into \"Name: \" prefixes", speakerLabels, setSpeakerLabels],
              ["vtt-opt-style", "Keep <b>, <i> and <u> tags", keepStyling, setKeepStyling],
              ["vtt-opt-align", "Re-express cue positioning as {\\anN} overrides", preserveAlignment, setPreserveAlignment],
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
              aria-label="Copy the SubRip output"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy SRT"}
            </button>
            <button
              type="button"
              onClick={download}
              aria-label="Download the SubRip file"
              className={PRIMARY_BTN}
              disabled={failed}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download .srt
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
            ["Output size", failed ? "—" : `${NUM.format(result.srt.length)} characters`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="vtt-output">
            SubRip output
          </label>
          <textarea
            id="vtt-output"
            className={`mt-2 ${AREA_CLASS}`}
            rows={12}
            readOnly
            spellCheck={false}
            value={failed ? "" : result.srt}
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
        Parsing happens locally in your browser — the file is never uploaded. Save the result as
        UTF-8; SubRip has no encoding declaration, so a player set to a legacy code page may show
        accented characters incorrectly.
      </p>
    </main>
  );
}
