"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

import {
  ARRAY_STYLES,
  DEFAULT_FLAT,
  DEFAULT_NESTED,
  INDENT_OPTIONS,
  flattenJson,
  unflattenJson,
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
  { id: "flatten", label: "Flatten — nested to dot notation" },
  { id: "unflatten", label: "Unflatten — dot notation to nested" },
];

export default function ToolHome() {
  const [mode, setMode] = useState("flatten");
  const [nestedText, setNestedText] = useState(DEFAULT_NESTED);
  const [flatText, setFlatText] = useState(DEFAULT_FLAT);
  const [arrayStyle, setArrayStyle] = useState("bracket");
  const [indentId, setIndentId] = useState("2");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "flatten") return flattenJson({ jsonText: nestedText, arrayStyle, indentId });
    return unflattenJson({ jsonText: flatText, arrayStyle, indentId });
  }, [mode, nestedText, flatText, arrayStyle, indentId]);

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
    setNestedText(DEFAULT_NESTED);
    setFlatText(DEFAULT_FLAT);
    setArrayStyle("bracket");
    setIndentId("2");
    setCopied(false);
  };

  const headline = hasError
    ? DASH
    : mode === "flatten"
      ? `${NUM.format(result.leaves)} leaves`
      : `${NUM.format(result.keys)} paths`;

  const stats = hasError
    ? [
        [mode === "flatten" ? "Leaf values" : "Paths rebuilt", DASH],
        [mode === "flatten" ? "Max depth" : "Null-filled indices", DASH],
        ["Output size", DASH],
      ]
    : mode === "flatten"
      ? [
          ["Leaf values", NUM.format(result.leaves)],
          ["Max depth", NUM.format(result.depth)],
          ["Output size", `${NUM.format(result.outputChars)} chars`],
        ]
      : [
          ["Paths rebuilt", NUM.format(result.keys)],
          ["Null-filled indices", NUM.format(result.filledNulls)],
          ["Output size", `${NUM.format(result.outputChars)} chars`],
        ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Data formats
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          JSON Flatten / Unflatten Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Flatten nested JSON into single-level dot-notation paths — user.address.city — or rebuild
          the nested structure from flat keys. Choose bracket ([0]) or dot (.0) array indices.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jf-mode">
              Direction
            </label>
            <select
              id="jf-mode"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="jf-style">
              Array index style
            </label>
            <select
              id="jf-style"
              className={`mt-2 ${SELECT_CLASS}`}
              value={arrayStyle}
              onChange={(event) => setArrayStyle(event.target.value)}
            >
              {ARRAY_STYLES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jf-indent">
              Output formatting
            </label>
            <select
              id="jf-indent"
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
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="jf-input">
              {mode === "flatten" ? "Nested JSON input" : "Flat JSON input (path keys)"}
            </label>
            <textarea
              id="jf-input"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              spellCheck="false"
              value={mode === "flatten" ? nestedText : flatText}
              onChange={(event) =>
                mode === "flatten" ? setNestedText(event.target.value) : setFlatText(event.target.value)
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
              {mode === "flatten" ? "Flattened output" : "Nested output"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the converted JSON"
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
            <code>{hasError ? DASH : result.json}</code>
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Empty objects and arrays are kept as leaf values so they survive a round-trip. Unflattening
        rejects conflicting paths (a = 1 next to a.b = 2) instead of silently overwriting, and fills
        missing array indices with null because JSON arrays cannot have holes.
      </p>
    </main>
  );
}
