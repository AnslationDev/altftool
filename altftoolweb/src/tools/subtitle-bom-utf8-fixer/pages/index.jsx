"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Subtitles } from "lucide-react";

import { analyseSubtitle, transformSubtitle } from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const SAMPLE = [
  "1",
  "00:00:01,000 --> 00:00:04,000",
  "Bienvenue à la démonstration.",
  "",
  "2",
  "00:00:05,000 --> 00:00:08,500",
  "Les accents doivent rester lisibles.",
  "",
].join("\r\n");

const DEFAULTS = {
  text: "﻿" + SAMPLE,
  bomMode: "strip",
  lineEndingMode: "crlf",
  removeStrayBoms: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const LEVEL_CLASS = {
  error: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  info: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const BOM_MODES = [
  ["strip", "Strip BOM"],
  ["add", "Add BOM"],
  ["keep", "Keep as is"],
];
const EOL_MODES = [
  ["crlf", "CRLF (SRT)"],
  ["lf", "LF (WebVTT)"],
  ["keep", "Keep as is"],
];

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [bomMode, setBomMode] = useState(DEFAULTS.bomMode);
  const [lineEndingMode, setLineEndingMode] = useState(DEFAULTS.lineEndingMode);
  const [removeStrayBoms, setRemoveStrayBoms] = useState(DEFAULTS.removeStrayBoms);
  const [copied, setCopied] = useState(false);

  const report = useMemo(() => analyseSubtitle({ text }), [text]);
  const result = useMemo(
    () => transformSubtitle({ text, bomMode, lineEndingMode, removeStrayBoms }),
    [text, bomMode, lineEndingMode, removeStrayBoms],
  );

  const copyResult = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setBomMode(DEFAULTS.bomMode);
    setLineEndingMode(DEFAULTS.lineEndingMode);
    setRemoveStrayBoms(DEFAULTS.removeStrayBoms);
    setCopied(false);
  };

  const readFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const contents = await file.text();
    setText(contents);
    setCopied(false);
  };

  const headline = result.error
    ? DASH
    : result.endsWithBom
      ? "BOM present"
      : "No BOM";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Subtitles className="h-4 w-4" aria-hidden="true" />
          Subtitle encoding
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Subtitle UTF8 BOM Fixer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add or remove the three-byte UTF-8 byte order mark (EF BB BF), normalise line endings and
          catch mojibake before an SRT or WebVTT file reaches a player. Everything runs in your
          browser; nothing is uploaded.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="sub-text">
          Subtitle file contents
        </label>
        <textarea
          id="sub-text"
          className={`mt-2 ${AREA_CLASS}`}
          rows={10}
          spellCheck={false}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setCopied(false);
          }}
        />

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="sub-file">
            Or open a .srt / .vtt / .sbv file
          </label>
          <input
            id="sub-file"
            type="file"
            accept=".srt,.vtt,.sbv,.txt,text/plain"
            onChange={readFile}
            className={`mt-2 ${INPUT_CLASS} py-2 file:mr-3 file:rounded-md file:border-0 file:bg-[var(--muted)] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--foreground)]`}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sub-bom-mode">
              Byte order mark
            </label>
            <select
              id="sub-bom-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bomMode}
              onChange={(event) => setBomMode(event.target.value)}
            >
              {BOM_MODES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sub-eol-mode">
              Line endings
            </label>
            <select
              id="sub-eol-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={lineEndingMode}
              onChange={(event) => setLineEndingMode(event.target.value)}
            >
              {EOL_MODES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex min-h-11 items-center gap-3">
          <input
            id="sub-stray"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={removeStrayBoms}
            onChange={(event) => setRemoveStrayBoms(event.target.checked)}
          />
          <label className="text-sm text-[var(--foreground)]" htmlFor="sub-stray">
            Also delete stray U+FEFF characters found inside the file
          </label>
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
              Output file starts with
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? "Nothing to convert yet"
                : `${NUM.format(result.beforeBytes)} bytes in, ${NUM.format(result.afterBytes)} bytes out (${result.byteDelta >= 0 ? "+" : ""}${NUM.format(result.byteDelta)})`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the converted subtitle file"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy output"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tool" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Detected format", report.error ? DASH : report.formatLabel],
            ["Cues found", report.error ? DASH : NUM.format(report.cueCount)],
            ["BOM in source", report.error ? DASH : report.bomPresent ? "Yes (EF BB BF)" : "No"],
            ["Stray U+FEFF inside file", report.error ? DASH : NUM.format(report.strayBoms)],
            ["Line endings in source", report.error ? DASH : report.lineEnding],
            ["Non-ASCII characters", report.error ? DASH : NUM.format(report.nonAsciiCount)],
            ["Source size (UTF-8)", report.error ? DASH : `${NUM.format(report.byteLength)} bytes`],
            ["Recommended for this file", report.error ? DASH : report.recommendedBom === "add" ? "Add the BOM" : "Strip the BOM"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

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
        <h2 className="text-base font-semibold">Converted output</h2>
        {result.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.changed
                ? `${result.bomAdded ? "BOM added. " : ""}${result.bomRemoved ? "BOM removed. " : ""}Copy this and save it as UTF-8 without letting your editor re-add a BOM.`
                : "Nothing needed changing with these settings."}
            </p>
            <div className="mt-3 overflow-x-auto">
              <pre className="min-w-full whitespace-pre rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]">
                {result.output}
              </pre>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The WebVTT specification allows an optional BOM before the WEBVTT signature but the file must
        be UTF-8 either way, so the mark is redundant there. SRT has no formal encoding rule, which is
        why some players use the BOM as their only hint that a file is UTF-8.
      </p>
    </main>
  );
}
