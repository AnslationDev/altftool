"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, Copy, FileVideo, RotateCcw } from "lucide-react";

import {
  buildFileNames,
  CASE_STYLES,
  DEFAULT_PATTERN,
  MAX_FILENAME_BYTES,
  MAX_PADDING,
  MIN_PADDING,
  parseOutline,
  PATTERN_TOKENS,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  courseCode: "AI101",
  pattern: DEFAULT_PATTERN,
  caseStyle: "kebab",
  extension: "mp4",
  padding: "2",
  startModule: "1",
  startLesson: "1",
  outline: `Module: Getting Started
- Welcome and course map
- Installing the tools
- Your first render
Module: Editing Foundations
- Cutting on action
- Colour and sound pass
Module: Publishing
- Export presets
- Uploading and captions`,
};

const DASH = "—";

export default function ToolHome() {
  const [courseCode, setCourseCode] = useState(DEFAULTS.courseCode);
  const [pattern, setPattern] = useState(DEFAULTS.pattern);
  const [caseStyle, setCaseStyle] = useState(DEFAULTS.caseStyle);
  const [extension, setExtension] = useState(DEFAULTS.extension);
  const [padding, setPadding] = useState(DEFAULTS.padding);
  const [startModule, setStartModule] = useState(DEFAULTS.startModule);
  const [startLesson, setStartLesson] = useState(DEFAULTS.startLesson);
  const [outline, setOutline] = useState(DEFAULTS.outline);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const result = useMemo(
    () =>
      buildFileNames({
        courseCode,
        modules: parseOutline(outline),
        pattern,
        caseStyle,
        extension,
        numberPadding: Number(padding),
        startModule: Number(startModule),
        startLesson: Number(startLesson),
      }),
    [courseCode, outline, pattern, caseStyle, extension, padding, startModule, startLesson],
  );

  const hasError = Boolean(result.error);
  const files = hasError ? [] : result.files;

  const copyResult = async () => {
    if (hasError || files.length === 0) return;
    try {
      await navigator.clipboard.writeText(files.map((file) => file.name).join("\n"));
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCourseCode(DEFAULTS.courseCode);
    setPattern(DEFAULTS.pattern);
    setCaseStyle(DEFAULTS.caseStyle);
    setExtension(DEFAULTS.extension);
    setPadding(DEFAULTS.padding);
    setStartModule(DEFAULTS.startModule);
    setStartLesson(DEFAULTS.startLesson);
    setOutline(DEFAULTS.outline);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileVideo className="h-4 w-4" aria-hidden="true" />
          Course production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Course Video Naming Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your module and lesson outline, pick a pattern, and get one consistent, zero-padded,
          filesystem-safe file name per lesson — checked against the {MAX_FILENAME_BYTES}-byte name
          limit, reserved Windows names and duplicates.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cvn-course">
              Course code
            </label>
            <input
              id="cvn-course"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={courseCode}
              onChange={(event) => setCourseCode(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvn-pattern">
              Naming pattern
            </label>
            <input
              id="cvn-pattern"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvn-case">
              Case style
            </label>
            <select
              id="cvn-case"
              className={`mt-2 ${INPUT_CLASS}`}
              value={caseStyle}
              onChange={(event) => setCaseStyle(event.target.value)}
            >
              {CASE_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvn-ext">
              File extension
            </label>
            <input
              id="cvn-ext"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={extension}
              onChange={(event) => setExtension(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvn-padding">
              Number padding (digits)
            </label>
            <input
              id="cvn-padding"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_PADDING}
              max={MAX_PADDING}
              step="1"
              value={padding}
              onChange={(event) => setPadding(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="cvn-start-module">
                First module no.
              </label>
              <input
                id="cvn-start-module"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={startModule}
                onChange={(event) => setStartModule(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="cvn-start-lesson">
                First lesson no.
              </label>
              <input
                id="cvn-start-lesson"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={startLesson}
                onChange={(event) => setStartLesson(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="cvn-outline">
            Course outline (module lines, lessons indented or bulleted)
          </label>
          <textarea
            id="cvn-outline"
            className={`mt-2 ${AREA_CLASS}`}
            rows={10}
            value={outline}
            onChange={(event) => setOutline(event.target.value)}
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <ul className="flex min-w-max gap-2 text-xs text-[var(--muted-foreground)]">
            {PATTERN_TOKENS.map((item) => (
              <li key={item.token}>
                <button
                  type="button"
                  title={item.meaning}
                  onClick={() => setPattern((current) => `${current}${item.token}`)}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {item.token}
                </button>
              </li>
            ))}
          </ul>
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              File names generated
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.totalFiles)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to generate names."
                : `across ${NUM.format(result.moduleCount)} module${result.moduleCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy all generated file names"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy names"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Modules", hasError ? DASH : NUM.format(result.moduleCount)],
            ["Lessons", hasError ? DASH : NUM.format(result.totalFiles)],
            [
              "Longest name",
              hasError ? DASH : `${NUM.format(result.longestBytes)} of ${MAX_FILENAME_BYTES} bytes`,
            ],
            ["Duplicate names", hasError ? DASH : NUM.format(result.duplicateFileCount)],
            ["Warnings", hasError ? DASH : NUM.format(result.warningCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-live="polite"
          aria-atomic="true"
        >
          <h2 className="text-base font-semibold">Generated names</h2>
          <div className="mt-3 max-h-96 overflow-y-auto overflow-x-auto">
            <ol className="min-w-max space-y-1 font-mono text-xs leading-6">
              {files.map((file) => (
                <li key={`${file.globalNumber}-${file.name}`} className="flex items-start gap-2">
                  <span className="w-8 shrink-0 text-right text-[var(--muted-foreground)]">
                    {file.globalNumber}
                  </span>
                  <span className="break-all">
                    {file.name}
                    {file.warnings.length > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 font-sans text-[11px] font-semibold text-[var(--danger)]">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        {file.warnings[0]}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Names are lower-cased for kebab and snake style so they behave the same on case-sensitive
        Linux servers and case-insensitive macOS or Windows volumes. Keep the pattern fixed for the
        whole course so files sort in teaching order in any file manager.
      </p>
    </main>
  );
}
