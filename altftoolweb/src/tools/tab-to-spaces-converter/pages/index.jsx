"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, IndentIncrease, RotateCcw } from "lucide-react";
import { LINE_ENDINGS, MAX_TAB_SIZE, MIN_TAB_SIZE, convert } from "../lib";

const DASH = "—";

const SAMPLE = [
  "function totals(rows) {",
  "\tlet sum = 0;\t// running total",
  "\tfor (const row of rows) {",
  "\t\tsum += row.amount;",
  "\t}",
  "\treturn sum;",
  "}",
].join("\n");

const intFmt = new Intl.NumberFormat("en-US");

const TAB_SIZES = [1, 2, 3, 4, 6, 8, 12, 16];

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-medium text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

function describeIndent(indent) {
  if (!indent) return DASH;
  if (indent.style === "none") return "no indentation";
  if (indent.style === "tabs") return `tabs (${intFmt.format(indent.tabLines)} lines)`;
  if (indent.style === "spaces")
    return `spaces${indent.size ? `, ${indent.size} wide` : ""} (${intFmt.format(indent.spaceLines)} lines)`;
  return `mixed — ${intFmt.format(indent.tabLines)} tab, ${intFmt.format(indent.spaceLines)} space, ${intFmt.format(indent.mixedLines)} both`;
}

export default function TabToSpacesConverterPage() {
  const [text, setText] = useState(SAMPLE);
  const [direction, setDirection] = useState("tabsToSpaces");
  const [tabSize, setTabSize] = useState("4");
  const [leadingOnly, setLeadingOnly] = useState(true);
  const [trimTrailing, setTrimTrailing] = useState(false);
  const [lineEnding, setLineEnding] = useState("keep");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convert(text, { direction, tabSize, leadingOnly, trimTrailing, lineEnding }),
    [text, direction, tabSize, leadingOnly, trimTrailing, lineEnding],
  );
  const hasError = Boolean(result.error);

  async function handleCopy() {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function handleDownload() {
    if (hasError) return;
    const blob = new Blob([result.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    setText(SAMPLE);
    setDirection("tabsToSpaces");
    setTabSize("4");
    setLeadingOnly(true);
    setTrimTrailing(false);
    setLineEnding("keep");
    setCopied(false);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-start gap-3">
        <IndentIncrease
          className="mt-1 h-6 w-6 shrink-0 text-[var(--primary)]"
          aria-hidden="true"
        />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Tab to Spaces Converter
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Each tab advances to the next tab stop rather than becoming a fixed number of
            spaces, so aligned comments and tables stay aligned.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="input-text" className="text-sm font-medium text-[var(--foreground)]">
          Input
        </label>
        <textarea
          id="input-text"
          rows={10}
          value={text}
          spellCheck={false}
          onChange={(e) => {
            setText(e.target.value);
            setCopied(false);
          }}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
        />
      </div>

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="direction" className="text-sm font-medium text-[var(--foreground)]">
            Direction
          </label>
          <select
            id="direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          >
            <option value="tabsToSpaces">Tabs → spaces</option>
            <option value="spacesToTabs">Spaces → tabs</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="tab-size" className="text-sm font-medium text-[var(--foreground)]">
            Tab size (columns)
          </label>
          <select
            id="tab-size"
            value={tabSize}
            onChange={(e) => setTabSize(e.target.value)}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          >
            {TAB_SIZES.filter((s) => s >= MIN_TAB_SIZE && s <= MAX_TAB_SIZE).map((s) => (
              <option key={s} value={String(s)}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="line-ending" className="text-sm font-medium text-[var(--foreground)]">
            Line endings
          </label>
          <select
            id="line-ending"
            value={lineEnding}
            onChange={(e) => setLineEnding(e.target.value)}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          >
            {LINE_ENDINGS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="leading-only"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)]"
          >
            <input
              id="leading-only"
              type="checkbox"
              checked={leadingOnly}
              onChange={() => setLeadingOnly((v) => !v)}
              disabled={direction !== "spacesToTabs"}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            <span>Indentation only (safer for string literals)</span>
          </label>
          <label
            htmlFor="trim-trailing"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)]"
          >
            <input
              id="trim-trailing"
              type="checkbox"
              checked={trimTrailing}
              onChange={() => setTrimTrailing((v) => !v)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            <span>Trim trailing whitespace</span>
          </label>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          disabled={hasError}
          aria-label="Copy the converted text to the clipboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-50"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied!" : "Copy result"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={hasError}
          aria-label="Download the converted text as a file"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset to the sample code and default options"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {hasError ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm text-[var(--muted-foreground)]">Lines changed</p>
        <p className="mt-1 text-4xl leading-tight font-semibold text-[var(--foreground)]">
          {hasError ? DASH : intFmt.format(result.changedLines)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError ? DASH : `of ${intFmt.format(result.lines)} lines`}
        </p>

        <dl className="mt-4">
          <Row label="Indentation before" value={hasError ? DASH : describeIndent(result.before)} />
          <Row label="Indentation after" value={hasError ? DASH : describeIndent(result.after)} />
          <Row
            label="Tab characters"
            value={
              hasError
                ? DASH
                : `${intFmt.format(result.tabsBefore)} → ${intFmt.format(result.tabsAfter)}`
            }
          />
          <Row
            label="Size"
            value={
              hasError
                ? DASH
                : `${intFmt.format(result.originalBytes)} B → ${intFmt.format(result.outputBytes)} B (${
                    result.byteChange >= 0 ? "+" : ""
                  }${intFmt.format(result.byteChange)})`
            }
          />
          <Row label="Tab stops every" value={hasError ? DASH : `${result.tabSize} columns`} />
        </dl>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-medium text-[var(--foreground)]">Output</h2>
        <pre className="max-h-96 overflow-auto rounded-xl bg-[var(--card)] p-4 font-mono text-xs whitespace-pre text-[var(--foreground)] ring-1 ring-[var(--border)]">
          {hasError ? DASH : result.output}
        </pre>
      </section>
    </div>
  );
}
