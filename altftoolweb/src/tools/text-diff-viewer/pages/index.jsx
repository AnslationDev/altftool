"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitCompare, RotateCcw, Save, Trash2 } from "lucide-react";

import { buildSideBySide, toMarkdownTable, versionStats } from "../lib";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE_LEFT = `## Returns policy
You may return any item within 14 days.
Refunds are issued to the original payment method.
Shipping charges are not refundable.`;

const SAMPLE_RIGHT = `## Returns policy
You may return any item within 30 days.
Refunds are issued to the original payment method.
Shipping charges are refunded on faulty items.
Exchanges are available once per order.`;

const SEGMENT_STYLES = {
  same: "",
  add: "rounded-sm bg-[var(--success-soft)] px-0.5 text-[var(--success)]",
  remove: "rounded-sm bg-[var(--danger-soft)] px-0.5 text-[var(--danger)] line-through",
};

const ROW_STYLES = {
  equal: "",
  changed: "bg-[var(--muted)]",
  added: "bg-[var(--success-soft)]",
  removed: "bg-[var(--danger-soft)]",
};

const DASH = "—";
const num = new Intl.NumberFormat("en-IN");

function Segments({ segments, hasLine }) {
  if (!segments || segments.length === 0) {
    // A blank line that matches on both sides still has a real line number
    // (hasLine) — render it as an empty cell rather than the "no counterpart
    // line" dash, so the two cases don't look identical.
    return hasLine ? (
      <span className="text-[var(--muted-foreground)]">
        <span className="sr-only">Blank line</span>
      </span>
    ) : (
      <span className="text-[var(--muted-foreground)]">{DASH}</span>
    );
  }
  return (
    <span className="whitespace-pre-wrap break-words">
      {segments.map((segment, index) => (
        <span key={`${segment.type}-${index}`} className={SEGMENT_STYLES[segment.type]}>
          {segment.text}
        </span>
      ))}
    </span>
  );
}

