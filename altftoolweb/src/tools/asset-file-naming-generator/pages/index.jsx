"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, RotateCcw } from "lucide-react";

import {
  CASE_STYLES,
  DATE_FORMATS,
  DATE_POSITIONS,
  SEPARATORS,
  buildBatch,
  buildFileName,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  tokens: "altftool\nlanding page\nhero export",
  separator: "hyphen",
  caseStyle: "lower",
  date: "2026-07-28",
  dateFormat: "iso",
  datePosition: "prefix",
  sequence: "1",
  sequencePad: "3",
  extension: "png",
  count: "6",
};

export default function ToolHome() {
  const [tokens, setTokens] = useState(DEFAULTS.tokens);
  const [separator, setSeparator] = useState(DEFAULTS.separator);
  const [caseStyle, setCaseStyle] = useState(DEFAULTS.caseStyle);
  const [date, setDate] = useState(DEFAULTS.date);
  const [dateFormat, setDateFormat] = useState(DEFAULTS.dateFormat);
  const [datePosition, setDatePosition] = useState(DEFAULTS.datePosition);
  const [sequence, setSequence] = useState(DEFAULTS.sequence);
  const [sequencePad, setSequencePad] = useState(DEFAULTS.sequencePad);
  const [extension, setExtension] = useState(DEFAULTS.extension);
  const [count, setCount] = useState(DEFAULTS.count);
  const [copied, setCopied] = useState(false);

  const config = useMemo(
    () => ({
      tokens: tokens.split(/\n+/).map((item) => item.trim()).filter(Boolean),
      separator,
      caseStyle,
      date,
      dateFormat,
      datePosition,
      sequence: sequence === "" ? null : Number(sequence),
      sequencePad: Number(sequencePad),
      extension,
    }),
    [tokens, separator, caseStyle, date, dateFormat, datePosition, sequence, sequencePad, extension],
  );

  const single = useMemo(() => buildFileName(config), [config]);
  const batch = useMemo(() => buildBatch(config, Number(count)), [config, count]);
  const failed = Boolean(single.error || batch.error);

  const copyText = async () => {
    const text = batch.names ? batch.names.join("\n") : single.name;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTokens(DEFAULTS.tokens);
    setSeparator(DEFAULTS.separator);
    setCaseStyle(DEFAULTS.caseStyle);
    setDate(DEFAULTS.date);
    setDateFormat(DEFAULTS.dateFormat);
    setDatePosition(DEFAULTS.datePosition);
    setSequence(DEFAULTS.sequence);
    setSequencePad(DEFAULTS.sequencePad);
    setExtension(DEFAULTS.extension);
    setCount(DEFAULTS.count);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Safe file names
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Asset File Naming Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Generate sortable, Windows-safe names for exports, design assets and content batches with ISO
          dates, padded sequence numbers and consistent casing.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="afn-tokens">
              Name parts, one per line
            </label>
            <textarea
              id="afn-tokens"
              className="mt-2 min-h-28 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={tokens}
              onChange={(event) => setTokens(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="afn-separator">
              Separator
            </label>
            <select id="afn-separator" className={`mt-2 ${INPUT_CLASS}`} value={separator} onChange={(event) => setSeparator(event.target.value)}>
              {SEPARATORS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="afn-case">
              Case style
            </label>
            <select id="afn-case" className={`mt-2 ${INPUT_CLASS}`} value={caseStyle} onChange={(event) => setCaseStyle(event.target.value)}>
              {CASE_STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="afn-date">
              Date
            </label>
            <input id="afn-date" className={`mt-2 ${INPUT_CLASS}`} type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="afn-date-format">
              Date format
            </label>
            <select id="afn-date-format" className={`mt-2 ${INPUT_CLASS}`} value={dateFormat} onChange={(event) => setDateFormat(event.target.value)}>
              {DATE_FORMATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="afn-date-position">
              Date position
            </label>
            <select id="afn-date-position" className={`mt-2 ${INPUT_CLASS}`} value={datePosition} onChange={(event) => setDatePosition(event.target.value)}>
              {DATE_POSITIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="afn-extension">
              Extension
            </label>
            <input id="afn-extension" className={`mt-2 ${INPUT_CLASS}`} value={extension} onChange={(event) => setExtension(event.target.value)} placeholder="png" />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="afn-sequence">
              Sequence start
            </label>
            <input id="afn-sequence" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" step="1" value={sequence} onChange={(event) => setSequence(event.target.value)} />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="afn-pad">
              Sequence padding
            </label>
            <input id="afn-pad" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="10" step="1" value={sequencePad} onChange={(event) => setSequencePad(event.target.value)} />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="afn-count">
              Batch count
            </label>
            <input id="afn-count" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="200" step="1" value={count} onChange={(event) => setCount(event.target.value)} />
          </div>
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {single.error || batch.error}
        </p>
      )}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Generated names</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {single.name ? `${single.name.length} characters in the first file name` : "Fix the inputs to preview names."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={GHOST_BTN} type="button" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button className={PRIMARY_BTN} type="button" onClick={copyText} disabled={failed}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <pre className="mt-4 max-h-72 overflow-auto rounded-lg bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--foreground)]">
          {(batch.names || [single.name]).filter(Boolean).join("\n") || "—"}
        </pre>

        {single.warnings?.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-[var(--warning-text)]">
            {single.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
