"use client";

import { useMemo, useState } from "react";
import { Check, Code2, Copy, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  analyseJavaScript,
  formatJavaScript,
  INDENT_PRESETS,
  minifyJavaScript,
} from "../lib";

const SAMPLE = `// Cart helpers
const TAX_RATE = 0.18;

function lineTotal(item) {
  const gross = item.price * item.qty;
  return gross + gross * TAX_RATE;
}

export const cartTotal = (items = []) =>
  items.reduce((sum, item) => sum + lineTotal(item), 0);
`;

const DEFAULTS = { source: SAMPLE, mode: "format", indent: "2" };

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
  Number.isFinite(value) ? `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value)}%` : DASH;

const MODES = [
  { id: "format", label: "Format" },
  { id: "minify", label: "Minify" },
  { id: "inspect", label: "Inspect" },
];

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
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const indent = useMemo(
    () => INDENT_PRESETS.find((preset) => preset.id === indentId)?.value ?? "  ",
    [indentId],
  );

  const formatted = useMemo(() => formatJavaScript(source, { indent }), [source, indent]);
  const minified = useMemo(() => minifyJavaScript(source), [source]);
  const stats = useMemo(() => analyseJavaScript(source), [source]);

  const active = mode === "format" ? formatted : mode === "minify" ? minified : stats;
  const hasError = Boolean(active.error);
  const output = mode === "inspect" ? "" : hasError ? "" : active.code;

  const headline = useMemo(() => {
    if (hasError) return DASH;
    if (mode === "format") return `${num(formatted.lines)} lines`;
    if (mode === "minify") return pct(minified.savedPercent);
    return num(stats.cyclomaticComplexity);
  }, [hasError, mode, formatted, minified, stats]);

  const headlineLabel =
    mode === "format" ? "Formatted output" : mode === "minify" ? "Size saved" : "Cyclomatic complexity";

  const summary = useMemo(() => {
    if (hasError) return "";
    if (mode === "inspect") {
      return [
        "JavaScript inspection",
        `Characters: ${num(stats.characters)} (${num(stats.bytes)} bytes)`,
        `Lines: ${num(stats.lines)} — ${num(stats.codeLines)} code, ${num(stats.commentLines)} comment, ${num(stats.blankLines)} blank`,
        `Functions: ${num(stats.functions)} classic, ${num(stats.arrowFunctions)} arrow`,
        `Declarations: ${num(stats.constDeclarations)} const, ${num(stats.letDeclarations)} let, ${num(stats.varDeclarations)} var`,
        `Cyclomatic complexity: ${num(stats.cyclomaticComplexity)} (${num(stats.decisionPoints)} decision points)`,
        `Brackets balanced: ${stats.balanced ? "yes" : `no — ${stats.issues.join("; ")}`}`,
      ].join("\n");
    }
    return output;
  }, [hasError, mode, stats, output]);

  const copyResult = () => {
    if (!summary) return;
    copy("result", summary, { label: "result" });
  };

  const reset = () => {
    const hasContentToLose = source.trim() !== "" && source !== DEFAULTS.source;
    if (
      hasContentToLose &&
      !window.confirm("Reset will replace your JavaScript input with the sample code. Continue?")
    ) {
      return;
    }
    setSource(DEFAULTS.source);
    setMode(DEFAULTS.mode);
    setIndentId(DEFAULTS.indent);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Code2 className="h-4 w-4" aria-hidden="true" />
          Runs in your browser
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">JavaScript Tools</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Re-indent a snippet, strip comments and redundant whitespace, or count what is actually in
          it. The scanner understands strings, template literals and regular expressions, so a{" "}
          <code className="rounded bg-[var(--muted)] px-1">{"//"}</code> inside a URL is never mistaken
          for a comment.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="js-source">
            JavaScript
          </label>
          <textarea
            id="js-source"
            className={`${TEXTAREA_CLASS} mt-1`}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck="false"
            rows={12}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="js-mode">
              What to do
            </label>
            <select
              id="js-mode"
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
            <label className={LABEL_CLASS} htmlFor="js-indent">
              Indent (formatting)
            </label>
            <select
              id="js-indent"
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
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {hasError ? (
          <p role="alert" className="mb-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {active.error}
          </p>
        ) : null}

        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          {headlineLabel}
        </p>
        <p className="mt-1 text-4xl leading-none font-bold">{headline}</p>

        {mode === "minify" && !hasError ? (
          <dl className="mt-4">
            <Row label="Original size" value={`${num(minified.originalChars)} characters`} />
            <Row label="Minified size" value={`${num(minified.minifiedChars)} characters`} />
            <Row label="Removed" value={`${num(minified.savedChars)} characters`} />
          </dl>
        ) : null}

        {mode === "format" && !hasError ? (
          <dl className="mt-4">
            <Row label="Indent" value={INDENT_PRESETS.find((preset) => preset.id === indentId)?.label} />
            <Row label="Output lines" value={num(formatted.lines)} />
            <Row label="Brackets balanced" value={stats.error ? DASH : stats.balanced ? "Yes" : "No"} />
          </dl>
        ) : null}

        {mode === "inspect" && !hasError ? (
          <dl className="mt-4">
            <Row label="Characters / bytes" value={`${num(stats.characters)} / ${num(stats.bytes)}`} />
            <Row
              label="Lines"
              value={`${num(stats.lines)} total · ${num(stats.codeLines)} code · ${num(stats.commentLines)} comment · ${num(stats.blankLines)} blank`}
            />
            <Row label="Comment ratio" value={pct(stats.commentRatio)} />
            <Row
              label="Functions"
              value={`${num(stats.functions)} function · ${num(stats.arrowFunctions)} arrow · ${num(stats.classes)} class`}
            />
            <Row
              label="Declarations"
              value={`${num(stats.constDeclarations)} const · ${num(stats.letDeclarations)} let · ${num(stats.varDeclarations)} var`}
            />
            <Row label="Imports / exports" value={`${num(stats.imports)} / ${num(stats.exports)}`} />
            <Row
              label="Literals"
              value={`${num(stats.stringLiterals)} string · ${num(stats.templateLiterals)} template · ${num(stats.regexLiterals)} regex`}
            />
            <Row label="console.* calls" value={num(stats.consoleCalls)} />
            <Row label="TODO / FIXME / HACK" value={num(stats.todos)} />
            <Row
              label="Longest line"
              value={`${num(stats.longestLineLength)} chars (line ${num(stats.longestLineNumber)})`}
            />
            <Row
              label="Brackets balanced"
              value={stats.balanced ? "Yes" : stats.issues.join("; ")}
            />
          </dl>
        ) : null}

        {mode !== "inspect" ? (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="js-output">
              Output
            </label>
            <textarea
              id="js-output"
              className={`${TEXTAREA_CLASS} mt-1`}
              value={output}
              readOnly
              rows={12}
              spellCheck="false"
            />
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyResult}
            aria-label="Copy the result to the clipboard"
            disabled={hasError}
          >
            {isCopied("result") ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {isCopied("result") ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {announcement}
          </span>
        </div>
      </section>

      <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
        The minifier removes comments and redundant whitespace only — it never renames variables and
        never joins lines, so automatic semicolon insertion behaves exactly as before. For
        production bundles use a full compressor such as the one built into your bundler.
      </p>
    </main>
  );
}
