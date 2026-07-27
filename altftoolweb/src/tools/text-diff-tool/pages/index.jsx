"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileDiff, RotateCcw } from "lucide-react";

import { DEFAULT_CONTEXT_LINES, compareText } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE_LEFT = `Refund window: 14 days
Shipping: flat 49 per order
Support hours: 9am to 6pm IST
Returns are collected from your address
Warranty: 12 months`;

const SAMPLE_RIGHT = `Refund window: 30 days
Shipping: free above 999, otherwise 49
Support hours: 9am to 6pm IST
Returns are collected from your address
Warranty: 12 months
Exchanges: one per order`;

const DASH = "—";
const num = new Intl.NumberFormat("en-IN");

const ROW_STYLES = {
  equal: "",
  insert: "bg-[var(--success-soft)] text-[var(--success)]",
  delete: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const ROW_MARKS = { equal: " ", insert: "+", delete: "-" };

export default function ToolHome() {
  const [left, setLeft] = useState(SAMPLE_LEFT);
  const [right, setRight] = useState(SAMPLE_RIGHT);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [context, setContext] = useState(String(DEFAULT_CONTEXT_LINES));
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareText(left, right, {
        ignoreCase,
        ignoreWhitespace,
        context: Number(context),
      }),
    [left, right, ignoreCase, ignoreWhitespace, context],
  );

  const hasError = Boolean(result.error);

  const copyDiff = async () => {
    if (hasError || !result.unified) return;
    try {
      await navigator.clipboard.writeText(result.unified);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setLeft(SAMPLE_LEFT);
    setRight(SAMPLE_RIGHT);
    setIgnoreCase(false);
    setIgnoreWhitespace(false);
    setContext(String(DEFAULT_CONTEXT_LINES));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileDiff className="h-4 w-4" aria-hidden="true" />
          Compare
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Text Diff Tool</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compare two blocks of text line by line, see exactly which lines were added and removed,
          and copy the result as a unified diff.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="diff-left">
              Original
            </label>
            <textarea
              id="diff-left"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={10}
              spellCheck={false}
              value={left}
              onChange={(event) => setLeft(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="diff-right">
              Changed
            </label>
            <textarea
              id="diff-right"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={10}
              spellCheck={false}
              value={right}
              onChange={(event) => setRight(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-3 text-sm" htmlFor="diff-case">
            <input
              id="diff-case"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={ignoreCase}
              onChange={(event) => setIgnoreCase(event.target.checked)}
            />
            Ignore letter case
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm" htmlFor="diff-ws">
            <input
              id="diff-ws"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={ignoreWhitespace}
              onChange={(event) => setIgnoreWhitespace(event.target.checked)}
            />
            Ignore whitespace changes
          </label>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="diff-context">
              Context lines in the unified diff
            </label>
            <input
              id="diff-context"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={context}
              onChange={(event) => setContext(event.target.value)}
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Similarity
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
              {hasError ? DASH : `${result.similarityPct}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : result.identical
                  ? "The two sides are identical under the current options."
                  : `${num.format(result.added)} line(s) added, ${num.format(result.removed)} removed`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyDiff}
              aria-label="Copy the unified diff"
              className={GHOST_BTN}
              disabled={hasError || !result.unified}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy diff"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset both sides" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Lines added", hasError ? DASH : num.format(result.added)],
            ["Lines removed", hasError ? DASH : num.format(result.removed)],
            ["Lines unchanged", hasError ? DASH : num.format(result.unchanged)],
            [
              "Line count",
              hasError
                ? DASH
                : `${num.format(result.leftLineCount)} → ${num.format(result.rightLineCount)} (${result.lineDelta > 0 ? "+" : ""}${num.format(result.lineDelta)})`,
            ],
            [
              "Characters",
              hasError
                ? DASH
                : `${num.format(result.leftChars)} → ${num.format(result.rightChars)} (${result.charDelta > 0 ? "+" : ""}${num.format(result.charDelta)})`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Line by line</h2>
          <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)]">
            <table className="w-full min-w-[30rem] text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="w-12 px-2 py-2 text-right font-semibold">Old</th>
                  <th scope="col" className="w-12 px-2 py-2 text-right font-semibold">New</th>
                  <th scope="col" className="w-6 px-1 py-2 font-semibold" />
                  <th scope="col" className="px-2 py-2 font-semibold">Line</th>
                </tr>
              </thead>
              <tbody>
                {result.ops.map((op, index) => (
                  <tr
                    key={`${op.type}-${index}`}
                    className={`border-b border-[var(--border)] last:border-0 ${ROW_STYLES[op.type]}`}
                  >
                    <td className="px-2 py-1.5 text-right align-top text-[var(--muted-foreground)]">
                      {op.leftNo ?? ""}
                    </td>
                    <td className="px-2 py-1.5 text-right align-top text-[var(--muted-foreground)]">
                      {op.rightNo ?? ""}
                    </td>
                    <td className="px-1 py-1.5 align-top font-bold">{ROW_MARKS[op.type]}</td>
                    <td className="whitespace-pre-wrap break-words px-2 py-1.5 align-top">
                      {op.type === "insert" ? op.right : op.left}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && result.unified && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Unified diff</h2>
          <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre className="min-w-0 font-mono text-xs leading-5 text-[var(--foreground)]">
              {result.unified}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Similarity is the Dice coefficient over lines: twice the number of common lines divided by
        the total line count of both sides. Two identical files score 100%.
      </p>
    </main>
  );
}
