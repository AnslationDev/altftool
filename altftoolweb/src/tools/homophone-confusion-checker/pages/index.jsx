"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SpellCheck } from "lucide-react";

import { analyseText, setStats } from "../lib";

const INPUT_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");

const SAMPLE = `Their is to many small errors in this draft, and I should of caught them earlier.
Your welcome to send edits — its a lot easier than rewriting the whole thing.
The principle of the school asked whether the stationary order had past the approvals desk.`;

export default function ToolHome() {
  const [text, setText] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => setStats(), []);
  const report = useMemo(() => analyseText(text), [text]);
  const failed = Boolean(report.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Homophone check",
      `${NUM.format(report.wordCount)} words · ${report.issueCount} likely errors · ${report.setsTouched} confusable sets present`,
      "",
    ];
    if (report.issueCount === 0) {
      lines.push("No high-confidence homophone errors found.");
    } else {
      for (const issue of report.issues) {
        lines.push(`line ${issue.line}: "${issue.found}" → "${issue.suggestion}" — ${issue.why}`);
      }
    }
    return lines.join("\n");
  }, [failed, report]);

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
    setText(SAMPLE);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SpellCheck className="h-4 w-4" aria-hidden="true" />
          Proofreading
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Homophone Confusion Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {stats.rules} patterns that are certainly wrong get a suggested fix. Every word from{" "}
          {stats.sets} confusable sets is listed for a second read. Nothing leaves your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="homophone-text">
          Your text
        </label>
        <textarea
          id="homophone-text"
          className={`mt-2 min-h-[10rem] ${INPUT_CLASS}`}
          rows={8}
          value={text}
          placeholder="Paste an email, an essay or a page of copy…"
          onChange={(event) => setText(event.target.value)}
        />
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Likely errors
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : NUM.format(report.issueCount)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the homophone report"
              className={GHOST_BTN}
              disabled={!summary}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the text box to the sample"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {failed ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {report.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Words checked", failed ? DASH : NUM.format(report.wordCount)],
            ["Characters", failed ? DASH : NUM.format(report.charCount)],
            ["High-confidence fixes", failed ? DASH : NUM.format(report.issueCount)],
            ["Confusable words present", failed ? DASH : NUM.format(report.watchWordCount)],
            ["Confusable sets touched", failed ? DASH : NUM.format(report.setsTouched)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {failed ? null : (
        <section className="mt-6">
          <h2 className="text-base font-semibold">Fixes</h2>
          {report.issueCount === 0 ? (
            <p
              role="status"
              className="mt-3 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-3 text-sm text-[var(--muted-foreground)]"
            >
              No high-confidence homophone errors found. Still worth reading the watch list below —
              those words need a human eye.
            </p>
          ) : (
            <ul className="mt-3 grid gap-3">
              {report.issues.map((issue) => (
                <li
                  key={`${issue.ruleId}-${issue.index}`}
                  className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Line {issue.line}
                  </p>
                  <p className="mt-1 text-base font-semibold">
                    <span className="text-[var(--danger)]">{issue.found}</span>
                    <span className="px-2 text-[var(--muted-foreground)]">→</span>
                    <span className="text-[var(--success)]">{issue.suggestion}</span>
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">{issue.why}</p>
                  <p className="mt-2 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                    {issue.context}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {failed || report.setsTouched === 0 ? null : (
        <section className="mt-6">
          <h2 className="text-base font-semibold">Watch list — check these yourself</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            These are correctly spelled words with look-alike partners. Only you can tell which one
            you meant.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">In your text</th>
                  <th scope="col" className="py-2 font-semibold">The whole set</th>
                </tr>
              </thead>
              <tbody>
                {report.watchlist.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 align-top">
                      {row.found.map((item) => (
                        <span
                          key={item.word}
                          className="mr-2 inline-block rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)]"
                        >
                          {item.word} ×{item.count}
                        </span>
                      ))}
                    </td>
                    <td className="py-2 align-top">
                      <ul className="grid gap-1">
                        {row.words.map((item) => (
                          <li key={item.word}>
                            <span className="font-semibold">{item.word}</span>
                            <span className="text-[var(--muted-foreground)]"> — {item.meaning}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is a homophone check, not a spelling or grammar checker. Rare but legitimate uses exist
        for a few flagged phrases, so read each suggestion before accepting it.
      </p>
    </main>
  );
}
