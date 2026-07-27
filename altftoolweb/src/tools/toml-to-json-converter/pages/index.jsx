"use client";

import { useMemo, useState } from "react";
import { Braces, Check, Copy, RotateCcw } from "lucide-react";

import { DEFAULT_TOML, INDENT_OPTIONS, convertTomlToJson } from "../lib";

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

export default function ToolHome() {
  const [tomlText, setTomlText] = useState(DEFAULT_TOML);
  const [indentId, setIndentId] = useState("2");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convertTomlToJson({ tomlText, indentId }), [tomlText, indentId]);
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTomlText(DEFAULT_TOML);
    setIndentId("2");
    setCopied(false);
  };

  const stats = hasError
    ? [
        ["Keys converted", DASH],
        ["Tables", DASH],
        ["Arrays of tables", DASH],
        ["Output size", DASH],
      ]
    : [
        ["Keys converted", NUM.format(result.keys)],
        ["Tables", NUM.format(result.tables)],
        ["Arrays of tables", NUM.format(result.arrayTables)],
        ["Output size", `${NUM.format(result.outputChars)} chars`],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Braces className="h-4 w-4" aria-hidden="true" />
          Data formats
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">TOML to JSON Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a TOML config — Cargo.toml, pyproject.toml, netlify.toml — and get JSON. Tables,
          arrays of tables, dotted keys and date-times are handled per TOML 1.0, in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="t2j-input">
              TOML input
            </label>
            <textarea
              id="t2j-input"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              spellCheck="false"
              value={tomlText}
              onChange={(event) => setTomlText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="t2j-indent">
              JSON formatting
            </label>
            <select
              id="t2j-indent"
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
              JSON output
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.keys)} keys`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the JSON output"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy JSON"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset to the example TOML"
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
            <code>{hasError ? DASH : result.json}</code>
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Parsing follows the TOML v1.0.0 specification: duplicate keys and redefined tables are
        rejected, [[array of tables]] entries become JSON array elements, date-times become strings
        and inf/nan become null because RFC 8259 JSON cannot express them.
      </p>
    </main>
  );
}
