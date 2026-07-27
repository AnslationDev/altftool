"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, RotateCcw } from "lucide-react";

import {
  DEFAULT_JSON_ARRAY,
  DEFAULT_NDJSON,
  INDENT_OPTIONS,
  convertJsonToNdjson,
  convertNdjsonToJson,
} from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SELECT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[16rem] w-full resize-y rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const MODES = [
  { id: "toJson", label: "NDJSON → JSON array" },
  { id: "toNdjson", label: "JSON array → NDJSON" },
];

export default function ToolHome() {
  const [mode, setMode] = useState("toJson");
  const [ndjsonText, setNdjsonText] = useState(DEFAULT_NDJSON);
  const [jsonText, setJsonText] = useState(DEFAULT_JSON_ARRAY);
  const [indentId, setIndentId] = useState("2");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "toJson") return convertNdjsonToJson({ ndjsonText, indentId });
    return convertJsonToNdjson({ jsonText });
  }, [mode, ndjsonText, jsonText, indentId]);

  const hasError = Boolean(result.error);
  const output = hasError ? "" : mode === "toJson" ? result.json : result.ndjson;

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setNdjsonText(DEFAULT_NDJSON);
    setJsonText(DEFAULT_JSON_ARRAY);
    setIndentId("2");
    setCopied(false);
  };

  const stats = hasError
    ? [
        ["Records", DASH],
        ["Input size", DASH],
        ["Output size", DASH],
      ]
    : [
        ["Records", NUM.format(result.records)],
        ["Input size", `${NUM.format(result.inputChars)} chars`],
        ["Output size", `${NUM.format(result.outputChars)} chars`],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Data formats
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">NDJSON to JSON Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn newline-delimited JSON logs and exports into a JSON array, or unwrap a JSON array back
          into one record per line. Bad lines are reported by number.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nd-mode">
              Direction
            </label>
            <select
              id="nd-mode"
              className={`mt-2 ${SELECT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {MODES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {mode === "toJson" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="nd-indent">
                JSON formatting
              </label>
              <select
                id="nd-indent"
                className={`mt-2 ${SELECT_CLASS}`}
                value={indentId}
                onChange={(event) => setIndentId(event.target.value)}
              >
                {INDENT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nd-input">
              {mode === "toJson" ? "NDJSON input (one JSON value per line)" : "JSON array input"}
            </label>
            <textarea
              id="nd-input"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              spellCheck="false"
              value={mode === "toJson" ? ndjsonText : jsonText}
              onChange={(event) =>
                mode === "toJson" ? setNdjsonText(event.target.value) : setJsonText(event.target.value)
              }
            />
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {mode === "toJson" ? "JSON array output" : "NDJSON output"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.records)} records`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the converted output"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy output"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset both inputs to the examples"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {stats.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="p-4 text-xs leading-5">
            <code>{hasError ? DASH : output}</code>
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        NDJSON (JSON Lines) holds one complete RFC 8259 JSON value per line, so pretty-printed JSON
        is not valid NDJSON and values written out are minified per line. Blank lines are skipped and
        CRLF line endings are handled.
      </p>
    </main>
  );
}