export default function ToolHome() {
  const [left, setLeft] = useState(SAMPLE_LEFT);
  const [right, setRight] = useState(SAMPLE_RIGHT);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [showEqual, setShowEqual] = useState(true);
  const [versions, setVersions] = useState([]);
  const [nextVersion, setNextVersion] = useState(1);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildSideBySide(left, right, { ignoreCase, ignoreWhitespace }),
    [left, right, ignoreCase, ignoreWhitespace],
  );

  const hasError = Boolean(result.error);
  const visibleRows = hasError
    ? []
    : result.rows.filter((row) => showEqual || row.type !== "equal");

  const saveVersion = () => {
    const label = `v${nextVersion}`;
    setNextVersion((value) => value + 1);
    setVersions((list) => [...list, { label, text: right, stats: versionStats(right) }]);
  };

  const loadVersion = (label, side) => {
    const found = versions.find((item) => item.label === label);
    if (!found) return;
    if (side === "left") setLeft(found.text);
    else setRight(found.text);
  };

  const removeVersion = (label) =>
    setVersions((list) => list.filter((item) => item.label !== label));

  const copyExport = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(toMarkdownTable(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the diff viewer? This clears both text boxes and discards any saved version history.",
      )
    ) {
      return;
    }
    setLeft(SAMPLE_LEFT);
    setRight(SAMPLE_RIGHT);
    setIgnoreCase(false);
    setIgnoreWhitespace(false);
    setShowEqual(true);
    setVersions([]);
    setNextVersion(1);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitCompare className="h-4 w-4" aria-hidden="true" />
          Version compare
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Text Diff Viewer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Align two versions side by side, highlight the exact words that changed inside each edited
          line, keep a version history, and export the comparison.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tdv-left">
              Before
            </label>
            <textarea
              id="tdv-left"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={10}
              spellCheck={false}
              value={left}
              onChange={(event) => setLeft(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tdv-right">
              After
            </label>
            <textarea
              id="tdv-right"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={10}
              spellCheck={false}
              value={right}
              onChange={(event) => setRight(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <label className="flex min-h-11 items-center gap-3 text-sm" htmlFor="tdv-case">
            <input
              id="tdv-case"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={ignoreCase}
              onChange={(event) => setIgnoreCase(event.target.checked)}
            />
            Ignore case
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm" htmlFor="tdv-ws">
            <input
              id="tdv-ws"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={ignoreWhitespace}
              onChange={(event) => setIgnoreWhitespace(event.target.checked)}
            />
            Ignore whitespace
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm" htmlFor="tdv-equal">
            <input
              id="tdv-equal"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={showEqual}
              onChange={(event) => setShowEqual(event.target.checked)}
            />
            Show unchanged lines
          </label>
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
                  ? "The two versions match under the current options."
                  : `${num.format(result.wordsAdded)} word(s) added, ${num.format(result.wordsRemoved)} removed`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={saveVersion} aria-label="Save the After text as a version" className={GHOST_BTN}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save version
            </button>
            <button
              type="button"
              onClick={copyExport}
              aria-label="Copy the comparison as a markdown table"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy export"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the viewer" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Churn", hasError ? DASH : `${result.churnPct}% of all words`],
            ["Lines changed", hasError ? DASH : num.format(result.changedRows)],
            ["Lines added", hasError ? DASH : num.format(result.addedRows)],
            ["Lines removed", hasError ? DASH : num.format(result.removedRows)],
            ["Lines unchanged", hasError ? DASH : num.format(result.equalRows)],
            [
              "Words",
              hasError
                ? DASH
                : `${num.format(result.leftWords)} → ${num.format(result.rightWords)}`,
            ],
            [
              "Characters",
              hasError
                ? DASH
                : `${num.format(result.leftChars)} → ${num.format(result.rightChars)}`,
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
          <h2 className="text-base font-semibold">Side by side</h2>
          <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)]">
            <table className="w-full min-w-[36rem] text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="w-10 px-2 py-2 text-right font-semibold">#</th>
                  <th scope="col" className="px-2 py-2 font-semibold">Before</th>
                  <th scope="col" className="w-10 px-2 py-2 text-right font-semibold">#</th>
                  <th scope="col" className="px-2 py-2 font-semibold">After</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, index) => (
                  <tr
                    key={`${row.type}-${row.leftNo ?? "x"}-${row.rightNo ?? "x"}-${index}`}
                    className={`border-b border-[var(--border)] last:border-0 ${ROW_STYLES[row.type]}`}
                  >
                    <td className="px-2 py-1.5 text-right align-top text-[var(--muted-foreground)]">
                      {row.leftNo ?? ""}
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <Segments segments={row.leftSegments} hasLine={row.leftNo != null} />
                    </td>
                    <td className="px-2 py-1.5 text-right align-top text-[var(--muted-foreground)]">
                      {row.rightNo ?? ""}
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <Segments segments={row.rightSegments} hasLine={row.rightNo != null} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleRows.length === 0 && (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              No rows to show — every line matches and unchanged lines are hidden.
            </p>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Version history</h2>
        {versions.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            No versions saved yet. “Save version” snapshots whatever is in the After box so you can
            compare against it later.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {versions.map((version) => (
              <li
                key={version.label}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{version.label}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {num.format(version.stats.lines)} lines · {num.format(version.stats.words)} words
                    · {num.format(version.stats.characters)} chars
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loadVersion(version.label, "left")}
                    aria-label={`Load ${version.label} into the Before box`}
                    className={GHOST_BTN}
                  >
                    Load as Before
                  </button>
                  <button
                    type="button"
                    onClick={() => loadVersion(version.label, "right")}
                    aria-label={`Load ${version.label} into the After box`}
                    className={GHOST_BTN}
                  >
                    Load as After
                  </button>
                  <button
                    type="button"
                    onClick={() => removeVersion(version.label)}
                    aria-label={`Delete ${version.label}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Similarity and churn are measured over words, not lines, so reflowing a paragraph barely
        moves them while rewriting a sentence does. Version history lives in this tab only.
      </p>
    </main>
  );
}
