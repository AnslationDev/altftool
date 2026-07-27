"use client";

import { useMemo, useState } from "react";
import { Braces, Check, Copy, RotateCcw } from "lucide-react";

import {
  analyseJson,
  flattenToLines,
  formatJson,
  INDENT_PRESETS,
  jsonToCsv,
  minifyJson,
  utf8Bytes,
  validateJson,
} from "../lib";

const SAMPLE = `{
  "order": "AF-10294",
  "customer": { "name": "Riya Menon", "city": "Pune" },
  "items": [
    { "sku": "TSH-01", "qty": 2, "price": 799 },
    { "sku": "MUG-04", "qty": 1, "price": 349 }
  ],
  "paid": true,
  "coupon": null
}`;

const DEFAULTS = { source: SAMPLE, mode: "format", indent: "2", sortKeys: false };

const MODES = [
  { id: "format", label: "Format (pretty-print)" },
  { id: "minify", label: "Minify" },
  { id: "flatten", label: "Flatten to dot paths" },
  { id: "csv", label: "Export array to CSV" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-48 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const pct = (value) =>
  Number.isFinite(value)
    ? `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value)}%`
    : DASH;

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-semibold break-all text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [source, setSource] = useState(DEFAULTS.source);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [indentId, setIndentId] = useState(DEFAULTS.indent);
  const [sortKeys, setSortKeys] = useState(DEFAULTS.sortKeys);
  const [copied, setCopied] = useState(false);

  const indent = useMemo(
    () => INDENT_PRESETS.find((preset) => preset.id === indentId)?.value ?? 2,
    [indentId],
  );

  const parsed = useMemo(() => validateJson(source), [source]);
  const stats = useMemo(() => (parsed.valid ? analyseJson(parsed.value) : null), [parsed]);

  const result = useMemo(() => {
    if (!parsed.valid) return { error: parsed.error };
    if (mode === "format") return formatJson(source, { indent, sortKeys });
    if (mode === "minify") return minifyJson(source);
    if (mode === "flatten") return flattenToLines(parsed.value, { sort: sortKeys });
    const csv = jsonToCsv(parsed.value);
    if (csv.error) return { error: csv.error };
    return { code: csv.csv, columns: csv.columns.length, rows: csv.rows };
  }, [parsed, mode, source, indent, sortKeys]);

  const hasError = Boolean(result.error);
  const output = hasError ? "" : result.code;

  const headline = useMemo(() => {
    if (!parsed.valid) return "Invalid";
    if (hasError) return DASH;
    if (mode === "minify") return pct(result.savedPercent);
    if (mode === "flatten") return `${num(result.paths)} paths`;
    if (mode === "csv") return `${num(result.rows)} rows`;
    return "Valid JSON";
  }, [parsed.valid, hasError, mode, result]);

  const headlineLabel =
    mode === "minify"
      ? "Size saved"
      : mode === "flatten"
        ? "Flattened paths"
        : mode === "csv"
          ? "CSV rows"
          : "Document status";

  const summary = hasError ? "" : output;

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
    setSource(DEFAULTS.source);
    setMode(DEFAULTS.mode);
    setIndentId(DEFAULTS.indent);
    setSortKeys(DEFAULTS.sortKeys);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Braces className="h-4 w-4" aria-hidden="true" />
          Offline JSON workbench
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">JSON Editor</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Validate against RFC 8259 with the exact line and column of the first fault, then
          pretty-print, minify, sort keys, flatten to dot paths, or export an array of objects to
          RFC 4180 CSV. Duplicate keys — which <code className="rounded bg-[var(--muted)] px-1">JSON.parse</code>{" "}
          silently drops — are reported too.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="json-source">
            JSON document
          </label>
          <textarea
            id="json-source"
            className={`${TEXTAREA_CLASS} mt-1`}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck="false"
            rows={12}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="json-mode">
              Output
            </label>
            <select
              id="json-mode"
              className={`${INPUT_CLASS} mt-1`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {MODES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="json-indent">
              Indent
            </label>
            <select
              id="json-indent"
              className={`${INPUT_CLASS} mt-1`}
              value={indentId}
              onChange={(event) => setIndentId(event.target.value)}
            >
              {INDENT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex min-h-11 items-center gap-3">
          <input
            id="json-sort"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={sortKeys}
            onChange={(event) => setSortKeys(event.target.checked)}
          />
          <label className={LABEL_CLASS} htmlFor="json-sort">
            Sort keys alphabetically (arrays keep their order)
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {!parsed.valid ? (
          <p role="alert" className="mb-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            Line {parsed.line}, column {parsed.column}: {parsed.error}
          </p>
        ) : null}
        {parsed.valid && hasError ? (
          <p role="alert" className="mb-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {result.error}
          </p>
        ) : null}

        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          {headlineLabel}
        </p>
        <p className="mt-1 text-4xl leading-none font-bold">{parsed.valid ? headline : DASH}</p>

        <dl className="mt-4">
          <Row label="Root type" value={stats ? stats.rootType : DASH} />
          <Row label="Top-level entries" value={stats ? num(stats.topLevelEntries) : DASH} />
          <Row label="Nesting depth" value={stats ? num(stats.depth) : DASH} />
          <Row label="Total keys" value={stats ? num(stats.keys) : DASH} />
          <Row
            label="Value counts"
            value={
              stats
                ? `${num(stats.counts.object)} obj · ${num(stats.counts.array)} arr · ${num(stats.counts.string)} str · ${num(stats.counts.number)} num · ${num(stats.counts.boolean)} bool · ${num(stats.counts.null)} null`
                : DASH
            }
          />
          <Row label="Longest array" value={stats ? `${num(stats.longestArray)} items` : DASH} />
          <Row label="Input size (UTF-8)" value={parsed.valid ? `${num(utf8Bytes(source))} bytes` : DASH} />
          <Row
            label="Duplicate keys"
            value={
              parsed.valid
                ? parsed.duplicateKeys.length === 0
                  ? "None"
                  : parsed.duplicateKeys.join(", ")
                : DASH
            }
          />
          {mode === "minify" && !hasError ? (
            <Row
              label="Minified size"
              value={`${num(result.minifiedChars)} of ${num(result.originalChars)} characters`}
            />
          ) : null}
          {mode === "csv" && !hasError ? <Row label="CSV columns" value={num(result.columns)} /> : null}
        </dl>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="json-output">
            Output
          </label>
          <textarea
            id="json-output"
            className={`${TEXTAREA_CLASS} mt-1`}
            value={output}
            readOnly
            rows={12}
            spellCheck="false"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyResult}
            aria-label="Copy the output to the clipboard"
            disabled={hasError || !parsed.valid}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs in your browser — the document is never uploaded. JSON has no comments and
        no trailing commas; if your file needs them it is JSON5 or JSONC, not JSON.
      </p>
    </main>
  );
}
