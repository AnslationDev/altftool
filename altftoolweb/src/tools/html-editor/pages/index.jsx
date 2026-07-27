"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode, RotateCcw } from "lucide-react";

import { MAX_INPUT_LENGTH, processHtml } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const MODES = [
  ["format", "Format"],
  ["minify", "Minify"],
  ["escape", "Escape"],
  ["unescape", "Unescape"],
];

const SAMPLE = `<div class="card"><h2>Pricing</h2>
<p>From <strong>&pound;9</strong> a month &mdash; cancel any time.</p>
<!-- promo copy -->
<ul><li>Unlimited exports</li><li>Priority support</li></ul>
<img src="/badge.svg" alt="Verified"><a href="/signup" class="btn">Start free</a></div>`;

const NUM = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [source, setSource] = useState(SAMPLE);
  const [mode, setMode] = useState("format");
  const [indentSize, setIndentSize] = useState("2");
  const [useTabs, setUseTabs] = useState(false);
  const [removeComments, setRemoveComments] = useState(true);
  const [aggressive, setAggressive] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      processHtml(source, {
        mode,
        indentSize: Number(indentSize),
        useTabs,
        removeComments,
        removeAllWhitespaceBetweenTags: aggressive,
      }),
    [source, mode, indentSize, useTabs, removeComments, aggressive],
  );

  const hasError = Boolean(result.error);
  const stats = hasError ? null : result.stats;

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSource(SAMPLE);
    setMode("format");
    setIndentSize("2");
    setUseTabs(false);
    setRemoveComments(true);
    setAggressive(false);
    setCopied(false);
  };

  const headline = () => {
    if (hasError) return DASH;
    if (mode === "minify") return `${NUM.format(stats.savedPercent)}%`;
    if (mode === "format") return NUM.format(stats.tags);
    return NUM.format(stats.replacements);
  };

  const headlineLabel = () => {
    if (mode === "minify") return "Bytes saved";
    if (mode === "format") return "Elements formatted";
    return mode === "escape" ? "Characters escaped" : "References decoded";
  };

  const rows = () => {
    if (hasError) {
      return [
        ["Input size", DASH],
        ["Output size", DASH],
      ];
    }
    const base = [
      ["Input size", `${NUM.format(stats.originalBytes)} bytes`],
      ["Output size", `${NUM.format(stats.outputBytes)} bytes`],
    ];
    if (mode === "minify") {
      return [
        ...base,
        ["Bytes removed", NUM.format(stats.savedBytes)],
        ["Reduction", `${NUM.format(stats.savedPercent)}%`],
        ["Elements", NUM.format(stats.tags)],
      ];
    }
    if (mode === "format") {
      return [
        ...base,
        ["Elements", NUM.format(stats.tags)],
        ["Deepest nesting", NUM.format(stats.depth)],
        [
          "Tags never closed",
          stats.unclosed.length > 0 ? stats.unclosed.map((tag) => `<${tag}>`).join(", ") : "None",
        ],
        [
          "Closed for you",
          stats.implicitlyClosed.length > 0
            ? stats.implicitlyClosed.map((tag) => `<${tag}>`).join(", ")
            : "None",
        ],
        [
          "Closing tags with no opener",
          stats.strayClosers.length > 0
            ? stats.strayClosers.map((tag) => `</${tag}>`).join(", ")
            : "None",
        ],
      ];
    }
    return [...base, ["References changed", NUM.format(stats.replacements)]];
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileCode className="h-4 w-4" aria-hidden="true" />
          HTML editor
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">HTML Editor</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Format, minify, escape and unescape HTML fragments in the browser. Void elements are never
          indented as containers, and everything inside <code>pre</code>, <code>textarea</code>,{" "}
          <code>script</code> and <code>style</code> is copied through byte for byte.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">What to do</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MODES.map(([value, label]) => (
              <label
                key={value}
                htmlFor={`mode-${value}`}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                  mode === value
                    ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                <input
                  id={`mode-${value}`}
                  type="radio"
                  name="mode"
                  className="h-4 w-4 accent-[var(--primary)]"
                  value={value}
                  checked={mode === value}
                  onChange={(event) => setMode(event.target.value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="html-source">
            HTML in ({NUM.format(source.length)} of {NUM.format(MAX_INPUT_LENGTH)} characters)
          </label>
          <textarea
            id="html-source"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={12}
            spellCheck={false}
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
        </div>

        {mode === "format" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="indent-size">
                Indent size (spaces)
              </label>
              <input
                id="indent-size"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="8"
                step="1"
                value={indentSize}
                onChange={(event) => setIndentSize(event.target.value)}
                disabled={useTabs}
              />
            </div>
            <div className="flex items-end">
              <label
                htmlFor="use-tabs"
                className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              >
                <input
                  id="use-tabs"
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={useTabs}
                  onChange={(event) => setUseTabs(event.target.checked)}
                />
                Indent with tabs
              </label>
            </div>
          </div>
        )}

        {mode === "minify" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label
              htmlFor="remove-comments"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            >
              <input
                id="remove-comments"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={removeComments}
                onChange={(event) => setRemoveComments(event.target.checked)}
              />
              Strip comments
            </label>
            <label
              htmlFor="aggressive"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            >
              <input
                id="aggressive"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={aggressive}
                onChange={(event) => setAggressive(event.target.checked)}
              />
              Drop every space between tags
            </label>
          </div>
        )}
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {headlineLabel()}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline()}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Paste an HTML fragment to see the result."
                : `${NUM.format(stats.originalBytes)} bytes in, ${NUM.format(stats.outputBytes)} bytes out`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the processed HTML to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy output"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the sample fragment" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows().map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-full p-4 font-mono text-xs leading-6 whitespace-pre text-[var(--foreground)]">
            {hasError ? DASH : result.output}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs in your browser — nothing is uploaded. &quot;Drop every space between
        tags&quot; can visually join two inline elements, so check the result before shipping it.
      </p>
    </main>
  );
}
